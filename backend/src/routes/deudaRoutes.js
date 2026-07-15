import {Router} from 'express';
import { crearDeuda, registrarAbono, obtenerDeudasUsuario, eliminarDeuda, editarDeuda } from '../controllers/deudasController.js';
import {protegerRuta} from '../middlewares/authMiddlewares.js';

const router = Router();

router.post('/', protegerRuta, crearDeuda);
router.get('/', protegerRuta, obtenerDeudasUsuario);
router.post('/:deudaId/abono', protegerRuta, registrarAbono);
router.put('/:deudaId', protegerRuta, editarDeuda);
router.delete('/:deudaId', protegerRuta, eliminarDeuda);

export default router;