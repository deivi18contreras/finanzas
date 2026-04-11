<script setup>
import { onMounted, reactive, computed, ref } from 'vue';
import { ChevronLeft, Calendar } from 'lucide-vue-next';
import { Doughnut, Line } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { useTransactionStore } from '../store/transactionStore';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Filler);

const store = useTransactionStore();
const activeFilter = ref('este-mes');

const doughnutData = computed(() => ({
  labels: Object.keys(store.stats),
  datasets: [{
    data: Object.values(store.stats),
    backgroundColor: ['#2563eb', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'],
    borderWidth: 0,
    cutout: '75%'
  }]
}));

const totalExpenses = computed(() => {
  return Object.values(store.stats).reduce((a, b) => a + b, 0);
});

const lineData = computed(() => ({
  labels: store.evolution.map(e => e.month),
  datasets: [{
    label: 'Gastos',
    data: store.evolution.map(e => e.amount),
    borderColor: '#2563eb',
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    fill: true,
    tension: 0.4
  }]
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } }
};

const setFilter = (filter) => {
  activeFilter.value = filter;
  const now = new Date();
  let startDate, endDate;

  if (filter === 'este-mes') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  } else if (filter === '3-meses') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString();
  }
  
  // Llamamos al store con los parámetros de fecha
  store.fetchStats({ startDate, endDate });
};

onMounted(() => {
  setFilter('este-mes');
  store.fetchEvolution(); // La evolución suele ser de los últimos 6 meses fijos
});
</script>

<template>
  <div class="px-6 pt-6 pb-32 bg-[#0b111b] min-h-screen">
    <!-- Header -->
    <header class="flex justify-between items-center mb-8">
      <router-link to="/" class="p-2 border border-white/10 rounded-xl active:scale-95 transition-all">
        <ChevronLeft class="w-5 h-5" />
      </router-link>
      <h1 class="text-xl font-bold">Reportes</h1>
      <button class="p-2 border border-white/10 rounded-xl hover:bg-white/5 active:scale-95 transition-all">
        <Calendar class="w-5 h-5" />
      </button>
    </header>

    <!-- Period Selector -->
    <div class="flex bg-white/5 p-1 rounded-2xl mb-10">
      <button 
        @click="setFilter('este-mes')"
        :class="['flex-1 py-2.5 rounded-xl text-xs font-bold transition-all', activeFilter === 'este-mes' ? 'bg-blue-600 shadow-lg text-white' : 'text-slate-400']"
      >
        Este mes
      </button>
      <button 
        @click="setFilter('3-meses')"
        :class="['flex-1 py-2.5 rounded-xl text-xs font-bold transition-all', activeFilter === '3-meses' ? 'bg-blue-600 shadow-lg text-white' : 'text-slate-400']"
      >
        Últimos 3 meses
      </button>
      <button 
        @click="setFilter('personalizado')"
        :class="['flex-1 py-2.5 rounded-xl text-xs font-bold transition-all', activeFilter === 'personalizado' ? 'bg-blue-600 shadow-lg text-white' : 'text-slate-400']"
      >
        Personalizado
      </button>
    </div>

    <div v-if="store.loading" class="space-y-12">
      <div class="h-64 bg-white/5 animate-pulse rounded-[32px]"></div>
      <div class="h-48 bg-white/5 animate-pulse rounded-[32px]"></div>
    </div>

    <div v-else>
      <!-- Doughnut Chart Section -->
      <section class="mb-12">
        <div class="flex justify-between items-center mb-6">
          <h2 class="font-bold">Gastos por categoría</h2>
        </div>
        <div class="relative h-64 flex items-center justify-center">
          <Doughnut v-if="Object.keys(store.stats).length" :data="doughnutData" :options="chartOptions" />
          <div v-else class="text-slate-500 italic text-sm text-center">No hay gastos este periodo</div>
          
          <div v-if="Object.keys(store.stats).length" class="absolute flex flex-col items-center">
            <span class="text-xs font-medium text-slate-400">Total</span>
            <span class="text-xl font-bold">${{ totalExpenses.toLocaleString('es-CO') }}</span>
          </div>
        </div>
      </section>

      <!-- Line Chart Section -->
      <section>
        <div class="flex justify-between items-center mb-6">
          <h2 class="font-bold">Evolución mensual</h2>
        </div>
        <div class="h-48">
          <Line v-if="store.evolution.length" :data="lineData" :options="chartOptions" />
        </div>
      </section>
    </div>
  </div>
</template>
