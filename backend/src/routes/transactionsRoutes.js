import express from "express";
import {
    createTransaction,
    getTransactions,
    deleteTransaction,
    updateTransaction,
    getTransactionSummary,
    getExpensesByCategory,
    getMonthlyInsights,
    getMonthlyEvolution
} from "../controllers/transactionController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Todas las rutas de transacciones protegidas
router.use(protect);

router.get('/summary', getTransactionSummary);
router.get('/stats/categories', getExpensesByCategory);
router.get('/stats/insights', getMonthlyInsights);
router.get('/stats/evolution', getMonthlyEvolution);

router.post('/', createTransaction);
router.get('/', getTransactions);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;