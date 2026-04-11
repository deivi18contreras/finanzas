<script setup>
import { useRoute } from 'vue-router';
import { Home, History, Plus, PieChart, Settings, Bell, Shield, Info, X, Check } from 'lucide-vue-next';
import { reactive, ref, provide } from 'vue';
import TransactionModal from './components/TransactionModal.vue';

const route = useRoute();
const modal = reactive({
  show: false,
  type: 'expense'
});

// Sistema de Notificación Global Premium
const infoModal = reactive({
  show: false,
  title: '',
  message: '',
  icon: Info,
  color: 'blue'
});

const showInfo = (title, message, iconType = 'info') => {
  infoModal.title = title;
  infoModal.message = message;
  infoModal.icon = iconType === 'shield' ? Shield : iconType === 'bell' ? Bell : Info;
  infoModal.color = iconType === 'shield' ? 'emerald' : iconType === 'bell' ? 'blue' : 'slate';
  infoModal.show = true;
};

// Proveemos la función para que cualquier pantalla pueda llamarla
provide('showInfo', showInfo);

const openModal = (type) => {
  modal.type = type;
  modal.show = true;
};
</script>

<template>
  <div :class="['min-h-screen bg-[#0b111b] text-white font-[\'Plus_Jakarta_Sans\']', !route.meta.hideNav ? 'pb-32' : '']">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <!-- Bottom Navigation -->
    <nav v-if="!route.meta.hideNav" class="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-[#161d29]/80 backdrop-blur-2xl border border-white/10 h-20 rounded-[32px] flex justify-between items-center px-4 z-50 shadow-2xl">
      <router-link to="/" class="flex flex-col items-center gap-1 flex-1 text-slate-500 transition-all duration-300" active-class="text-blue-500 scale-110">
        <Home class="w-6 h-6" />
        <span class="text-[10px] font-bold">Inicio</span>
      </router-link>

      <router-link to="/history" class="flex flex-col items-center gap-1 flex-1 text-slate-500 transition-all duration-300" active-class="text-blue-500 scale-110">
        <History class="w-6 h-6" />
        <span class="text-[10px] font-bold">Historial</span>
      </router-link>

      <div class="flex-1 flex justify-center -mt-16">
        <button 
          @click="openModal('expense')"
          class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/40 border-4 border-[#0b111b] active:scale-90 transition-transform"
        >
          <Plus class="w-8 h-8 text-white" />
        </button>
      </div>

      <router-link to="/reports" class="flex flex-col items-center gap-1 flex-1 text-slate-500 transition-all duration-300" active-class="text-blue-500 scale-110">
        <PieChart class="w-6 h-6" />
        <span class="text-[10px] font-bold">Reportes</span>
      </router-link>

      <router-link to="/settings" class="flex flex-col items-center gap-1 flex-1 text-slate-500 transition-all duration-300" active-class="text-blue-500 scale-110">
        <Settings class="w-6 h-6" />
        <span class="text-[10px] font-bold">Ajustes</span>
      </router-link>
    </nav>

    <!-- MODAL DE INFORMACIÓN PREMIUM (REEMPLAZA AL ALERT) -->
    <transition name="modal-fade">
      <div v-if="infoModal.show" class="fixed inset-0 z-[300] flex items-center justify-center p-6">
        <div @click="infoModal.show = false" class="absolute inset-0 bg-black/80 backdrop-blur-md"></div>
        <div class="relative bg-[#161d29] border border-white/10 w-full max-w-sm rounded-[40px] p-8 shadow-2xl text-center animate-scale-in">
          <div :class="['w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto mb-6', infoModal.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500']">
            <component :is="infoModal.icon" class="w-10 h-10" />
          </div>
          <h3 class="text-xl font-bold mb-2">{{ infoModal.title }}</h3>
          <p class="text-slate-400 text-sm mb-8">{{ infoModal.message }}</p>
          
          <button 
            @click="infoModal.show = false"
            class="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold text-sm transition-all active:scale-95"
          >
            Entendido
          </button>
        </div>
      </div>
    </transition>

    <TransactionModal 
      v-if="modal.show" 
      :show="modal.show" 
      :type="modal.type" 
      @close="modal.show = false" 
    />
  </div>
</template>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

@keyframes scale-in {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.animate-scale-in { animation: scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
</style>
