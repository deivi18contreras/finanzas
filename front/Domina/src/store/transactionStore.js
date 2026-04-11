import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { TransactionService } from "../services/TransactionService";

export const useTransactionStore = defineStore("transactions", () => {
    // --- ESTADO (Refs) ---
    const transactions = ref([]);
    const summary = ref({
        balance: 0,
        totalIncome: 0,
        totalExpense: 0
    });
    const insights = ref({ message: '', percentageDiff: 0 });
    const stats = ref({});
    const evolution = ref([]);
    const loading = ref(false);

    // --- GETTERS ---
    const hasTransactions = computed(() => transactions.value.length > 0);

    // --- ACCIONES ---
    
    // Cargar estadísticas por categoría
    const fetchStats = async (params) => {
        try {
            stats.value = await TransactionService.getStats(params);
        } catch (error) {
            console.error("Error al obtener stats:", error);
        }
    };

    // Cargar evolución mensual
    const fetchEvolution = async () => {
        try {
            evolution.value = await TransactionService.getEvolution();
        } catch (error) {
            console.error("Error al obtener evolución:", error);
        }
    };

    const fetchTransactions = async (params) => {
        loading.value = true;
        try {
            const response = await TransactionService.getAll(params);
            transactions.value = response.data || response; 
        } catch (error) {
            console.error("Error cargando transacciones:", error);
        } finally {
            loading.value = false;
        }
    };

    const fetchSummary = async () => {
        try {
            summary.value = await TransactionService.getSummary();
        } catch (error) {
            console.error("Error al obtener resumen:", error);
        }
    };

    const addTransaction = async (formData) => {
        try {
            await TransactionService.create(formData);
            await Promise.all([
                fetchSummary(),
                fetchTransactions(),
                fetchStats(),
                fetchEvolution()
            ]);
        } catch (error) {
            throw error;
        }
    };

    const removeTransaction = async (id) => {
        try {
            await TransactionService.delete(id);
            await Promise.all([
                fetchSummary(),
                fetchTransactions(),
                fetchStats(),
                fetchEvolution()
            ]);
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    };

    return {
        transactions,
        summary,
        insights,
        stats,
        evolution,
        loading,
        hasTransactions,
        fetchTransactions,
        fetchSummary,
        fetchStats,
        fetchEvolution,
        addTransaction,
        removeTransaction
    };
}, 
{
    persist: true 
});