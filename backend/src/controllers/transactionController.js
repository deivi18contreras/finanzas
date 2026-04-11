import Transaction from "../models/Transaction.js";

// 1. Crear transacción
export const createTransaction = async (req, res, next) => {
  try {
    const { type, amount, description, category } = req.body;
    if (!type || !amount || !category) {
      res.status(400);
      return next(new Error("Tipo, monto y categoría son obligatorios"));
    }
    const transaction = new Transaction({ 
      user: req.user._id, 
      type, 
      amount, 
      description, 
      category 
    });
    const saved = await transaction.save();
    res.status(201).json(saved); 
  } catch (error) {
    next(error);
  }
};

// 2. Obtener todas con filtros
export const getTransactions = async (req, res, next) => {
  try {
    const { startDate, endDate, page = 1, limit = 20 } = req.query;
    let query = { user: req.user._id };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    const skip = (page - 1) * limit;
    const data = await Transaction.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));
    const total = await Transaction.countDocuments(query);
    res.json({
      metadata: { totalRegisters: total, currentPage: Number(page), totalPages: Math.ceil(total / limit) },
      data
    });
  } catch (error) {
    next(error);
  }
};

// 3. Actualizar
export const updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await Transaction.findOneAndUpdate(
      { _id: id, user: req.user._id }, 
      req.body, 
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

// 4. Eliminar
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

// 5. Resumen financiero (Dashboard)
export const getTransactionSummary = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id });
    const summary = transactions.reduce((acc, item) => {
      if (item.type === 'income') acc.totalIncome += item.amount;
      else if (item.type === 'expense') acc.totalExpense += item.amount;
      return acc;
    }, { totalIncome: 0, totalExpense: 0 });
    res.json({
      balance: summary.totalIncome - summary.totalExpense,
      totalIncome: summary.totalIncome,
      totalExpense: summary.totalExpense,
      count: transactions.length
    });
  } catch (error) {
    next(error);
  }
};

// 6. Gastos por categoría
export const getExpensesByCategory = async (req, res, next) => {
  try {
    const expenses = await Transaction.find({ user: req.user._id, type: 'expense' });
    const report = expenses.reduce((acc, item) => {
      const { category, amount } = item;
      if (!acc[category]) acc[category] = 0;
      acc[category] += amount;
      return acc;
    }, {});
    res.json(report);
  } catch (error) {
    next(error);
  }
};

// 7. Resumen inteligente
export const getMonthlyInsights = async (req, res, next) => {
  try {
    const now = new Date();
    const firstDayCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLast = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLast = new Date(now.getFullYear(), now.getMonth(), 0);
    const currentMonth = await Transaction.find({ user: req.user._id, type: 'expense', date: { $gte: firstDayCurrent } });
    const lastMonth = await Transaction.find({ user: req.user._id, type: 'expense', date: { $gte: firstDayLast, $lte: lastDayLast } });
    const totalCurrent = currentMonth.reduce((sum, item) => sum + item.amount, 0);
    const totalLast = lastMonth.reduce((sum, item) => sum + item.amount, 0);
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

// 8. Evolución mensual
export const getMonthlyEvolution = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id, type: 'expense' });
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const now = new Date();
    const evolution = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthIndex = date.getMonth();
      const year = date.getFullYear();
      const total = transactions
        .filter(t => {
          const tDate = new Date(t.date);
          return tDate.getMonth() === monthIndex && tDate.getFullYear() === year;
        })
        .reduce((sum, t) => sum + t.amount, 0);
      evolution.push({ month: monthNames[monthIndex], amount: total });
    }
    res.json(evolution);
  } catch (error) {
    next(error);
  }
};
