<template>
  <div class="px-6 pt-6 pb-32 overflow-hidden bg-[#0b111b] min-h-screen">
    <!-- Header -->
    <header class="flex justify-between items-center mb-10">
      <div>
        <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Bienvenido de nuevo</p>
        <h1 class="text-xl font-bold">{{ authStore.user?.name || 'Usuario' }}</h1>
      </div>
      <button 
        @click="showNotifications"
        class="p-2 border border-white/10 rounded-xl relative active:scale-90 transition-transform"
      >
        <Bell class="w-5 h-5" />
        <span class="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full border-2 border-[#0b111b]"></span>
      </button>
    </header>

    <!-- Balance Card -->
    <div class="balance-card p-8 rounded-[32px] mb-8 relative">
      <div class="relative z-10">
        <p class="text-sm font-medium text-slate-400 mb-1">Balance Total</p>
        <h1 class="text-4xl font-extrabold tracking-tight mb-8">
          $ {{ store.summary.balance.toLocaleString('es-CO') }}
        </h1>
        
        <div class="flex gap-8">
          <div>
            <p class="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-0.5">Ingresos</p>
            <p class="text-lg font-bold">+ ${{ store.summary.totalIncome.toLocaleString('es-CO') }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-0.5">Gastos</p>
            <p class="text-lg font-bold">- ${{ store.summary.totalExpense.toLocaleString('es-CO') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="flex gap-4 mb-10">
      <button 
        @click="openModal('income')"
        class="flex-1 bg-[#10b981] hover:brightness-110 text-white font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
      >
        <Plus class="w-5 h-5 bg-white/20 rounded-lg p-0.5" />
        <span>Añadir ingreso</span>
      </button>
      <button 
        @click="openModal('expense')"
        class="flex-1 bg-[#ef4444] hover:brightness-110 text-white font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-500/20"
      >
        <Minus class="w-5 h-5 bg-white/20 rounded-lg p-0.5" />
        <span>Añadir Gasto</span>
      </button>
    </div>

    <!-- Transactions Section -->
    <section>
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold">Movimientos recientes</h2>
        <router-link to="/history" class="text-sm font-semibold text-blue-500">Ver todo</router-link>
      </div>

      <div v-if="store.loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="h-20 bg-white/5 animate-pulse rounded-2xl"></div>
      </div>

      <div v-else class="space-y-4">
        <div 
          v-for="item in store.transactions" 
          :key="item._id"
          class="flex items-center justify-between p-1 group transition-all"
        >
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-[#161d27] border border-white/5 rounded-2xl flex items-center justify-center text-2xl">
              {{ getCategoryIcon(item.category) }}
            </div>
            <div>
              <p class="font-bold text-[16px]">{{ item.category }}</p>
              <p class="text-xs text-slate-500">{{ item.description || (item.type === 'income' ? 'Ingreso' : 'Consumo') }}</p>
            </div>
          </div>
          <div :class="['font-bold text-[17px]', item.type === 'income' ? 'text-emerald-400' : 'text-white']">
            {{ item.type === 'income' ? '+' : '-' }} ${{ item.amount.toLocaleString('es-CO') }}
          </div>
        </div>

        <div v-if="store.transactions.length === 0" class="text-center py-10">
          <p class="text-slate-500 text-sm">No hay movimientos aún</p>
        </div>
      </div>
    </section>

    <TransactionModal 
      v-if="modal.show" 
      :show="modal.show" 
      :type="modal.type" 
      @close="modal.show = false" 
    />
  </div>
</template>

<script setup>
import { onMounted, reactive, inject } from 'vue';
import { Plus, Minus, Bell, ChevronLeft } from 'lucide-vue-next';
import { useTransactionStore } from '../store/transactionStore';
import { useAuthStore } from '../store/authStore';
import TransactionModal from '../components/TransactionModal.vue';

const store = useTransactionStore();
const authStore = useAuthStore();
const showInfo = inject('showInfo');

const modal = reactive({
  show: false,
  type: 'income'
});

const openModal = (type) => {
  modal.type = type;
  modal.show = true;
};

const showNotifications = () => {
  showInfo('Notificaciones', 'No tienes notificaciones pendientes. ¡Tu cuenta de Domina está protegida!', 'bell');
};

const getCategoryIcon = (category) => {
  const icons = {
    'Agua': '💧', 'Gas': '🔥', 'Luz': '⚡', 'Internet': '🌐',
    'D1 / Ara': '🛒', 'Supermercado': '🏪', 'Plaza de Mercado': '🍎',
    'Gym / Deporte': '🏋️', 'Voleyvol': '🏐', 'Farmacia': '💊', 'Salario': '💼',
    'Arriendo / Vivienda': '🏠', 'Suscripciones': '📺', 'Regalos': '🎁', 'Otros': '💸'
  };
  return icons[category] || '💸';
};

onMounted(() => {
  store.fetchSummary();
  store.fetchTransactions({ limit: 4 });
});
</script>

<style scoped>
.balance-card {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  box-shadow: 0 20px 40px -15px rgba(37, 99, 235, 0.4);
}
</style>