import Usuario from '../models/Usuario.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registrarUsario = async (req, res) => {
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
            return res.status(400).json({ msg: 'Creendeciales incorrectas' })
        }

        const token = jwt.sign(
            { id: usuarioEncontrado._id },
            process.env.JWT_SECRET || MiPalabraUltraSecretaYEscondidaDeFinanzas1826,
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
}