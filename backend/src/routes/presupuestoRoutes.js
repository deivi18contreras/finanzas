import { Router } from 'express';
import { guardarPresupuesto, obtenerPresupuestosConProgreso, eliminarPresupuesto } from '../controllers/presupuestoController.js';
import {protegerRuta} from '../middlewares/authMiddlewares.js'
const router = Router();

router.post('/', protegerRuta, guardarPresupuesto);
router.get('/progreso', protegerRuta, obtenerPresupuestosConProgreso);
router.delete('/:presupuestoId', protegerRuta, eliminarPresupuesto);

export default router;