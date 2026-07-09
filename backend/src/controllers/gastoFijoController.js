import GastoFijo from '../models/GastoFijo.js';
import Transaccion from '../models/Transaccion.js';

export const crearGastoFijo = async (req, res) => {
    try {
        const { nombre, monto, categoria, diaPago } = req.body;
        const usuarioId = req.usuario._id;

        const nuevoGasto = new GastoFijo({
            usuarioId,
            nombre,
            monto,
            categoria,
            diaPago
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
        const { nombre, monto, categoria, diaPago } = req.body;
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

        // Buscar cuáles ya fueron registrados este mes por nombre exacto
        const yaRegistrados = await Transaccion.find({
            usuarioId,
            tipo: 'gasto',
            descripcion: { $regex: '^\\[Fijo\\]', $options: 'i' },
            fecha: { $gte: inicioMes, $lte: finMes }
        });

        const nombresRegistrados = yaRegistrados.map(t =>
            t.descripcion.replace('[Fijo] ', '').toLowerCase()
        );

        // Filtrar solo los que NO se han registrado este mes
        const pendientes = gastosFijos.filter(g =>
            !nombresRegistrados.includes(g.nombre.toLowerCase())
        );

        if (pendientes.length === 0) {
            return res.status(400).json({
                msg: `Ya registraste todos tus gastos fijos este mes (${yaRegistrados.length} encontrados). Revisa tus movimientos.`
            });
        }

        // Crear solo las transacciones pendientes
        const transacciones = pendientes.map(g => ({
            usuarioId,
            tipo: 'gasto',
            monto: g.monto,
            categoria: g.categoria,
            descripcion: `[Fijo] ${g.nombre}`,
            fecha: new Date(Date.UTC(anio, mes - 1, Math.min(g.diaPago, 28), 12, 0, 0))
        }));

        await Transaccion.insertMany(transacciones);

        const totalRegistrado = pendientes.reduce((sum, g) => sum + g.monto, 0);

        res.json({
            success: true,
            msg: pendientes.length < gastosFijos.length
                ? `✅ ${pendientes.length} gastos fijos nuevos registrados para ${mes}/${anio} (${yaRegistrados.length} ya existían)`
                : `✅ ${pendientes.length} gastos fijos registrados correctamente para ${mes}/${anio}`,
            total: totalRegistrado
        });
    } catch (error) {
        console.error('Error al registrar gastos fijos del mes:', error);
        res.status(500).json({ msg: 'Error al registrar los gastos fijos del mes' });
    }
};