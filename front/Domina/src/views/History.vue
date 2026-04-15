<script setup>
import { onMounted, ref, computed } from 'vue';
import { ChevronLeft, ChevronRight, Search, Trash2, Pencil, X } from 'lucide-vue-next';
import { useTransactionStore } from '../store/transactionStore';
import { useCategoryIcon } from '../composables/useCategoryIcon';
import TransactionModal from '../components/TransactionModal.vue';

const store = useTransactionStore();
const { getCategoryIcon } = useCategoryIcon();

// ─── Tabs ──────────────────────────────────────
const activeTab = ref('Todos');

// ─── Búsqueda — Fase 3.2a ──────────────────────
const search        = ref('');
const showSearchBar = ref(false);

// ─── Navegación por mes — Fase 3.2b ────────────
const currentDate = ref(new Date());

const displayMonth = computed(() =>
  currentDate.value.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
);

const isCurrentMonth = computed(() => {
  const now = new Date();
  return currentDate.value.getMonth() === now.getMonth() &&
         currentDate.value.getFullYear() === now.getFullYear();
});

const navPrevMonth = () => {
  const d = new Date(currentDate.value);
  d.setDate(1);
  d.setMonth(d.getMonth() - 1);
  currentDate.value = d;
};

const navNextMonth = () => {
  if (isCurrentMonth.value) return;
  const d = new Date(currentDate.value);
  d.setDate(1);
  d.setMonth(d.getMonth() + 1);
  currentDate.value = d;
};

// ─── Filtrado (mes + tab + búsqueda) ───────────
const filteredTransactions = computed(() => {
  const year  = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();

  return store.transactions
    .filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() === month;
    })
    .filter(t => {
      if (activeTab.value === 'Ingresos') return t.type === 'income';
      if (activeTab.value === 'Gastos')   return t.type === 'expense';
      return true;
    })
    .filter(t => {
      if (!search.value.trim()) return true;
      const q = search.value.toLowerCase();
      return t.category.toLowerCase().includes(q) ||
             (t.description || '').toLowerCase().includes(q);
    });
});

// ─── Formateo de fecha ISO — Fase 5.3 ──────────
const formatDate = (isoDate) => {
  if (!isoDate) return '';
  try {
    return new Date(isoDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
  } catch { return ''; }
};

// ─── Eliminar con modal de confirmación ─────────
const deleteTarget = ref(null);
const openDelete   = (id) => { deleteTarget.value = id; };
const cancelDelete = ()   => { deleteTarget.value = null; };
const confirmDelete = async () => {
  if (deleteTarget.value) {
    await store.removeTransaction(deleteTarget.value);
    deleteTarget.value = null;
  }
};

// ─── Editar — Fase 4.1 ─────────────────────────
const editTarget    = ref(null);
const showEditModal = ref(false);

const openEditModal  = (item) => { editTarget.value = item; showEditModal.value = true; };
const closeEditModal = ()     => { showEditModal.value = false; editTarget.value = null; };

onMounted(() => {
  store.fetchTransactions({ limit: 200 });
});
</script>

<template>
  <div class="px-6 pt-6 pb-32 bg-[#0b111b] min-h-screen">

    <!-- Header -->
    <header class="flex justify-between items-center mb-8">
      <router-link to="/" class="p-2 border border-white/10 rounded-xl active:scale-95 transition-all">
        <ChevronLeft class="w-5 h-5" />
      </router-link>
      <h1 class="text-xl font-bold">Historial</h1>
      <button
        @click="showSearchBar = !showSearchBar; if(!showSearchBar) search = ''"
        :class="['p-2 border rounded-xl transition-all active:scale-95', showSearchBar ? 'border-blue-500 text-blue-500 bg-blue-500/10' : 'border-white/10']"
      >
        <Search class="w-5 h-5" />
      </button>
    </header>

    <!-- Fase 3.2a — Barra de búsqueda collapsible -->
    <transition name="slide-down">
      <div v-if="showSearchBar" class="mb-4">
        <div class="relative">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            v-model="search"
            type="text"
            placeholder="Buscar por categoría o descripción..."
            autofocus
            class="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-10 outline-none focus:border-blue-500/50 transition-all text-sm"
          />
          <button v-if="search" @click="search = ''" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
    </transition>

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

    <!-- Fase 3.2b — Selector de mes con navegación real -->
    <div class="flex justify-between items-center mb-6">
      <button
        @click="navPrevMonth"
        class="p-2 border border-white/10 rounded-xl active:scale-95 transition-all hover:bg-white/5"
      >
        <ChevronLeft class="w-4 h-4" />
      </button>
      <div class="text-center">
        <span class="text-[11px] font-bold text-slate-300 uppercase tracking-widest capitalize">
          {{ displayMonth }}
        </span>
        <p class="text-[10px] text-slate-600 font-medium mt-0.5">
          {{ filteredTransactions.length }} movimiento{{ filteredTransactions.length !== 1 ? 's' : '' }}
        </p>
      </div>
      <button
        @click="navNextMonth"
        :class="['p-2 border rounded-xl transition-all', isCurrentMonth ? 'border-white/5 text-slate-700 cursor-not-allowed' : 'border-white/10 hover:bg-white/5 active:scale-95']"
        :disabled="isCurrentMonth"
      >
        <ChevronRight class="w-4 h-4" />
      </button>
    </div>

    <!-- Loading skeleton -->
    <div v-if="store.loading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="h-18 bg-white/5 animate-pulse rounded-2xl"></div>
    </div>

    <!-- Lista de transacciones -->
    <div v-else class="space-y-3">
      <div
        v-for="item in filteredTransactions"
        :key="item._id"
        class="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-2xl px-4 py-3 group"
      >
        <div class="flex items-center gap-3">
          <!-- Fase 3.2c — ícono usando composable compartido -->
          <div
            class="w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            :style="{ backgroundColor: item.type === 'income' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }"
          >
            {{ getCategoryIcon(item.category) }}
          </div>
          <div>
            <p class="font-bold text-[14px]">{{ item.category }}</p>
            <!-- Fase 5.3 — Formatea fecha ISO como string legible -->
            <p class="text-[10px] text-slate-500 font-medium">
              {{ formatDate(item.date) }} · {{ item.description || 'General' }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <p :class="item.type === 'income' ? 'text-emerald-500' : 'text-rose-500'" class="font-bold text-base tracking-tight">
            {{ item.type === 'income' ? '+' : '-' }}${{ item.amount.toLocaleString('es-CO') }}
          </p>
          <!-- Fase 4.1 — Botones de editar y eliminar -->
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
            <button
              @click="openEditModal(item)"
              class="p-1.5 text-slate-600 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
            >
              <Pencil class="w-3.5 h-3.5" />
            </button>
            <button
              @click="openDelete(item._id)"
              class="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div v-if="filteredTransactions.length === 0" class="py-20 text-center">
        <p class="text-4xl mb-4">📭</p>
        <p class="text-slate-500 text-sm font-medium">
          {{ search ? 'No hay resultados para tu búsqueda' : 'No hay movimientos este mes' }}
        </p>
      </div>
    </div>

    <!-- Modal confirmar eliminación -->
    <transition name="modal-fade">
      <div v-if="deleteTarget" class="fixed inset-0 z-[200] flex items-center justify-center p-6">
        <div @click="cancelDelete" class="absolute inset-0 bg-black/80 backdrop-blur-md"></div>
        <div class="relative bg-[#161d29] border border-white/10 w-full max-w-sm rounded-[40px] p-8 shadow-2xl text-center animate-scale-in">
          <div class="w-16 h-16 bg-rose-500/10 rounded-[24px] flex items-center justify-center mx-auto mb-5">
            <Trash2 class="w-8 h-8 text-rose-500" />
          </div>
          <h3 class="text-lg font-bold mb-2">¿Eliminar movimiento?</h3>
          <p class="text-slate-400 text-sm mb-8">Esta acción no se puede deshacer.</p>
          <div class="flex gap-4">
            <button @click="cancelDelete" class="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-2xl font-bold text-sm transition-all">Cancelar</button>
            <button @click="confirmDelete" class="flex-1 py-3 bg-rose-600 hover:bg-rose-500 rounded-2xl font-bold text-sm text-white transition-all shadow-lg shadow-rose-600/20">Eliminar</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Fase 4.1 — Modal de edición -->
    <TransactionModal
      v-if="showEditModal"
      :show="showEditModal"
      :transaction="editTarget"
      @close="closeEditModal"
    />
  </div>
</template>

<style scoped>
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.25s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-8px); }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

@keyframes scale-in { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.animate-scale-in { animation: scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
</style>
