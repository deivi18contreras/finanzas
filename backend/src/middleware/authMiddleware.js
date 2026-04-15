import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "domina_secret_key_2024";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      // BUGFIX: Si el usuario fue eliminado, el token aún es válido pero el user es null
      if (!req.user) {
        res.status(401);
        return next(new Error("Usuario no encontrado, token inválido"));
      }

      return next();
    } catch (error) {
      res.status(401);
      return next(new Error("No autorizado, token fallido"));
    }
  }

  if (!token) {
    res.status(401);
    return next(new Error("No autorizado, no hay token"));
  }
};
