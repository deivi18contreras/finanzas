<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { X, Save, Pencil } from 'lucide-vue-next';
import { useTransactionStore } from '../store/transactionStore';

const props = defineProps({
  show:        Boolean,
  type:        String,      // 'income' | 'expense' — solo para modo CREATE
  transaction: {            // objeto Transaction — modo EDIT (Fase 4.1)
    type:    Object,
    default: null
  }
});

const emit = defineEmits(['close']);
const store = useTransactionStore();

// ─── Modo edición/creación ────────────────────
const isEditing    = computed(() => !!props.transaction);
const effectiveType = computed(() =>
  isEditing.value ? props.transaction?.type : props.type
);

// ─── Categorías filtradas por tipo ────────────
const categories = [
  // Gastos — Servicios
  { name: 'Agua',              icon: '💧', type: 'expense' },
  { name: 'Gas',               icon: '🔥', type: 'expense' },
  { name: 'Luz',               icon: '⚡', type: 'expense' },
  { name: 'Internet',          icon: '🌐', type: 'expense' },
  // Gastos — Alimentación
  { name: 'D1 / Ara',          icon: '🛒', type: 'expense' },
  { name: 'Supermercado',      icon: '🏪', type: 'expense' },
  { name: 'Plaza de Mercado',  icon: '🍎', type: 'expense' },
  { name: 'Restaurante',       icon: '🍔', type: 'expense' },
  // Gastos — Salud
  { name: 'Gym / Deporte',     icon: '🏋️', type: 'expense' },
  { name: 'Voleyvol',          icon: '🏐', type: 'expense' },
  { name: 'Farmacia',          icon: '💊', type: 'expense' },
  { name: 'Médico',            icon: '🏥', type: 'expense' },
  // Gastos — Transporte
  { name: 'Taxi / Uber',       icon: '🚕', type: 'expense' },
  { name: 'Gasolina',          icon: '⛽', type: 'expense' },
  { name: 'Bus / Metro',       icon: '🚌', type: 'expense' },
  // Gastos — Otros
  { name: 'Arriendo / Vivienda', icon: '🏠', type: 'expense' },
  { name: 'Suscripciones',     icon: '📺', type: 'expense' },
  { name: 'Regalos',           icon: '🎁', type: 'expense' },
  // Ingresos
  { name: 'Ahorro',            icon: '🏦', type: 'income' },
  { name: 'Salario',           icon: '💼', type: 'income' },
  { name: 'Otros',             icon: '💸', type: 'both' }
];

const filteredCategories = computed(() =>
  categories.filter(cat => cat.type === effectiveType.value || cat.type === 'both')
);

// ─── Formulario ──────────────────────────────
const loading  = ref(false);
const errorMsg = ref('');

const formData = reactive({
  amount:      '',
  category:    '',
  description: '',
  // Fase 3.3 — Campo fecha editable iniciado con hoy
  date: new Date().toISOString().split('T')[0]
});

// Pre-llenar formulario en modo edición
watch(() => props.transaction, (txn) => {
  if (txn) {
    formData.amount      = txn.amount;
    formData.category    = txn.category;
    formData.description = txn.description || '';
    // Fase 5.3 — Parsea la fecha ISO del backend
    formData.date = txn.date
      ? new Date(txn.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
  } else {
    formData.amount      = '';
    formData.category    = '';
    formData.description = '';
    formData.date        = new Date().toISOString().split('T')[0];
  }
}, { immediate: true });

// ─── Guardar ─────────────────────────────────
const handleSave = async () => {
  if (!formData.amount || !formData.category) return;

  loading.value  = true;
  errorMsg.value = '';

  try {
    const payload = {
      ...formData,
      amount: Number(formData.amount),
      type:   effectiveType.value
    };

    if (isEditing.value) {
      await store.editTransaction(props.transaction._id, payload);
    } else {
      await store.addTransaction(payload);
    }

    // Reset y cerrar
    formData.amount      = '';
    formData.category    = '';
    formData.description = '';
    formData.date        = new Date().toISOString().split('T')[0];
    emit('close');
  } catch (err) {
    // Fase 3.3 — Ahora el usuario ve el error en vez de solo console.error
    errorMsg.value = err?.message || 'Error al guardar. Inténtalo de nuevo.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
    <div @click="emit('close')" class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>

    <div class="relative w-full max-w-md bg-[#161d29] rounded-t-[40px] sm:rounded-[40px] shadow-2xl p-8 border-t border-white/10 sm:border-x sm:border-b overflow-hidden animate-slide-up">

      <!-- Cabecera -->
      <header class="flex justify-between items-center mb-6">
        <div class="flex items-center gap-4">
          <div :class="['w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg',
            effectiveType === 'income' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/20']">
            <Pencil v-if="isEditing"           class="w-6 h-6" />
            <X      v-else-if="effectiveType === 'expense'" class="w-6 h-6" />
            <Save   v-else                     class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-xl font-bold">
              {{ isEditing ? 'Editar' : 'Añadir' }}
              {{ effectiveType === 'income' ? 'Ingreso' : 'Gasto' }}
            </h2>
            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Completa los datos</p>
          </div>
        </div>
        <button @click="emit('close')" class="p-2 hover:bg-white/5 rounded-xl transition-all">
          <X class="w-6 h-6 text-slate-500" />
        </button>
      </header>

      <form @submit.prevent="handleSave" class="space-y-5">

        <!-- Fase 3.3 — Error visible al usuario -->
        <div v-if="errorMsg" class="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-3 px-4 rounded-xl text-center">
          {{ errorMsg }}
        </div>

        <!-- Monto -->
        <div class="flex items-center justify-center p-5 bg-white/5 rounded-[24px] border border-white/10 focus-within:border-blue-500/50 transition-all">
          <span class="text-2xl font-bold text-slate-500 mr-2">$</span>
          <input
            v-model="formData.amount"
            type="number"
            placeholder="0"
            class="bg-transparent text-4xl font-extrabold outline-none w-full text-center placeholder:text-slate-800"
            required
            step="any"
            min="1"
          />
        </div>

        <!-- Categoría -->
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Categoría</label>
          <select
            v-model="formData.category"
            required
            class="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
          >
            <option value="" disabled class="bg-gray-900">Selecciona una</option>
            <option v-for="cat in filteredCategories" :key="cat.name" :value="cat.name" class="bg-gray-900">
              {{ cat.icon }} {{ cat.name }}
            </option>
          </select>
        </div>

        <!-- Fase 3.3 — Fecha editable (antes era solo texto con la fecha de hoy) -->
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Fecha</label>
          <input
            v-model="formData.date"
            type="date"
            class="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-blue-500 transition-all text-sm text-slate-300"
            :max="new Date().toISOString().split('T')[0]"
          />
        </div>

        <!-- Descripción -->
        <div>
          <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Descripción (Opcional)</label>
          <textarea
            v-model="formData.description"
            rows="2"
            class="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500/50 transition-all text-sm resize-none"
            placeholder="¿En qué consiste este movimiento?"
          ></textarea>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="loading"
          :class="[
            'w-full py-5 rounded-2xl font-bold text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3',
            effectiveType === 'income' ? 'bg-emerald-500 shadow-emerald-500/20 hover:bg-emerald-400' : 'bg-rose-500 shadow-rose-500/20 hover:bg-rose-400',
            loading ? 'opacity-70 cursor-not-allowed' : ''
          ]"
        >
          <div v-if="loading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <template v-else>
            <Save class="w-5 h-5" />
            {{ isEditing ? 'Guardar cambios' : 'Guardar Movimiento' }}
          </template>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
@keyframes slide-up {
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
.animate-slide-up {
  animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
