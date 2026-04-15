import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { TransactionService } from "../services/TransactionService";

export const useTransactionStore = defineStore("transactions", () => {
    // ─── ESTADO ──────────────────────────────────────
    const transactions = ref([]);
    const summary  = ref({ balance: 0, totalIncome: 0, totalExpense: 0, count: 0 });
    const insights = ref({ message: '', percentageDiff: '0', currentMonthExpenses: 0, lastMonthExpenses: 0 });
    const stats    = ref({});
    const evolution = ref([]);
    const loading  = ref(false);
    const error    = ref(null);

    // ─── GETTERS ─────────────────────────────────────
    const hasTransactions = computed(() => transactions.value.length > 0);

    // ─── ACCIONES ────────────────────────────────────

    const fetchStats = async (params) => {
        try {
            stats.value = await TransactionService.getStats(params);
        } catch (err) {
            console.error("Error al obtener stats:", err);
        }
    };

    const fetchEvolution = async () => {
        try {
            evolution.value = await TransactionService.getEvolution();
        } catch (err) {
            console.error("Error al obtener evolución:", err);
        }
    };

    // Fase 4.2 — Conecta el endpoint de insights que ya existía en backend
    const fetchInsights = async () => {
        try {
            insights.value = await TransactionService.getInsights();
        } catch (err) {
            console.error("Error al obtener insights:", err);
        }
    };

    const fetchTransactions = async (params) => {
        loading.value = true;
        try {
            const response = await TransactionService.getAll(params);
            transactions.value = response.data || response;
        } catch (err) {
            console.error("Error cargando transacciones:", err);
            error.value = err;
        } finally {
            loading.value = false;
        }
    };

    const fetchSummary = async () => {
        try {
            summary.value = await TransactionService.getSummary();
        } catch (err) {
            console.error("Error al obtener resumen:", err);
        }
    };

    // Refresca todos los datos después de una mutación
    const refreshAll = async () => {
        await Promise.all([
            fetchSummary(),
            fetchTransactions(),
            fetchStats(),
            fetchEvolution(),
            fetchInsights()
        ]);
    };

    const addTransaction = async (formData) => {
        await TransactionService.create(formData);
        await refreshAll();
    };

    // Fase 4.1 — Nueva acción para editar transacciones existentes
    const editTransaction = async (id, formData) => {
        await TransactionService.update(id, formData);
        await refreshAll();
    };

    const removeTransaction = async (id) => {
        try {
            await TransactionService.delete(id);
            await refreshAll();
        } catch (err) {
            console.error("Error al eliminar:", err);
        }
    };

    return {
        transactions,
        summary,
        insights,
        stats,
        evolution,
        loading,
        error,
        hasTransactions,
        fetchTransactions,
        fetchSummary,
        fetchStats,
        fetchEvolution,
        fetchInsights,
        addTransaction,
        editTransaction,
        removeTransaction
    };
}, {
    persist: true
});