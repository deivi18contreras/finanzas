import { Router } from 'express';
import multer from 'multer';
import { escanearFactura } from '../controllers/ocrController.js';
import { protegerRuta } from '../middlewares/authMiddlewares.js';


const router = Router();

const upload = multer({
    dest: 'uploads/',
    limits:{fileSize: 5 * 1024 * 1024}
});

router.post('/escaner', protegerRuta, upload.single('imagenFactura'), escanearFactura);

export default router;