import Deuda from '../models/Deuda.js'
import Transaccion from '../models/Transaccion.js'

export const crearDeuda = async (req, res) => {
    try {
        const { usuarioId, tipo, contacto, montoTotal, fechaLimite, descripcion, descontarCaja } = req.body;
        const uId = usuarioId || (req.usuario ? req.usuario._id : null);

        const nuevaDeuda = new Deuda({
            usuarioId: uId,
            tipo,
            contacto,
            descripcion,
            montoTotal,
            fechaLimite
        });

        await nuevaDeuda.save();

        // Si se solicitó descontar de la caja
        if (descontarCaja) {
            const descripcionTransaccion = tipo === 'por_cobrar'
                ? `Préstamo realizado a: ${contacto}`
                : `Retiro por préstamo tomado de caja: ${contacto}`;

            const nuevoGasto = new Transaccion({
                usuarioId: uId,
                tipo: 'gasto',
                monto: montoTotal,
                categoria: 'Préstamo',
                descripcion: `${descripcionTransaccion}${descripcion ? ' - ' + descripcion : ''}`,
                fecha: new Date()
            });
            await nuevoGasto.save();
        }

        res.status(201).json({
            success: true,
            msg: 'Deuda registrada correctamente',
            deuda: nuevaDeuda
        });
    } catch (error) {
        console.error('Error al crear deuda:', error);
        res.status(500).json({ msg: 'Error al registrar la deuda' });
    }
};

export const registrarAbono = async (req, res) => {
    try {
        const { deudaId } = req.params;
        const { montoAbonado, usuarioId } = req.body;
        const uId = usuarioId || (req.usuario ? req.usuario._id : null);

        const deuda = await Deuda.findById(deudaId);
        if (!deuda) {
            return res.status(404).json({ msg: 'Deudad no encontrada' });
        }
        if (deuda.estado === 'liquidada') {
            return res.status(400).json({ msg: 'Esta deuda ya se encuentra completamente liquidada ' })
        }

        const saldoPendiente = deuda.montoTotal - deuda.montoPagado;
        if (montoAbonado > saldoPendiente) {
            return res.status(400).json({ msg: `El abono supera el saldo pendiente, Solo debes abonar máximo $${saldoPendiente}` })
        }

        const nuevaTransaccion = new Transaccion({
            usuarioId: uId,
            tipo: deuda.tipo === 'por_pagar' ? 'gasto' : 'ingreso',
            monto: montoAbonado,
            categoria: deuda.tipo === 'por_pagar' ? 'Pago Deuda' : 'Cobro Deuda',
            descripcion: `Abono a la cuenta de: ${deuda.contacto}`,
            fecha: new Date()
        })

        await nuevaTransaccion.save();

        deuda.montoPagado += montoAbonado;
        deuda.historialAbonos.push({
            transaccionId: nuevaTransaccion._id,
            montoAbonado
        });

        if (deuda.montoPagado === deuda.montoTotal) {
            deuda.estado = 'liquidada';
        }

        await deuda.save();

        res.json({
            success: true,
            msg: deuda.estado === 'liquidada' ? '¡Felicidades! La deuda ha sido liquidada' : 'Abono registrado con éxito',
            deuda
        });
    } catch (error) {
        console.error('Error al registrar abono:', error);
        res.status(500).json({ msg: 'Error interno al procesar el abono' });
    }
};

export const obtenerDeudasUsuario = async (req, res) => {
    try {
        const usuarioId = req.query.usuarioId || (req.usuario ? req.usuario._id : null);

        if (!usuarioId) {
            return res.status(400).json({ msg: 'El usuarioId es requerido' });
        }

        const deudas = await Deuda.find({ usuarioId }).sort({ estado: -1, createdAt: -1 });
        res.json({ success: true, deudas });
    } catch (error) {
        console.error('Error al obtener deudas:', error);
        res.status(500).json({ msg: 'Error al cargar el módulo de deudas' });
    }
};

export const eliminarDeuda = async (req, res) => {
  try {
    const { deudaId } = req.params;

    const deuda = await Deuda.findById(deudaId);
    if (!deuda) {
      return res.status(404).json({ msg: 'Deuda no encontrada' });
    }

    const transaccionesIds = deuda.historialAbonos.map(abono => abono.transaccionId);

    if (transaccionesIds.length > 0) {
      await Transaccion.deleteMany({ _id: { $in: transaccionesIds } });
    }

    await Deuda.findByIdAndDelete(deudaId);

    res.json({
      success: true,
      msg: 'Deuda y todo su historial de abonos eliminados correctamente. Balances actualizados.'
    });

  } catch (error) {
    console.error('Error al eliminar deuda:', error);
    res.status(500).json({ msg: 'Error interno al eliminar la deuda' });
  }
};