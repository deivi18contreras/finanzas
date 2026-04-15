<script setup>
import { onMounted, computed, ref } from 'vue';
import { ChevronLeft, Calendar } from 'lucide-vue-next';
import { Doughnut, Line } from 'vue-chartjs';
import {
  Chart as ChartJS, Title, Tooltip, Legend,
  ArcElement, CategoryScale, LinearScale,
  PointElement, LineElement, Filler
} from 'chart.js';
import { useTransactionStore } from '../store/transactionStore';

ChartJS.register(
  Title, Tooltip, Legend, ArcElement,
  CategoryScale, LinearScale, PointElement, LineElement, Filler
);

const store = useTransactionStore();
const activeFilter = ref('este-mes');

// Fase 3.4c — Filtro personalizado con date pickers
const customStart = ref('');
const customEnd   = ref('');

// Colores del gráfico de dona
const CHART_COLORS = [
  '#2563eb', '#10b981', '#ef4444', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316'
];

// ─── Gráfica Doughnut ─────────────────────────
const doughnutData = computed(() => ({
  labels: Object.keys(store.stats),
  datasets: [{
    data: Object.values(store.stats),
    backgroundColor: CHART_COLORS,
    borderWidth: 0,
    cutout: '75%'
  }]
}));

const totalExpenses = computed(() =>
  Object.values(store.stats).reduce((a, b) => a + b, 0)
);

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } }
};

// ─── Gráfica Line (ingresos + gastos) ────────
const lineData = computed(() => ({
  labels: store.evolution.map(e => e.month),
  datasets: [
    {
      label: 'Gastos',
      // Fase 1.2c backward compat: usa e.expense si existe, si no e.amount
      data: store.evolution.map(e => e.expense ?? e.amount ?? 0),
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239,68,68,0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#ef4444'
    },
    {
      label: 'Ingresos',
      data: store.evolution.map(e => e.income ?? 0),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16,185,129,0.05)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#10b981'
    }
  ]
}));

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false  // leyenda manual debajo
    }
  },
  scales: {
    x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
    y: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } }
  }
};

// ─── Filtros de período ───────────────────────
const setFilter = (filter) => {
  activeFilter.value = filter;
  if (filter === 'personalizado') return; // espera a que el usuario aplique

  const now = new Date();
  let startDate, endDate;

  if (filter === 'este-mes') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    // Fase 3.4a — endDate corregido (antes siempre era undefined)
    endDate   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
  } else if (filter === '3-meses') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString();
    endDate   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
  }

  store.fetchStats({ startDate, endDate });
};

// Fase 3.4b — Aplicar filtro personalizado
const applyCustomFilter = () => {
  if (!customStart.value || !customEnd.value) return;
  const startDate = new Date(customStart.value).toISOString();
  const endDate   = new Date(customEnd.value + 'T23:59:59').toISOString();
  store.fetchStats({ startDate, endDate });
};

onMounted(() => {
  setFilter('este-mes');
  store.fetchEvolution();
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
      <div class="p-2 border border-white/10 rounded-xl">
        <Calendar class="w-5 h-5 text-slate-500" />
      </div>
    </header>

    <!-- Period Selector -->
    <div class="flex bg-white/5 p-1 rounded-2xl mb-6">
      <button
        @click="setFilter('este-mes')"
        :class="['flex-1 py-2.5 rounded-xl text-xs font-bold transition-all', activeFilter === 'este-mes' ? 'bg-blue-600 shadow-lg text-white' : 'text-slate-400']"
      >Este mes</button>
      <button
        @click="setFilter('3-meses')"
        :class="['flex-1 py-2.5 rounded-xl text-xs font-bold transition-all', activeFilter === '3-meses' ? 'bg-blue-600 shadow-lg text-white' : 'text-slate-400']"
      >Últimos 3 meses</button>
      <button
        @click="setFilter('personalizado')"
        :class="['flex-1 py-2.5 rounded-xl text-xs font-bold transition-all', activeFilter === 'personalizado' ? 'bg-blue-600 shadow-lg text-white' : 'text-slate-400']"
      >Personalizado</button>
    </div>

    <!-- Fase 3.4b — Date pickers del filtro personalizado -->
    <transition name="slide-down">
      <div v-if="activeFilter === 'personalizado'" class="mb-6 bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
        <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rango personalizado</p>
        <div class="flex gap-3">
          <div class="flex-1">
            <label class="text-[9px] text-slate-600 font-bold uppercase tracking-wider mb-1 block">Desde</label>
            <input
              v-model="customStart"
              type="date"
              class="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 outline-none focus:border-blue-500 text-xs text-slate-300 transition-all"
            />
          </div>
          <div class="flex-1">
            <label class="text-[9px] text-slate-600 font-bold uppercase tracking-wider mb-1 block">Hasta</label>
            <input
              v-model="customEnd"
              type="date"
              class="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 outline-none focus:border-blue-500 text-xs text-slate-300 transition-all"
            />
          </div>
        </div>
        <button
          @click="applyCustomFilter"
          :disabled="!customStart || !customEnd"
          class="w-full py-2.5 bg-blue-600 disabled:bg-blue-600/30 disabled:cursor-not-allowed hover:bg-blue-500 rounded-xl font-bold text-xs text-white transition-all"
        >Aplicar filtro</button>
      </div>
    </transition>

    <!-- Loading -->
    <div v-if="store.loading" class="space-y-8">
      <div class="h-64 bg-white/5 animate-pulse rounded-[32px]"></div>
      <div class="h-48 bg-white/5 animate-pulse rounded-[32px]"></div>
    </div>

    <div v-else>
      <!-- Doughnut Chart -->
      <section class="mb-12">
        <div class="flex justify-between items-center mb-6">
          <h2 class="font-bold">Gastos por categoría</h2>
          <span v-if="totalExpenses" class="text-xs text-slate-500 font-medium">
            ${{ totalExpenses.toLocaleString('es-CO') }} total
          </span>
        </div>

        <div class="relative h-52 flex items-center justify-center">
          <Doughnut v-if="Object.keys(store.stats).length" :data="doughnutData" :options="doughnutOptions" />
          <div v-else class="text-slate-500 italic text-sm text-center">Sin gastos en este periodo</div>

          <div v-if="Object.keys(store.stats).length" class="absolute flex flex-col items-center pointer-events-none">
            <span class="text-xs font-medium text-slate-400">Total</span>
            <span class="text-xl font-bold">${{ totalExpenses.toLocaleString('es-CO') }}</span>
          </div>
        </div>

        <!-- Fase 3.4c — Leyenda de categorías -->
        <div v-if="Object.keys(store.stats).length" class="flex flex-wrap gap-x-4 gap-y-2 mt-5 px-1">
          <div
            v-for="(value, label, index) in store.stats"
            :key="label"
            class="flex items-center gap-1.5"
          >
            <span
              class="w-2.5 h-2.5 rounded-full flex-shrink-0"
              :style="{ background: CHART_COLORS[index % CHART_COLORS.length] }"
            ></span>
            <span class="text-xs text-slate-400 font-medium">{{ label }}</span>
            <span class="text-xs text-slate-600">${{ value.toLocaleString('es-CO') }}</span>
          </div>
        </div>
      </section>

      <!-- Line Chart (ingresos y gastos) -->
      <section>
        <div class="flex justify-between items-center mb-6">
          <h2 class="font-bold">Evolución mensual</h2>
          <!-- Leyenda manual del line chart -->
          <div class="flex items-center gap-3">
            <span class="flex items-center gap-1 text-xs text-slate-500">
              <span class="w-2 h-2 rounded-full bg-rose-500"></span> Gastos
            </span>
            <span class="flex items-center gap-1 text-xs text-slate-500">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Ingresos
            </span>
          </div>
        </div>
        <div class="h-52">
          <Line v-if="store.evolution.length" :data="lineData" :options="lineOptions" />
          <div v-else class="h-full flex items-center justify-center text-slate-500 italic text-sm">
            Sin datos suficientes
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-10px); }
</style>
