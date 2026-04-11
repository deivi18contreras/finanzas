<script setup>
import { onMounted, ref, computed } from 'vue';
import { ChevronLeft, Search, ChevronDown, Trash2 } from 'lucide-vue-next';
import { useTransactionStore } from '../store/transactionStore';

const store = useTransactionStore();
const activeTab = ref('Todos');

const filteredTransactions = computed(() => {
  if (activeTab.value === 'Ingresos') return store.transactions.filter(t => t.type === 'income');
  if (activeTab.value === 'Gastos') return store.transactions.filter(t => t.type === 'expense');
  return store.transactions;
});

const deleteTransaction = async (id) => {
  if (confirm('¿Eliminar este movimiento?')) {
    await store.removeTransaction(id);
  }
};

onMounted(() => {
  store.fetchTransactions();
});
</script>

<template>
  <div class="px-6 pt-6 pb-32 bg-[#0b111b] min-h-screen">
    <!-- Header -->
    <header class="flex justify-between items-center mb-8">
      <router-link to="/" class="p-2 border border-white/10 rounded-xl">
        <ChevronLeft class="w-5 h-5" />
      </router-link>
      <h1 class="text-xl font-bold">Historial</h1>
      <div class="p-2 border border-white/10 rounded-xl">
        <Search class="w-5 h-5" />
      </div>
    </header>

    <!-- Tabs -->
    <div class="flex bg-white/5 p-1 rounded-2xl mb-8">
      <button 
        v-for="tab in ['Todos', 'Ingresos', 'Gastos']" 
        :key="tab"
        @click="activeTab = tab"
        :class="activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'"
        class="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
      >
        {{ tab }}
      </button>
    </div>

    <!-- Month Selector -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex flex-col">
        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Abril 2024</span>
      </div>
      <ChevronDown class="w-4 h-4 text-slate-500" />
    </div>

    <!-- List -->
    <div v-if="store.loading" class="space-y-4">
      <div v-for="i in 5" :key="i" class="h-20 bg-white/5 animate-pulse rounded-2xl"></div>
    </div>

    <div v-else class="space-y-6">
      <div 
        v-for="item in filteredTransactions" 
        :key="item._id"
        class="flex items-center justify-between group"
      >
        <div class="flex items-center gap-4">
          <div 
            class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl border border-white/5"
            :style="{ backgroundColor: item.type === 'income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }"
          >
            {{ item.category === 'Salario' ? '💼' : item.category === 'Comida' ? '🍔' : '💸' }}
          </div>
          <div>
            <p class="font-bold text-[15px]">{{ item.category }}</p>
            <p class="text-[10px] text-slate-500 font-medium">{{ item.date }} • {{ item.description || 'General' }}</p>
          </div>
        </div>
        <div class="text-right flex items-center gap-4">
          <p :class="item.type === 'income' ? 'text-emerald-500' : 'text-rose-500'" class="font-bold text-lg tracking-tight">
            {{ item.type === 'income' ? '+' : '-' }}${{ item.amount.toLocaleString('es-CO') }}
          </p>
          <button @click="deleteTransaction(item._id)" class="opacity-0 group-hover:opacity-100 p-2 text-rose-500/50 hover:text-rose-500 transition-all">
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>

      <div v-if="filteredTransactions.length === 0" class="py-20 text-center opacity-30 italic">
        No hay movimientos en esta categoría
      </div>
    </div>
  </div>
</template>
