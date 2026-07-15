import mongoose from 'mongoose';
import GastoFijo from '../models/GastoFijo.js';
import Transaccion from '../models/Transaccion.js';
import Deuda from '../models/Deuda.js';

export const crearGastoFijo = async (req, res) => {
    try {
        const { nombre, monto, categoria, diaPago, deudaId } = req.body;
        const usuarioId = req.usuario._id;

        const nuevoGasto = new GastoFijo({
            usuarioId,
            nombre,
            monto,
            categoria,
            diaPago,
            deudaId: deudaId || null
        });

        await nuevoGasto.save();

        res.status(201).json({
            success: true,
            msg: 'Gasto fijo registrado correctamente',
            gastoFijo: nuevoGasto
        });
    } catch (error) {
        console.error('Error al crear gasto fijo:', error);
        res.status(500).json({ msg: 'Error al registrar el gasto fijo' });
    }
};

export const obtenerGastosFijos = async (req, res) => {
    try {
        const usuarioId = req.usuario._id;

        const gastos = await GastoFijo.find({ usuarioId, activo: true }).sort({ nombre: 1 });

        res.json({
            success: true,
            gastosFijos: gastos
        });
    } catch (error) {
        console.error('Error al obtener gastos fijos:', error);
        res.status(500).json({ msg: 'Error al cargar los gastos fijos' });
    }
};

export const editarGastoFijo = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, monto, categoria, diaPago, deudaId } = req.body;
        const usuarioId = req.usuario._id;

        const gasto = await GastoFijo.findById(id);
        if (!gasto) {
            return res.status(404).json({ msg: 'Gasto fijo no encontrado' });
        }
        if (gasto.usuarioId.toString() !== usuarioId.toString()) {
            return res.status(403).json({ msg: 'No tienes permiso para editar este gasto fijo' });
        }

        gasto.nombre = nombre || gasto.nombre;
        gasto.monto = monto || gasto.monto;
        gasto.categoria = categoria || gasto.categoria;
        gasto.diaPago = diaPago || gasto.diaPago;
        gasto.deudaId = deudaId !== undefined ? (deudaId || null) : gasto.deudaId;

        await gasto.save();

        res.json({
            success: true,
            msg: 'Gasto fijo actualizado correctamente',
            gastoFijo: gasto
        });
    } catch (error) {
        console.error('Error al editar gasto fijo:', error);
        res.status(500).json({ msg: 'Error al actualizar el gasto fijo' });
    }
};

export const eliminarGastoFijo = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioId = req.usuario._id;

        const gasto = await GastoFijo.findById(id);
        if (!gasto) {
            return res.status(404).json({ msg: 'Gasto fijo no encontrado' });
        }
        if (gasto.usuarioId.toString() !== usuarioId.toString()) {
            return res.status(403).json({ msg: 'No tienes permiso para eliminar este gasto fijo' });
        }

        await GastoFijo.findByIdAndDelete(id);

        res.json({
            success: true,
            msg: 'Gasto fijo eliminado correctamente'
        });
    } catch (error) {
        console.error('Error al eliminar gasto fijo:', error);
        res.status(500).json({ msg: 'Error al eliminar el gasto fijo' });
    }
};

export const registrarTodosEsteMes = async (req, res) => {
    try {
        const usuarioId = req.usuario._id;
        const hoy = new Date();
        const mes = hoy.getMonth() + 1;
        const anio = hoy.getFullYear();

        const gastosFijos = await GastoFijo.find({ usuarioId, activo: true });

        if (gastosFijos.length === 0) {
            return res.status(400).json({ msg: 'No tienes gastos fijos registrados' });
        }

        const inicioMes = new Date(Date.UTC(anio, mes - 1, 1, 0, 0, 0));
        const finMes = new Date(Date.UTC(anio, mes, 0, 23, 59, 59));

        const yaRegistrados = await Transaccion.find({
            usuarioId,
            tipo: 'gasto',
            descripcion: { $regex: '^\\[Fijo\\]', $options: 'i' },
            fecha: { $gte: inicioMes, $lte: finMes }
        });

        const nombresRegistrados = yaRegistrados.map(t =>
            t.descripcion.replace('[Fijo] ', '').toLowerCase()
        );

        const pendientes = gastosFijos.filter(g =>
            !nombresRegistrados.includes(g.nombre.toLowerCase())
        );

        if (pendientes.length === 0) {
            return res.status(400).json({
                msg: `Ya registraste todos tus gastos fijos este mes (${yaRegistrados.length} encontrados). Revisa tus movimientos.`
            });
        }

        // 1. Obtener todas las deudas involucradas en una sola consulta
        const deudaIdsInvolucrados = pendientes.filter(g => g.deudaId).map(g => g.deudaId);
        const deudas = await Deuda.find({ _id: { $in: deudaIdsInvolucrados }, usuarioId });
        const deudasMap = new Map(deudas.map(d => [d._id.toString(), d]));

        const transaccionesACrear = [];
        const actualizacionesDeudas = [];

        for (const g of pendientes) {
            // Si tiene deuda vinculada, verificar que exista y no esté ya liquidada
            let deuda = null;
            if (g.deudaId) {
                deuda = deudasMap.get(g.deudaId.toString());
                if (deuda && deuda.estado === 'liquidada') {
                    continue; // Omitir el registro del gasto si la deuda está liquidada
                }
            }

            // Generar una ID temporal para la transacción y así poder asociarla al historial de abonos
            const transaccionId = new mongoose.Types.ObjectId();

            transaccionesACrear.push({
                _id: transaccionId,
                usuarioId,
                tipo: 'gasto',
                monto: g.monto,
                categoria: g.categoria,
                descripcion: `[Fijo] ${g.nombre}`,
                fecha: new Date(Date.UTC(anio, mes - 1, Math.min(g.diaPago, 28), 12, 0, 0))
            });

            if (deuda && deuda.estado === 'pendiente') {
                const saldoPendiente = deuda.montoTotal - deuda.montoPagado;
                const montoAbono = Math.min(g.monto, saldoPendiente);

                deuda.montoPagado += montoAbono;
                const nuevoAbono = {
                    transaccionId: transaccionId,
                    montoAbonado: montoAbono,
                    fechaAbono: new Date()
                };
                deuda.historialAbonos.push(nuevoAbono);

                if (deuda.montoPagado >= deuda.montoTotal) {
                    deuda.estado = 'liquidada';
                }

                // Guardar la operación de actualización para bulkWrite
                actualizacionesDeudas.push({
                    updateOne: {
                        filter: { _id: deuda._id },
                        update: {
                            $set: {
                                montoPagado: deuda.montoPagado,
                                estado: deuda.estado
                            },
                            $push: {
                                historialAbonos: nuevoAbono
                            }
                        }
                    }
                });
            }
        }

        // 2. Insertar transacciones de golpe
        if (transaccionesACrear.length > 0) {
            await Transaccion.insertMany(transaccionesACrear);
        }

        // 3. Actualizar todas las deudas en una sola llamada por lotes
        if (actualizacionesDeudas.length > 0) {
            await Deuda.bulkWrite(actualizacionesDeudas);
        }

        const totalRegistrado = transaccionesACrear.reduce((sum, t) => sum + t.monto, 0);

        res.json({
            success: true,
            msg: transaccionesACrear.length < pendientes.length
                ? `✅ ${transaccionesACrear.length} gastos fijos nuevos registrados para ${mes}/${anio} (${pendientes.length - transaccionesACrear.length} omitidos por deudas ya liquidadas)`
                : `✅ ${transaccionesACrear.length} gastos fijos registrados correctamente para ${mes}/${anio}`,
            total: totalRegistrado
        });
    } catch (error) {
        console.error('Error al registrar gastos fijos del mes:', error);
        res.status(500).json({ msg: 'Error al registrar los gastos fijos del mes' });
    }
};

export const registrarUnoEsteMes = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioId = req.usuario._id;
        const hoy = new Date();
        const mes = hoy.getMonth() + 1;
        const anio = hoy.getFullYear();

        const gasto = await GastoFijo.findById(id);
        if (!gasto) {
            return res.status(404).json({ msg: 'Gasto fijo no encontrado' });
        }
        if (gasto.usuarioId.toString() !== usuarioId.toString()) {
            return res.status(403).json({ msg: 'No tienes permiso para registrar este gasto fijo' });
        }

        // Si tiene deuda vinculada, verificar que no esté liquidada
        if (gasto.deudaId) {
            const deuda = await Deuda.findById(gasto.deudaId);
            if (!deuda) {
                return res.status(404).json({ msg: 'La deuda vinculada no existe.' });
            }
            if (deuda.estado === 'liquidada') {
                return res.status(400).json({
                    msg: `⚠️ La deuda vinculada ya está liquidada. Edita o elimina este gasto fijo.`
                });
            }
        }

        const inicioMes = new Date(Date.UTC(anio, mes - 1, 1, 0, 0, 0));
        const finMes = new Date(Date.UTC(anio, mes, 0, 23, 59, 59));

        const yaExiste = await Transaccion.findOne({
            usuarioId,
            tipo: 'gasto',
            descripcion: { $regex: `^\\[Fijo\\] ${gasto.nombre}$`, $options: 'i' },
            fecha: { $gte: inicioMes, $lte: finMes }
        });

        if (yaExiste) {
            return res.status(400).json({
                msg: `Ya registraste "${gasto.nombre}" este mes (${mes}/${anio}).`
            });
        }

        // Crear la transacción
        const transaccionCreada = await Transaccion.create({
            usuarioId,
            tipo: 'gasto',
            monto: gasto.monto,
            categoria: gasto.categoria,
            descripcion: `[Fijo] ${gasto.nombre}`,
            fecha: new Date(Date.UTC(anio, mes - 1, Math.min(gasto.diaPago, 28), 12, 0, 0))
        });

        // Si tiene deuda vinculada, registrar abono automático
        if (gasto.deudaId) {
            const deuda = await Deuda.findById(gasto.deudaId);
            if (deuda && deuda.estado === 'pendiente') {
                const saldoPendiente = deuda.montoTotal - deuda.montoPagado;
                const montoAbono = Math.min(gasto.monto, saldoPendiente);

                deuda.montoPagado += montoAbono;
                deuda.historialAbonos.push({
                    transaccionId: transaccionCreada._id,
                    montoAbonado: montoAbono,
                    fechaAbono: new Date()
                });
                if (deuda.montoPagado >= deuda.montoTotal) {
                    deuda.estado = 'liquidada';
                }
                await deuda.save();
            }
        }

        res.json({
            success: true,
            msg: `✅ "${gasto.nombre}" registrado correctamente para ${mes}/${anio}${gasto.deudaId ? ' y abono registrado en la deuda.' : '.'}`
        });
    } catch (error) {
        console.error('Error al registrar gasto fijo individual:', error);
        res.status(500).json({ msg: 'Error al registrar el gasto fijo' });
    }
};