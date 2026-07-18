import Usuario from '../models/Usuario.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { enviarCorreoRecuperacion } from '../config/emailService.js';

export const registrarUsuario = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        const existeEmail = await Usuario.findOne({ email });
        if (existeEmail) {
            return res.status(400).json({ msg: 'Este correo ya esta registrado' })
        }

        const nuevoUsuario = new Usuario({ nombre, email, password });

        const salt = bcryptjs.genSaltSync(10);
        nuevoUsuario.password = bcryptjs.hashSync(password, salt)

        await nuevoUsuario.save();

        res.status(201).json({
            success: true,
            msg: 'Usuario Creado Exitosamente',
            usuario: nuevoUsuario
        })
    } catch (error) {
        console.error('Error en Registro:', error);
        res.status(500).json({ msg: 'Hubo un error al registrar el usuario' });
    }
};

export const loginUsuario = async (req, res) => {
    try {
        const { email, password } = req.body;

        const usuarioEncontrado = await Usuario.findOne({ email });
        if (!usuarioEncontrado) {
            return res.status(400).json({ msg: 'Credenciales incorrectas' })
        }

        const passwordValido = bcryptjs.compareSync(password, usuarioEncontrado.password);
        if (!passwordValido) {
            return res.status(400).json({ msg: 'Credenciales incorrectas' })
        }

        const token = jwt.sign(
            { id: usuarioEncontrado._id },
            process.env.JWT_SECRET,
            { expiresIn: '18d' }
        )
        return res.status(200).json({
            success: true,
            msg: 'Inicio de sesión exitoso',
            token,
            usuario: {
                id: usuarioEncontrado._id,
                nombre: usuarioEncontrado.nombre,
                email: usuarioEncontrado.email
            }
        });
    } catch (error) {
        console.error('Error en Login:', error);
        res.status(500).json({ msg: 'Hubo un error al iniciar sesión' });
   }
};

export const solicitarRecuperacionPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const usuario = await Usuario.findOne({ email: email.toLowerCase() });
        if (!usuario) {
            // Retornamos éxito simulado por privacidad, o podemos decir que si existe se enviará.
            return res.status(200).json({
                success: true,
                msg: 'Si el correo electrónico está registrado, se enviará un enlace de recuperación.'
            });
        }

        // Generar un token aleatorio seguro
        const token = crypto.randomBytes(20).toString('hex');

        // Guardar token y expiración (1 hora)
        usuario.resetPasswordToken = token;
        usuario.resetPasswordExpire = Date.now() + 3600000; // 1 hora
        await usuario.save();

        // Crear enlace de restablecimiento (usando el dominio del frontend, ej: http://localhost:5173 o tu dominio)
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const enlaceRecuperacion = `${frontendUrl}/reset-password/${token}`;

        // Enviar correo
        const envio = await enviarCorreoRecuperacion(usuario.email, usuario.nombre, enlaceRecuperacion);

        if (!envio.success) {
            return res.status(500).json({ msg: 'Error al enviar el correo de recuperación' });
        }

        res.status(200).json({
            success: true,
            msg: 'Si el correo electrónico está registrado, se enviará un enlace de recuperación.'
        });

    } catch (error) {
        console.error('Error en solicitarRecuperacionPassword:', error);
        res.status(500).json({ msg: 'Hubo un error al procesar la solicitud de recuperación' });
    }
};

export const restablecerPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Buscar usuario con el token que no haya expirado
        const usuario = await Usuario.findOne({
            resetPasswordToken: token,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!usuario) {
            return res.status(400).json({ msg: 'El enlace de recuperación no es válido o ha expirado.' });
        }

        // Encriptar nueva contraseña
        const salt = bcryptjs.genSaltSync(10);
        usuario.password = bcryptjs.hashSync(password, salt);

        // Limpiar campos de recuperación
        usuario.resetPasswordToken = null;
        usuario.resetPasswordExpire = null;

        await usuario.save();

        res.status(200).json({
            success: true,
            msg: 'Tu contraseña ha sido restablecida correctamente. Ya puedes iniciar sesión.'
        });

    } catch (error) {
        console.error('Error en restablecerPassword:', error);
        res.status(500).json({ msg: 'Hubo un error al restablecer la contraseña' });
    }
};