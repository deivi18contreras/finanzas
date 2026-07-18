import { Router } from 'express';
import { enviarRecordatoriosVencimiento } from '../controllers/reminderController.js';

const router = Router();

// Endpoint que será llamado por cron-job.org de forma externa y segura
router.get('/send-upcoming', enviarRecordatoriosVencimiento);

export default router;