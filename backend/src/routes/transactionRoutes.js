import {Router} from 'express';
import { crearTransaccion, obtenerTransaccionesPorMes, eliminarTransaccion ,editarTransaccion} from '../controllers/transactionController.js';
import { protegerRuta } from '../middlewares/authMiddlewares.js';

const router = Router();

router.post('/', protegerRuta, crearTransaccion);
router.get('/historial', protegerRuta, obtenerTransaccionesPorMes);
router.put('/:id', protegerRuta, editarTransaccion);
router.delete('/:id', protegerRuta, eliminarTransaccion);

export default router