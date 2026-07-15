import Ahorro from '../models/Ahorro.js';
import Transaccion from '../models/Transaccion.js';

export const crearCaja = async (req, res) => {
    try {
        const { nombre, meta } = req.body;
        const usuarioId = req.usuario._id;

        const nuevaCaja = new Ahorro({
            usuarioId,
            nombre,
            meta: meta || null
        });

        await nuevaCaja.save();

        res.status(201).json({
            success: true,
            msg: 'Caja de ahorro creada correctamente',
            caja: nuevaCaja
        });
    } catch (error) {
        console.error('Error al crear caja de ahorro:', error);
        res.status(500).json({ msg: 'Error al registrar la caja de ahorro' });
    }
};

export const obtenerCajas = async (req, res) => {
    try {
        const usuarioId = req.usuario._id;

        const cajas = await Ahorro.find({ usuarioId }).sort({ createdAt: -1 });

        res.json({
            success: true,
            cajas
        });
    } catch (error) {
        console.error('Error al obtener cajas de ahorro:', error);
        res.status(500).json({ msg: 'Error al cargar las cajas de ahorro' });
    }
};

export const aportarAhorro = async (req, res) => {
    try {
        const { id } = req.params;
        const { monto } = req.body;
        const usuarioId = req.usuario._id;

        if (!monto || monto <= 0) {
            return res.status(400).json({ msg: 'El monto de aporte debe ser mayor a 0' });
        }

        const caja = await Ahorro.findById(id);
        if (!caja) {
            return res.status(404).json({ msg: 'Caja de ahorro no encontrada' });
        }
        if (caja.usuarioId.toString() !== usuarioId.toString()) {
            return res.status(403).json({ msg: 'No tienes permiso para aportar a esta caja' });
        }

        // 1. Crear transacción de Gasto para restar del saldo actual
        const transaccionGasto = new Transaccion({
            usuarioId,
            tipo: 'gasto',
            monto,
            categoria: 'Ahorro',
            descripcion: `[Aporte Ahorro] A: ${caja.nombre}`,
            fecha: new Date()
        });

        await transaccionGasto.save();

        // 2. Incrementar monto acumulado de la caja
        caja.montoAcumulado += monto;
        await caja.save();

        res.json({
            success: true,
            msg: `Aporte de $${monto.toLocaleString()} realizado con éxito.`,
            caja
        });
    } catch (error) {
        console.error('Error al aportar a la caja de ahorro:', error);
        res.status(500).json({ msg: 'Error interno al procesar el aporte' });
    }
};

export const retirarAhorro = async (req, res) => {
    try {
        const { id } = req.params;
        const { monto } = req.body;
        const usuarioId = req.usuario._id;

        if (!monto || monto <= 0) {
            return res.status(400).json({ msg: 'El monto a retirar debe ser mayor a 0' });
        }

        const caja = await Ahorro.findById(id);
        if (!caja) {
            return res.status(404).json({ msg: 'Caja de ahorro no encontrada' });
        }
        if (caja.usuarioId.toString() !== usuarioId.toString()) {
            return res.status(403).json({ msg: 'No tienes permiso para retirar de esta caja' });
        }
        if (caja.montoAcumulado < monto) {
            return res.status(400).json({ msg: `Saldo insuficiente. Solo posees $${caja.montoAcumulado.toLocaleString()} ahorrados en este bolsillo.` });
        }

        // 1. Crear transacción de Ingreso para volver a meterlo al saldo de caja disponible
        const transaccionIngreso = new Transaccion({
            usuarioId,
            tipo: 'ingreso',
            monto,
            categoria: 'Ahorro',
            descripcion: `[Retiro Ahorro] De: ${caja.nombre}`,
            fecha: new Date()
        });

        await transaccionIngreso.save();

        // 2. Decrementar el monto acumulado
        caja.montoAcumulado -= monto;
        await caja.save();

        res.json({
            success: true,
            msg: `Retiro de $${monto.toLocaleString()} realizado con éxito. Balance de saldo aumentado.`,
            caja
        });
    } catch (error) {
        console.error('Error al retirar de la caja de ahorro:', error);
        res.status(500).json({ msg: 'Error interno al procesar el retiro' });
    }
};

export const eliminarCaja = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioId = req.usuario._id;

        const caja = await Ahorro.findById(id);
        if (!caja) {
            return res.status(404).json({ msg: 'Caja de ahorro no encontrada' });
        }
        if (caja.usuarioId.toString() !== usuarioId.toString()) {
            return res.status(403).json({ msg: 'No tienes permiso para eliminar esta caja' });
        }

        await Ahorro.findByIdAndDelete(id);

        res.json({
            success: true,
            msg: 'Caja de ahorro eliminada del sistema.'
        });
    } catch (error) {
        console.error('Error al eliminar caja de ahorro:', error);
        res.status(500).json({ msg: 'Error al eliminar el bolsillo de ahorro' });
    }
};

export const editarCaja = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, meta } = req.body;
        const usuarioId = req.usuario._id;

        const caja = await Ahorro.findById(id);
        if (!caja) {
            return res.status(404).json({ msg: 'Caja de ahorro no encontrada' });
        }
        if (caja.usuarioId.toString() !== usuarioId.toString()) {
            return res.status(403).json({ msg: 'No tienes permiso para editar esta caja' });
        }

        caja.nombre = nombre || caja.nombre;
        caja.meta = meta !== undefined ? meta : caja.meta;

        await caja.save();

        res.json({
            success: true,
            msg: 'Bolsillo de ahorro actualizado correctamente',
            caja
        });
    } catch (error) {
        console.error('Error al editar caja de ahorro:', error);
        res.status(500).json({ msg: 'Error al actualizar el bolsillo de ahorro' });
    }
};
