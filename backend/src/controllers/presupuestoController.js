import Presupuesto from '../models/Presupuesto.js';
import Transaccion from '../models/Transaccion.js';

export const guardarPresupuesto = async (req, res) => {
  try {
    const { usuarioId, categoria, montoLimite, mes, anio } = req.body;
    const uId = usuarioId || (req.usuario ? req.usuario._id : null);

    let presupuesto = await Presupuesto.findOne({ usuarioId: uId, categoria, mes, anio });

    if (presupuesto) {
      presupuesto.montoLimite = montoLimite;
      await presupuesto.save();
      return res.json({
        success: true,
        msg: 'Presupuesto actualizado correctamente',
        presupuesto
      });
    }

    presupuesto = new Presupuesto({
      usuarioId: uId,
      categoria,
      montoLimite,
      mes,
      anio
    });

    await presupuesto.save();

    res.status(201).json({
      success: true,
      msg: 'Presupuesto configurado exitosamente',
      presupuesto
    });
  } catch (error) {
    console.error('Error al guardar presupuesto:', error);
    res.status(500).json({ msg: 'Error interno al configurar el presupuesto' });
  }
};

export const obtenerPresupuestosConProgreso = async (req, res) => {
  try {
    const usuarioId = req.query.usuarioId || (req.usuario ? req.usuario._id : null);
    const { mes, anio } = req.query;

    if (!usuarioId || !mes || !anio) {
      return res.status(400).json({ msg: 'Faltan parámetros requeridos: usuarioId, mes o anio' });
    }

    const targetMes = parseInt(mes);
    const targetAnio = parseInt(anio);

    const presupuestos = await Presupuesto.find({ usuarioId, mes: targetMes, anio: targetAnio });

    const fechaInicio = new Date(targetAnio, targetMes - 1, 1);
    const fechaFin = new Date(targetAnio, targetMes, 0, 23, 59, 59);

    const gastosDelMes = await Transaccion.find({
      usuarioId,
      tipo: 'gasto',
      fecha: { $gte: fechaInicio, $lte: fechaFin }
    });

    const reportePresupuestos = presupuestos.map(p => {
      const totalGastadoEnCategoria = gastosDelMes
        .filter(gasto => gasto.categoria.toLowerCase() === p.categoria.toLowerCase())
        .reduce((acumulado, gasto) => acumulado + gasto.monto, 0);

      return {
        _id: p._id,
        categoria: p.categoria,
        montoLimite: p.montoLimite,
        totalGastado: totalGastadoEnCategoria,
        saldoDisponible: p.montoLimite - totalGastadoEnCategoria,
        porcentajeConsumido: p.montoLimite > 0 ? (totalGastadoEnCategoria / p.montoLimite) * 100 : 0,
        superado: totalGastadoEnCategoria > p.montoLimite
      };
    });

    res.json({
      success: true,
      mes: targetMes,
      anio: targetAnio,
      presupuestos: reportePresupuestos
    });

  } catch (error) {
    console.error('Error al calcular progreso de presupuestos:', error);
    res.status(500).json({ msg: 'Error al procesar el estado de tus presupuestos' });
  }
};

export const eliminarPresupuesto = async (req, res) => {
  try {
    const { presupuestoId } = req.params;

    const presupuesto = await Presupuesto.findByIdAndDelete(presupuestoId);
    if (!presupuesto) {
      return res.status(404).json({ msg: 'Presupuesto no encontrado' });
    }

    res.json({
      success: true,
      msg: 'Límite de presupuesto eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar presupuesto:', error);
    res.status(500).json({ msg: 'Error interno al eliminar el presupuesto' });
  }
};