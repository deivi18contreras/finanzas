<script setup>
import { 
  User, 
  ChevronRight, 
  DollarSign, 
  Bell, 
  Moon, 
  FileText, 
  Shield, 
  Info, 
  LogOut,
  X,
  Check
} from 'lucide-vue-next';
import { useAuthStore } from '../store/authStore';
import { useTransactionStore } from '../store/transactionStore';
import { ref, reactive, inject } from 'vue';

const authStore = useAuthStore();
const store = useTransactionStore();
const showInfo = inject('showInfo');
const showLogoutModal = ref(false);

const settings = reactive({
  budget: 1000000,
  notifications: true,
  darkMode: true
});

const toggleLogoutModal = () => {
  showLogoutModal.value = !showLogoutModal.value;
};

const handleLogout = () => {
  authStore.logout();
};

const formatCurrency = (val) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
};

const exportData = () => {
  const data = JSON.stringify(store.transactions, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Domina_Backup_${new Date().toLocaleDateString()}.json`;
  a.click();
  showInfo('Éxito', 'Tus datos se han exportado correctamente en formato JSON.', 'bell');
};

const showSecurityMsg = () => {
  showInfo('Seguridad', 'Tus datos financieros están protegidos con cifrado JWT y almacenamiento local seguro de Domina.', 'shield');
};
</script>

<template>
  <div class="px-6 pt-10 pb-32 bg-[#0b111b] min-h-screen relative">
    
    <!-- Perfil -->
    <section class="bg-white/5 border border-white/10 rounded-[32px] p-6 mb-8 flex items-center justify-between group active:scale-95 transition-all">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 text-2xl font-bold">
          {{ authStore.user?.name?.charAt(0) || 'U' }}
        </div>
        <div>
          <h2 class="font-bold text-lg">{{ authStore.user?.name || 'Mi Cuenta' }}</h2>
          <p class="text-xs text-slate-400 font-medium">{{ authStore.user?.email || 'Usuario Premium' }}</p>
        </div>
      </div>
      <ChevronRight class="w-5 h-5 text-slate-500" />
    </section>

    <!-- Opciones Principales -->
    <div class="space-y-4">
      <div class="bg-white/5 border border-white/10 rounded-[32px] p-2">
        <!-- Presupuesto -->
        <button @click="changeBudget" class="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-all active:scale-[0.98]">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400"><DollarSign class="w-5 h-5" /></div>
            <span class="text-sm font-bold">Presupuesto mensual</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-blue-500 font-bold">{{ formatCurrency(settings.budget) }}</span>
            <ChevronRight class="w-4 h-4 text-slate-600" />
          </div>
        </button>

        <!-- Notificaciones -->
        <button @click="settings.notifications = !settings.notifications" class="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-all">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400"><Bell class="w-5 h-5" /></div>
            <span class="text-sm font-bold">Notificaciones</span>
          </div>
          <div :class="['w-10 h-6 rounded-full relative transition-colors duration-300', settings.notifications ? 'bg-blue-600' : 'bg-slate-700']">
            <div :class="['absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300', settings.notifications ? 'right-1' : 'right-5']"></div>
          </div>
        </button>

        <!-- Modo Oscuro -->
        <button @click="settings.darkMode = !settings.darkMode" class="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-all">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400"><Moon class="w-5 h-5" /></div>
            <span class="text-sm font-bold">Modo Oscuro</span>
          </div>
          <div :class="['w-10 h-6 rounded-full relative transition-colors duration-300', settings.darkMode ? 'bg-blue-600' : 'bg-slate-700']">
            <div :class="['absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300', settings.darkMode ? 'right-1' : 'right-5']"></div>
          </div>
        </button>
      </div>

      <!-- Seguridad y Datos -->
      <div class="bg-white/5 border border-white/10 rounded-[32px] p-2">
        <button @click="exportData" class="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-all active:scale-[0.98]">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400"><FileText class="w-5 h-5" /></div>
            <span class="text-sm font-bold">Exportar datos (JSON)</span>
          </div>
          <ChevronRight class="w-4 h-4 text-slate-600" />
        </button>

        <button @click="showSecurityMsg" class="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-all active:scale-[0.98]">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400"><Shield class="w-5 h-5" /></div>
            <span class="text-sm font-bold">Seguridad de la cuenta</span>
          </div>
          <ChevronRight class="w-4 h-4 text-slate-600" />
        </button>
      </div>

      <!-- Soporte -->
      <button class="w-full bg-white/5 border border-white/10 rounded-[32px] flex items-center justify-between p-6 group active:scale-95 transition-all">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500"><Info class="w-5 h-5" /></div>
          <div>
            <h3 class="text-sm font-bold">Acerca de Domina</h3>
            <p class="text-[10px] text-slate-500 font-medium">Versión 1.0.0 Pro</p>
          </div>
        </div>
        <ChevronRight class="w-4 h-4 text-slate-600" />
      </button>

      <!-- Botón Cerrar Sesión -->
      <button 
        @click="toggleLogoutModal"
        class="w-full bg-red-500/5 border border-red-500/10 rounded-[32px] p-6 flex justify-center items-center gap-3 text-red-500 hover:bg-red-500/10 active:scale-95 transition-all mb-10"
      >
        <LogOut class="w-5 h-5" />
        <span class="font-bold">Cerrar mi sesión</span>
      </button>
    </div>

    <!-- MODAL DE CIERRE DE SESIÓN CUSTOM (REEMPLAZA AL CONFIRM) -->
    <transition name="modal-fade">
      <div v-if="showLogoutModal" class="fixed inset-0 z-[200] flex items-center justify-center p-6">
        <div @click="toggleLogoutModal" class="absolute inset-0 bg-black/80 backdrop-blur-md"></div>
        <div class="relative bg-[#161d29] border border-white/10 w-full max-w-sm rounded-[40px] p-8 shadow-2xl text-center animate-scale-in">
          <div class="w-20 h-20 bg-red-500/10 rounded-[28px] flex items-center justify-center mx-auto mb-6">
            <LogOut class="w-10 h-10 text-red-500" />
          </div>
          <h3 class="text-xl font-bold mb-2">¿Cerrar sesión?</h3>
          <p class="text-slate-400 text-sm mb-8">Tendrás que volver a ingresar tus credenciales para acceder a tus datos.</p>
          
          <div class="flex gap-4">
            <button 
              @click="toggleLogoutModal"
              class="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold text-sm transition-all active:scale-95"
            >
              Cancelar
            </button>
            <button 
              @click="handleLogout"
              class="flex-1 py-4 bg-red-600 hover:bg-red-500 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-red-600/20 active:scale-95 text-white"
            >
              Sí, salir
            </button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<style scoped>
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}

@keyframes scale-in {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.animate-scale-in {
  animation: scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
