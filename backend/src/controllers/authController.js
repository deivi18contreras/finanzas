import User from "../models/User.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "domina_secret_key_2024";

// Generar Token
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "30d" });
};

// ─────────────────────────────────────────────
// 1. Registro
// ─────────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      return next(new Error("El usuario ya existe con ese email"));
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      token: generateToken(user._id)
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// 2. Login
// ─────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401);
      return next(new Error("Credenciales inválidas"));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401);
      return next(new Error("Credenciales inválidas"));
    }

    res.json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      token: generateToken(user._id)
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// 3. Obtener perfil — Fase 2.1
// ─────────────────────────────────────────────
export const getProfile = async (req, res) => {
  res.json({
    _id:       req.user._id,
    name:      req.user.name,
    email:     req.user.email,
    createdAt: req.user.createdAt
  });
};

// ─────────────────────────────────────────────
// 4. Actualizar perfil — Fase 2.1
// ─────────────────────────────────────────────
export const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);

    // Verificar que el nuevo email no lo use otra cuenta
    if (email && email !== user.email) {
      const emailTaken = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (emailTaken) {
        res.status(400);
        return next(new Error("El email ya está en uso por otra cuenta"));
      }
      user.email = email;
    }

    if (name) user.name = name;

    const updated = await user.save();

    res.json({
      _id:   updated._id,
      name:  updated.name,
      email: updated.email
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// 5. Cambiar contraseña — Fase 2.1
// ─────────────────────────────────────────────
export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      res.status(400);
      return next(new Error("La contraseña actual y la nueva son obligatorias"));
    }
    if (newPassword.length < 6) {
      res.status(400);
      return next(new Error("La nueva contraseña debe tener al menos 6 caracteres"));
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      res.status(401);
      return next(new Error("La contraseña actual es incorrecta"));
    }

    user.password = newPassword;
    await user.save(); // el pre-save hook aplica bcrypt automáticamente

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    next(error);
  }
};
