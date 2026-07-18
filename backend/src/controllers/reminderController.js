import Deuda from '../models/Deuda.js';
import GastoFijo from '../models/GastoFijo.js';
import { enviarCorreoRecordatorio } from '../config/emailService.js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Busca deudas y gastos fijos próximos a vencer y envía recordatorios por correo.
 */
export const enviarRecordatoriosVencimiento = async (req, res) => {
    try {
        const { token } = req.query;

        // 1. Validar el token de seguridad
        if (!token || token !== process.env.REMINDER_CRON_TOKEN) {
            return res.status(401).json({ success: false, msg: 'Token de seguridad no válido o ausente.' });
        }

        const hoy = new Date();
        const envios = [];

        // ==========================================
        // PARTE A: PROCESAR DEUDAS
        // ==========================================
        const hoyInicio = new Date(hoy);
        hoyInicio.setHours(0, 0, 0, 0);

        const limiteFuturo = new Date(hoy);
        limiteFuturo.setDate(hoy.getDate() + 3);
        limiteFuturo.setHours(23, 59, 59, 999);

        const deudasProximas = await Deuda.find({
            estado: 'pendiente',
            fechaLimite: {
                $gte: hoyInicio,
                $lte: limiteFuturo
            }
        }).populate('usuarioId', 'nombre email');

        for (const deuda of deudasProximas) {
            if (deuda.usuarioId && deuda.usuarioId.email) {
                const envioPromesa = enviarCorreoRecordatorio({
                    emailUsuario: deuda.usuarioId.email,
                    nombreUsuario: deuda.usuarioId.nombre,
                    contacto: deuda.contacto,
                    descripcion: deuda.descripcion,
                    montoTotal: deuda.montoTotal,
                    fechaLimite: deuda.fechaLimite
                });
                envios.push(envioPromesa);
            }
        }

        // ==========================================
        // PARTE B: PROCESAR GASTOS FIJOS
        // ==========================================
        // Obtenemos los números de los días correspondientes a hoy, mañana y pasado mañana
        const diasAVisitar = [];
        for (let i = 0; i <= 3; i++) {
            const fechaFutura = new Date(hoy);
            fechaFutura.setDate(hoy.getDate() + i);
            diasAVisitar.push(fechaFutura.getDate());
        }

        // Buscamos gastos fijos activos cuyos diaPago coincidan con estos días
        const gastosFijosProximos = await GastoFijo.find({
            activo: true,
            diaPago: { $in: diasAVisitar }
        }).populate('usuarioId', 'nombre email');

        const emailFrom = process.env.EMAIL_FROM || 'alertas@testcenter.online';

        for (const gasto of gastosFijosProximos) {
            if (gasto.usuarioId && gasto.usuarioId.email) {
                // Generamos la fecha estimada de pago para este mes actual
                const fechaLimiteEstimada = new Date(hoy.getFullYear(), hoy.getMonth(), gasto.diaPago);
                
                // Si el día del gasto ya pasó en este mes (ej: es fin de mes y el gasto es del día 2 del mes siguiente), sumamos un mes
                if (gasto.diaPago < hoy.getDate()) {
                    fechaLimiteEstimada.setMonth(fechaLimiteEstimada.getMonth() + 1);
                }

                const fechaFormateada = fechaLimiteEstimada.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

                // Enviamos correo personalizado para el Gasto Fijo
                const envioPromesa = resend.emails.send({
                    from: `Alertas Finanzas <${emailFrom}>`,
                    to: [gasto.usuarioId.email],
                    subject: `⏰ Recordatorio de Gasto Fijo Próximo - ${gasto.nombre}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                          <h2 style="color: #007bff; text-align: center; margin-bottom: 20px;">Gasto Fijo Próximo</h2>
                          <p>Hola <strong>${gasto.usuarioId.nombre}</strong>,</p>
                          <p>Te recordamos que se aproxima la fecha de pago de uno de tus gastos fijos recurrentes:</p>
                          
                          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                            <tr style="background-color: #f8f9fa;">
                              <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold; width: 30%;">Gasto Fijo:</td>
                              <td style="padding: 10px; border: 1px solid #dee2e6;">${gasto.nombre}</td>
                            </tr>
                            <tr>
                              <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold;">Categoría:</td>
                              <td style="padding: 10px; border: 1px solid #dee2e6;">${gasto.categoria}</td>
                            </tr>
                            <tr style="background-color: #f8f9fa;">
                              <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold;">Monto estimado:</td>
                              <td style="padding: 10px; border: 1px solid #dee2e6; color: #007bff; font-weight: bold;">$${gasto.monto.toLocaleString('es-CO')}</td>
                            </tr>
                            <tr>
                              <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold;">Día de Pago:</td>
                              <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold; color: #007bff;">El día ${gasto.diaPago} (${fechaFormateada})</td>
                            </tr>
                          </table>

                          <p style="text-align: center; margin-top: 30px;">
                            <a href="${process.env.FRONTEND_URL || 'https://testcenter.online'}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Ver mis Finanzas</a>
                          </p>
                          
                          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                          <p style="font-size: 12px; color: #777; text-align: center;">Este es un correo automático generado por tu aplicación de Finanzas Personales.</p>
                        </div>
                    `
                }).then(data => ({ success: true, data })).catch(error => ({ success: false, error }));

                envios.push(envioPromesa);
            }
        }

        // ==========================================
        // PROCESAMIENTO Y RESPUESTA
        // ==========================================
        if (envios.length === 0) {
            return res.json({ 
                success: true, 
                msg: 'No hay deudas ni gastos fijos pendientes próximos a vencer en los siguientes 3 días.' 
            });
        }

        const resultados = await Promise.all(envios);

        res.json({
            success: true,
            msg: `Proceso de recordatorios finalizado.`,
            detalles: {
                deudasProximas: deudasProximas.length,
                gastosFijosProximos: gastosFijosProximos.length,
                correosEnviados: resultados.filter(r => r.success).length,
                errores: resultados.filter(r => !r.success).length
            }
        });

    } catch (error) {
        console.error('Error en enviarRecordatoriosVencimiento:', error);
        res.status(500).json({ 
            success: false, 
            msg: 'Error interno en el servidor al enviar recordatorios.',
            error: error.message 
        });
    }
};