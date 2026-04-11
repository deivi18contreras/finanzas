<script setup>
import { ref, reactive, computed, defineEmits, defineProps } from 'vue';
import { X, Save } from 'lucide-vue-next';
import { useTransactionStore } from '../store/transactionStore';

const props = defineProps({
  show: Boolean,
  type: String // 'income' or 'expense'
});

const categories = [
  // Servicios Públicos - GASTOS
  { name: 'Agua', icon: '💧', type: 'expense' },
  { name: 'Gas', icon: '🔥', type: 'expense' },
  { name: 'Luz', icon: '⚡', type: 'expense' },
  { name: 'Internet', icon: '🌐', type: 'expense' },
  // Alimentación - GASTOS
  { name: 'D1 / Ara', icon: '🛒', type: 'expense' },
  { name: 'Supermercado', icon: '🏪', type: 'expense' },
  { name: 'Plaza de Mercado', icon: '🍎', type: 'expense' },
  { name: 'Restaurante', icon: '🍔', type: 'expense' },
  // Salud y Bienestar - GASTOS
  { name: 'Gym / Deporte', icon: '🏋️', type: 'expense' },
  { name: 'Voleyvol', icon: '🏐', type: 'expense' },
  { name: 'Farmacia', icon: '💊', type: 'expense' },
  { name: 'Médico', icon: '🏥', type: 'expense' },
  // Transporte - GASTOS
  { name: 'Taxi / Uber', icon: '🚕', type: 'expense' },
  { name: 'Gasolina', icon: '⛽', type: 'expense' },
  { name: 'Bus / Metro', icon: '🚌', type: 'expense' },
  // Otros - GASTOS
  { name: 'Arriendo / Vivienda', icon: '🏠', type: 'expense' },
  { name: 'Suscripciones', icon: '📺', type: 'expense' },
  { name: 'Regalos', icon: '🎁', type: 'expense' },
  // INGRESOS
  { name: 'Ahorro', icon: '🏦', type: 'income' },
  { name: 'Salario', icon: '💼', type: 'income' },
  { name: 'Otros', icon: '💸', type: 'both' }
];

const filteredCategories = computed(() => {
  return categories.filter(cat => cat.type === props.type || cat.type === 'both');
});

const emit = defineEmits(['close']);
const store = useTransactionStore();

const modalRef = ref(null);
const loading = ref(false);

const formData = reactive({
  amount: '',
  category: '',
  description: ''
});

const handleSave = async () => {
  if (!formData.amount || !formData.category) return;
  
  loading.value = true;
  try {
    await store.addTransaction({
      ...formData,
      type: props.type,
      amount: Number(formData.amount)
    });
    // Limpiar y cerrar
    formData.amount = '';
    formData.category = '';
    formData.description = '';
    emit('close');
  } catch (error) {
    console.error("Error al guardar:", error);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
    <div @click="emit('close')" class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>
    
    <div 
      ref="modalRef"
      class="relative w-full max-w-md bg-[#161d29] rounded-t-[40px] sm:rounded-[40px] shadow-2xl p-8 border-t border-white/10 sm:border-x sm:border-b overflow-hidden animate-slide-up"
    >
      <!-- Cabecera -->
      <header class="flex justify-between items-center mb-8">
        <div class="flex items-center gap-4">
          <div :class="['w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg', props.type === 'income' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/20']">
            <X v-if="props.type === 'expense'" class="w-6 h-6" />
            <Save v-else class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-xl font-bold">Añadir {{ props.type === 'income' ? 'Ingreso' : 'Gasto' }}</h2>
            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Completa los datos</p>
          </div>
        </div>
        <button @click="emit('close')" class="p-2 hover:bg-white/5 rounded-xl transition-all">
          <X class="w-6 h-6 text-slate-500" />
        </button>
      </header>

      <form @submit.prevent="handleSave" class="space-y-6">
        <!-- Amount Display -->
        <div class="flex items-center justify-center p-6 mb-8 bg-white/5 rounded-[24px] border border-white/10 focus-within:border-blue-500/50 transition-all">
          <span class="text-2xl font-bold text-slate-500 mr-2">$</span>
          <input 
            v-model="formData.amount"
            type="number" 
            placeholder="0"
            class="bg-transparent text-4xl font-extrabold outline-none w-full text-center placeholder:text-slate-800"
            required
            step="any"
          />
        </div>

        <!-- Categoría -->
        <div class="mb-6">
          <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Categoría</label>
          <div class="relative group">
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
        </div>

        <!-- Fecha -->
        <div class="mb-6">
          <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Fecha</label>
          <div class="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-slate-400">
            {{ new Date().toLocaleDateString() }}
          </div>
        </div>

        <!-- Descripción -->
        <div class="mb-8">
          <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Descripción (Opcional)</label>
          <textarea 
            v-model="formData.description"
            rows="3"
            class="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500/50 transition-all text-sm resize-none"
            placeholder="¿En qué consiste este movimiento?"
          ></textarea>
        </div>

        <button 
          type="submit"
          :disabled="loading"
          :class="['w-full py-5 rounded-2xl font-bold text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3', props.type === 'income' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/20']"
        >
          <div v-if="loading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <template v-else>
            <Save class="w-5 h-5" />
            Guardar Movimiento
          </template>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
@keyframes slide-up {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.animate-slide-up {
  animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
