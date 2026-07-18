import { Router } from "express";
import { crearCategoria, obtenerCategorias, eliminarCategoria, editarCategoria } from "../controllers/categoriaController.js";
import {protegerRuta} from '../middlewares/authMiddlewares.js';

const router = Router();

router.post('/', protegerRuta, crearCategoria);
router.get('/', protegerRuta, obtenerCategorias);
router.put('/:categoriaId', protegerRuta, editarCategoria);
router.delete('/:categoriaId', protegerRuta, eliminarCategoria);

export default router;