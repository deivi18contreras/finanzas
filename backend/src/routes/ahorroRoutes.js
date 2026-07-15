import { Router } from 'express';
import { crearCaja, obtenerCajas, aportarAhorro, retirarAhorro, eliminarCaja, editarCaja } from '../controllers/ahorroController.js';
import { protegerRuta } from '../middlewares/authMiddlewares.js';

const router = Router();

router.get('/', protegerRuta, obtenerCajas);
router.post('/', protegerRuta, crearCaja);
router.post('/:id/aportar', protegerRuta, aportarAhorro);
router.post('/:id/retirar', protegerRuta, retirarAhorro);
router.put('/:id', protegerRuta, editarCaja);
router.delete('/:id', protegerRuta, eliminarCaja);

export default router;
