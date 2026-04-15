import express from "express";
import { register, login, getProfile, updateProfile, changePassword } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Rutas públicas
router.post("/register", register);
router.post("/login", login);

// Fase 2.2 — Rutas protegidas de perfil
router.get("/me", protect, getProfile);
router.put("/me", protect, updateProfile);
router.put("/password", protect, changePassword);

export default router;
