import Transaccion from '../models/Transaccion.js';


export const crearTransaccion = async (req, res) => {
    try {
        const {tipo, monto, categoria, descripcion, fecha } = req.body;
        const usuarioId = req.usuario._id;

        const nuevaTransaccion = new Transaccion({
            usuarioId,
            tipo,
            monto,
            categoria,
            descripcion,
            fecha: fecha || new Date()
        });

        await nuevaTransaccion.save();

        res.status(201).json({
            success: true,
            msg: 'Movimiento registrado correctamente',
            transaccion: nuevaTransaccion
        });

    } catch (error) {
        console.error('Error al crear transacción:', error);
        res.status(500).json({ msg: 'Error al registrar el movimiento' });
    }
};


export const obtenerTransaccionesPorMes = async (req, res) => {
    try {
        const { anio, mes } = req.query;
        const usuarioId = req.usuario._id;

        if ( !anio || !mes) {
            return res.status(400).json({ msg: 'Faltan parámetros requeridos:año o mes' });
        }


        const year = parseInt(anio);
        const month = parseInt(mes);

        const fechaInicio = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
        const fechaFin = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

        const transacciones = await Transaccion.find({
            usuarioId,
            fecha: {
                $gte: fechaInicio,
                $lte: fechaFin
            }
        }).sort({ fecha: -1 });

        let ingresos = 0;
        let gastos = 0;
        let deudas = 0;

        transacciones.forEach(t => {
            if (t.tipo === 'ingreso') ingresos += t.monto;
            if (t.tipo === 'gasto') gastos += t.monto;
            if (t.tipo === 'deudas') deudas += t.monto;
        });

        res.json({
            success: true,
            mes,
            anio,
            resumenMes: {
                balanceNeto: ingresos - gastos,
                totalIngresos: ingresos,
                totalGastos: gastos,
                totalDeudas: deudas
            },
            transacciones
        });

    } catch (error) {
        console.error('Error al obtener transacciones:', error);
        res.status(500).json({ msg: 'Error al cargar el historial financiero' });
    }
};

export const eliminarTransaccion = async (req, res) => {
    try {
        const { id } = req.params;
        const transaccion = await Transaccion.findById(id);
        if (!transaccion) {
            return res.status(404).json({ msg: 'Transacción no encontrada' });
        }
        await Transaccion.findByIdAndDelete(id);
        res.json({ success: true, msg: 'Movimiento eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar transacción:', error);
        res.status(500).json({ msg: 'Error al eliminar el movimiento' });
    }
};