import { Resend } from 'resend';

// Inicializar Resend con la API Key guardada en el .env
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Envía un correo electrónico de recordatorio de pago.
 */
export const enviarCorreoRecordatorio = async ({ emailUsuario, nombreUsuario, contacto, descripcion, montoTotal, fechaLimite }) => {
  try {
    const emailFrom = process.env.EMAIL_FROM || 'alertas@testcenter.online';
    
    // Formatear la fecha para que sea legible en español (ej: sábado, 18 de julio de 2026)
    const fechaFormateada = new Date(fechaLimite).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC' // Usamos UTC para evitar desfases de zona horaria al formatear
    });

    const data = await resend.emails.send({
      from: `Alertas Finanzas <${emailFrom}>`,
      to: [emailUsuario],
      subject: `⚠️ Recordatorio de Pago Próximo - ${contacto}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #d32f2f; text-align: center; margin-bottom: 20px;">Recordatorio de Vencimiento</h2>
          <p>Hola <strong>${nombreUsuario}</strong>,</p>
          <p>Te escribimos para recordarte que tienes una obligación financiera próxima a vencer:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold; width: 30%;">Contacto:</td>
              <td style="padding: 10px; border: 1px solid #dee2e6;">${contacto}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold;">Descripción:</td>
              <td style="padding: 10px; border: 1px solid #dee2e6;">${descripcion || 'Sin descripción'}</td>
            </tr>
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold;">Monto Total:</td>
              <td style="padding: 10px; border: 1px solid #dee2e6; color: #d32f2f; font-weight: bold;">$${montoTotal.toLocaleString('es-CO')}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold;">Fecha Límite:</td>
              <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold; color: #d32f2f;">${fechaFormateada}</td>
            </tr>
          </table>

          <p style="text-align: center; margin-top: 30px;">
            <a href="https://testcenter.online" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Ver mis Finanzas</a>
          </p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 12px; color: #777; text-align: center;">Este es un correo automático generado por tu aplicación de Finanzas Personales.</p>
        </div>
      `
    });

    return { success: true, data };
  } catch (error) {
    console.error('Error al enviar correo con Resend:', error);
    return { success: false, error };
  }
};

/**
 * Envía un correo electrónico con el enlace para restablecer contraseña.
 */
export const enviarCorreoRecuperacion = async (emailUsuario, nombreUsuario, enlaceRecuperacion) => {
  try {
    const emailFrom = process.env.EMAIL_FROM || 'alertas@testcenter.online';

    const data = await resend.emails.send({
      from: `Soporte Finanzas <${emailFrom}>`,
      to: [emailUsuario],
      subject: `🔑 Restablecer tu Contraseña`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #4f46e5; text-align: center; margin-bottom: 20px;">Restablecer Contraseña</h2>
          <p>Hola <strong>${nombreUsuario}</strong>,</p>
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta de Finanzas Personales. Si no realizaste esta solicitud, puedes ignorar este correo de forma segura.</p>
          
          <p>Para restablecer tu contraseña, haz clic en el siguiente botón. Este enlace vencerá en 1 hora:</p>

          <p style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
            <a href="${enlaceRecuperacion}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Restablecer Contraseña</a>
          </p>

          <p style="font-size: 12px; color: #777;">Si el botón no funciona, puedes copiar y pegar el siguiente enlace en tu navegador:</p>
          <p style="font-size: 12px; color: #4f46e5; word-break: break-all;">${enlaceRecuperacion}</p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 12px; color: #777; text-align: center;">Este es un correo automático generado por tu aplicación de Finanzas Personales.</p>
        </div>
      `
    });

    return { success: true, data };
  } catch (error) {
    console.error('Error al enviar correo de recuperación con Resend:', error);
    return { success: false, error };
  }
};