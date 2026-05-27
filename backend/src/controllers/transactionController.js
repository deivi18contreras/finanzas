import Transaction from "../models/Transaction.js";
import mongoose from "mongoose";

// Helper: convierte el _id del usuario autenticado a ObjectId de Mongoose
const uid = (req) => new mongoose.Types.ObjectId(req.user._id.toString());

// ─────────────────────────────────────────────
// 1. Crear transacción
// ─────────────────────────────────────────────
export const createTransaction = async (req, res, next) => {
  try {
    const { type, amount, description, category, date } = req.body;
    if (!type || amount === undefined || amount === null || !category) {
      res.status(400);
      return next(new Error("Tipo, monto y categoría son obligatorios"));
    }
    const transaction = new Transaction({
      user: req.user._id,
      type,
      amount,
      description,
      category,
      ...(date && { date: new Date(date) })
    });
    const saved = await transaction.save();
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// 2. Obtener todas con filtros (paginación, fechas, categoría, tipo)
// Fase 1.2d — Agrega filtro por category y type
// ─────────────────────────────────────────────
export const getTransactions = async (req, res, next) => {
  try {
    const { startDate, endDate, page = 1, limit = 50, category, type } = req.query;
    let query = { user: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate)   query.date.$lte = new Date(endDate);
    }
    if (category) query.category = category;
    if (type)     query.type = type;

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Transaction.find(query).sort({ date: -1 }).skip(skip).limit(Number(limit)),
      Transaction.countDocuments(query)
    ]);

    res.json({
      metadata: {
        totalRegisters: total,
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit)
      },
      data
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// 3. Actualizar (solo los campos permitidos)
// ─────────────────────────────────────────────
export const updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type, amount, description, category, date } = req.body;
    const updateData = { type, amount, description, category };
    if (date) updateData.date = new Date(date);

    const updated = await Transaction.findOneAndUpdate(
      { _id: id, user: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );
    if (!updated) {
      res.status(404);
      return next(new Error("Transacción no encontrada"));
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// 4. Eliminar
// ─────────────────────────────────────────────
export const deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Transaction.findOneAndDelete({ _id: id, user: req.user._id });
    if (!deleted) {
      res.status(404);
      return next(new Error("Transacción no encontrada"));
    }
    res.json({ msg: "Transacción eliminada correctamente" });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// 5. Resumen financiero (Dashboard)
// Fase 1.2a — Usa aggregate en vez de .find() + .reduce()
// ─────────────────────────────────────────────
export const getTransactionSummary = async (req, res, next) => {
  try {
    const result = await Transaction.aggregate([
      { $match: { user: uid(req) } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);

    let totalIncome = 0, totalExpense = 0, count = 0;
    result.forEach(item => {
      if (item._id === 'income')  totalIncome  = item.total;
      if (item._id === 'expense') totalExpense = item.total;
      count += item.count;
    });

    res.json({
      balance: totalIncome - totalExpense,
      totalIncome,
      totalExpense,
      count
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// 6. Gastos por categoría con filtro de fechas
// Fase 1.2b — Usa aggregate + acepta startDate/endDate desde el frontend
// ─────────────────────────────────────────────
export const getExpensesByCategory = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const match = { user: uid(req), type: 'expense' };

    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate)   match.date.$lte = new Date(endDate);
    }

    const result = await Transaction.aggregate([
      { $match: match },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } }
    ]);

    const report = {};
    result.forEach(item => { report[item._id] = item.total; });
    res.json(report);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// 7. Resumen inteligente (mes actual vs anterior)
// Fase 1.2 — Usa aggregate con Promise.all para mayor eficiencia
// ─────────────────────────────────────────────
export const getMonthlyInsights = async (req, res, next) => {
  try {
    const now = new Date();
    const firstDayCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLast    = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLast     = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [currentResult, lastResult] = await Promise.all([
      Transaction.aggregate([
        { $match: { user: uid(req), type: 'expense', date: { $gte: firstDayCurrent } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Transaction.aggregate([
        { $match: { user: uid(req), type: 'expense', date: { $gte: firstDayLast, $lte: lastDayLast } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ])
    ]);

    const totalCurrent = currentResult[0]?.total || 0;
    const totalLast    = lastResult[0]?.total    || 0;
    let diff = 0;
    if (totalLast > 0) diff = ((totalCurrent - totalLast) / totalLast) * 100;

    res.json({
      currentMonthExpenses: totalCurrent,
      lastMonthExpenses: totalLast,
      percentageDiff: diff.toFixed(2),
      message: diff > 0
        ? `Estás gastando un ${diff.toFixed(1)}% más que el mes pasado`
        : `Has gastado un ${Math.abs(diff).toFixed(1)}% menos que el mes pasado`
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// 8. Evolución mensual
// Fase 1.2c — Ahora incluye INGRESOS además de gastos usando aggregate
// ─────────────────────────────────────────────
export const getMonthlyEvolution = async (req, res, next) => {
  try {
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const result = await Transaction.aggregate([
      {
        $match: {
          user: uid(req),
          date: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year:  { $year: "$date" },
            month: { $month: "$date" },
            type:  "$type"
          },
          total: { $sum: "$amount" }
        }
      }
    ]);

    const evolution = [];
    for (let i = 5; i >= 0; i--) {
      const date     = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthIdx = date.getMonth() + 1; // $month es 1-indexed
      const year     = date.getFullYear();

      const incomeEntry  = result.find(r => r._id.month === monthIdx && r._id.year === year && r._id.type === 'income');
      const expenseEntry = result.find(r => r._id.month === monthIdx && r._id.year === year && r._id.type === 'expense');

      evolution.push({
        month:   monthNames[date.getMonth()],
        income:  incomeEntry?.total  || 0,
        expense: expenseEntry?.total || 0,
        amount:  expenseEntry?.total || 0  // backward compat con frontend antiguo
      });
    }
    res.json(evolution);
  } catch (error) {
    next(error);
  }
};
