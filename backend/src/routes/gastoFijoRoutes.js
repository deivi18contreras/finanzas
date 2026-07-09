import { Router } from 'express';
import {
    crearGastoFijo,
    obtenerGastosFijos,
    editarGastoFijo,
    eliminarGastoFijo,
    registrarTodosEsteMes
} from '../controllers/gastoFijoController.js';
import { protegerRuta } from '../middlewares/authMiddlewares.js';

const router = Router();

router.get('/', protegerRuta, obtenerGastosFijos);
router.post('/', protegerRuta, crearGastoFijo);
router.put('/:id', protegerRuta, editarGastoFijo);
router.delete('/:id', protegerRuta, eliminarGastoFijo);
router.post('/registrar-mes', protegerRuta, registrarTodosEsteMes);

export default router;