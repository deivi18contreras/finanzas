import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

export const protegerRuta = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'FirmaSecretaPorDefectoParaSeguridad');

      
      req.usuario = await Usuario.findById(decoded.id).select('-password');

      if (!req.usuario) {
        return res.status(401).json({ msg: 'Token no válido - El usuario no existe en el sistema' });
      }

      return next();

    } catch (error) {
      console.error('Error al verificar JWT:', error.message);
      return res.status(401).json({ msg: 'Sesión expirada o token no válido. Inicia sesión de nuevo.' });
    }
  }

  if (!token) {
    return res.status(401).json({ msg: 'Acceso denegación - No se proporcionó un token de autenticación' });
  }
};