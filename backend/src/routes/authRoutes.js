import {Router} from 'express';
import { registrarUsario, loginUsuario } from '../controllers/authController.js';

const router = Router();

router.post('/register', registrarUsario);
router.post('/login', loginUsuario)


export default router;