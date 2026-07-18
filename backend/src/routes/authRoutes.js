import {Router} from 'express';
import { registrarUsuario, loginUsuario, solicitarRecuperacionPassword, restablecerPassword } from '../controllers/authController.js';

const router = Router();

router.post('/register', registrarUsuario);
router.post('/login', loginUsuario);
router.post('/forgot-password', solicitarRecuperacionPassword);
router.post('/reset-password/:token', restablecerPassword);

export default router;