<script setup>
import {
  User, ChevronRight, DollarSign, Bell, Moon,
  FileText, Shield, Info, LogOut, X, Lock, Pencil, Check
} from 'lucide-vue-next';
import { useAuthStore } from '../store/authStore';
import { useTransactionStore } from '../store/transactionStore';
import { AuthService } from '../services/AuthService';
import { ref, reactive, inject } from 'vue';

const authStore = useAuthStore();
const store     = useTransactionStore();
const showInfo  = inject('showInfo');

// ─── Estado de modales ───────────────────────
const showLogoutModal   = ref(false);
const showBudgetModal   = ref(false);
const showProfileModal  = ref(false);
const showPasswordModal = ref(false);

// ─── Configuración local ─────────────────────
const settings = reactive({
  budget:        AuthService.getBudget(),
  notifications: true,
  darkMode:      true
});

// ────────────────────────────────────────────
// MODAL — Presupuesto (Fase 3.1 — changeBudget definida)
// ────────────────────────────────────────────
const budgetInput = ref(settings.budget);

const changeBudget = () => {
  budgetInput.value = settings.budget;
  showBudgetModal.value = true;
};

const saveBudget = () => {
  const val = Number(budgetInput.value);
  if (val > 0) {
    settings.budget = val;
    AuthService.setBudget(val);
  }
  showBudgetModal.value = false;
};

// ────────────────────────────────────────────
// MODAL — Editar perfil (Fase 5.1)
// ────────────────────────────────────────────
const profileForm    = reactive({ name: '', email: '' });
const profileError   = ref('');
const profileSuccess = ref(false);

const openProfileModal = () => {
  profileForm.name  = authStore.user?.name  || '';
  profileForm.email = authStore.user?.email || '';
  profileError.value   = '';
  profileSuccess.value = false;
  showProfileModal.value = true;
};

const saveProfile = async () => {
  profileError.value   = '';
  profileSuccess.value = false;
  try {
    await authStore.updateProfile({ name: profileForm.name, email: profileForm.email });
    profileSuccess.value = true;
    setTimeout(() => { showProfileModal.value = false; profileSuccess.value = false; }, 1500);
  } catch (err) {
    profileError.value = err?.message || 'Error al actualizar perfil';
  }
};

// ────────────────────────────────────────────
// MODAL — Cambiar contraseña (Fase 5.2)
// ────────────────────────────────────────────
const passwordForm    = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' });
const passwordError   = ref('');
const passwordSuccess = ref(false);

const openPasswordModal = () => {
  passwordForm.oldPassword     = '';
  passwordForm.newPassword     = '';
  passwordForm.confirmPassword = '';
  passwordError.value   = '';
  passwordSuccess.value = false;
  showPasswordModal.value = true;
};

const savePassword = async () => {
  passwordError.value = '';
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordError.value = 'Las contraseñas nuevas no coinciden'; return;
  }
  if (passwordForm.newPassword.length < 6) {
    passwordError.value = 'La contraseña debe tener al menos 6 caracteres'; return;
  }
  try {
    await authStore.changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    });
    passwordSuccess.value = true;
    setTimeout(() => { showPasswordModal.value = false; passwordSuccess.value = false; }, 1500);
  } catch (err) {
    passwordError.value = err?.message || 'Error al cambiar contraseña';
  }
};

// ─── Logout ──────────────────────────────────
const toggleLogoutModal = () => { showLogoutModal.value = !showLogoutModal.value; };
const handleLogout      = () => { authStore.logout(); };

// ─── Utilidades ──────────────────────────────
const formatCurrency = (val) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

const exportData = () => {
  const data = JSON.stringify(store.transactions, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `Domina_Backup_${new Date().toLocaleDateString()}.json`;
  a.click();
  showInfo('Éxito', 'Tus datos han sido exportados en formato JSON.', 'bell');
};

const showSecurityMsg = () => {
  showInfo('Seguridad', 'Tus datos financieros están protegidos con cifrado JWT y almacenamiento seguro.', 'shield');
};
</script>

<template>
  <div class="px-6 pt-10 pb-32 bg-[#0b111b] min-h-screen relative">

    <!-- Perfil — clickeable para editar (Fase 5.1) -->
    <button
      @click="openProfileModal"
      class="w-full bg-white/5 border border-white/10 rounded-[32px] p-6 mb-8 flex items-center justify-between group active:scale-95 transition-all"
    >
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 text-2xl font-bold select-none">
          {{ authStore.user?.name?.charAt(0).toUpperCase() || 'U' }}
        </div>
        <div class="text-left">
          <h2 class="font-bold text-lg">{{ authStore.user?.name || 'Mi Cuenta' }}</h2>
          <p class="text-xs text-slate-400 font-medium">{{ authStore.user?.email || 'Usuario Premium' }}</p>
        </div>
      </div>
      <div class="flex items-center gap-1.5 text-slate-500 group-hover:text-slate-300 transition-colors">
        <Pencil class="w-4 h-4" />
        <span class="text-xs font-medium">Editar</span>
      </div>
    </button>

    <!-- Opciones Principales -->
    <div class="space-y-4">

      <!-- Preferencias -->
      <div class="bg-white/5 border border-white/10 rounded-[32px] p-2">
        <!-- Presupuesto — Fase 3.1 (ya no crashea) -->
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

        <!-- Cambiar contraseña — Fase 5.2 -->
        <button @click="openPasswordModal" class="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-all active:scale-[0.98]">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400"><Lock class="w-5 h-5" /></div>
            <span class="text-sm font-bold">Cambiar contraseña</span>
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

      <!-- Acerca de -->
      <div class="w-full bg-white/5 border border-white/10 rounded-[32px] flex items-center justify-between p-6">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500"><Info class="w-5 h-5" /></div>
          <div>
            <h3 class="text-sm font-bold">Acerca de Domina</h3>
            <p class="text-[10px] text-slate-500 font-medium">Versión 1.1.0</p>
          </div>
        </div>
        <ChevronRight class="w-4 h-4 text-slate-600" />
      </div>

      <!-- Cerrar Sesión -->
      <button
        @click="toggleLogoutModal"
        class="w-full bg-red-500/5 border border-red-500/10 rounded-[32px] p-6 flex justify-center items-center gap-3 text-red-500 hover:bg-red-500/10 active:scale-95 transition-all mb-10"
      >
        <LogOut class="w-5 h-5" />
        <span class="font-bold">Cerrar mi sesión</span>
      </button>
    </div>

    <!-- ════════════════════════════════ MODALS ════════════════════════════════ -->

    <!-- Modal Presupuesto -->
    <transition name="modal-fade">
      <div v-if="showBudgetModal" class="fixed inset-0 z-[200] flex items-center justify-center p-6">
        <div @click="showBudgetModal = false" class="absolute inset-0 bg-black/80 backdrop-blur-md"></div>
        <div class="relative bg-[#161d29] border border-white/10 w-full max-w-sm rounded-[40px] p-8 shadow-2xl animate-scale-in">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h3 class="text-xl font-bold">Presupuesto mensual</h3>
              <p class="text-xs text-slate-500 mt-1">Define tu límite de gastos</p>
            </div>
            <button @click="showBudgetModal = false" class="p-2 hover:bg-white/5 rounded-xl"><X class="w-5 h-5 text-slate-500" /></button>
          </div>
          <div class="flex items-center bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 focus-within:border-blue-500/50 transition-all">
            <span class="text-xl font-bold text-slate-500 mr-2">$</span>
            <input
              v-model="budgetInput"
              type="number"
              min="1"
              placeholder="1000000"
              class="bg-transparent text-2xl font-bold outline-none w-full"
            />
          </div>
          <div class="flex gap-3">
            <button @click="showBudgetModal = false" class="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold text-sm transition-all">Cancelar</button>
            <button @click="saveBudget" class="flex-1 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold text-sm text-white transition-all shadow-lg shadow-blue-600/20">Guardar</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal Editar Perfil -->
    <transition name="modal-fade">
      <div v-if="showProfileModal" class="fixed inset-0 z-[200] flex items-center justify-center p-6">
        <div @click="showProfileModal = false" class="absolute inset-0 bg-black/80 backdrop-blur-md"></div>
        <div class="relative bg-[#161d29] border border-white/10 w-full max-w-sm rounded-[40px] p-8 shadow-2xl animate-scale-in">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h3 class="text-xl font-bold">Editar perfil</h3>
              <p class="text-xs text-slate-500 mt-1">Actualiza tu información</p>
            </div>
            <button @click="showProfileModal = false" class="p-2 hover:bg-white/5 rounded-xl"><X class="w-5 h-5 text-slate-500" /></button>
          </div>

          <div v-if="profileSuccess" class="flex flex-col items-center py-8 text-emerald-400">
            <Check class="w-14 h-14 mb-3" />
            <p class="font-bold text-lg">¡Perfil actualizado!</p>
          </div>

          <form v-else @submit.prevent="saveProfile" class="space-y-4">
            <div v-if="profileError" class="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-3 px-4 rounded-xl text-center">{{ profileError }}</div>
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Nombre</label>
              <input v-model="profileForm.name" type="text" required placeholder="Tu nombre" class="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-blue-500 transition-all text-sm" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Email</label>
              <input v-model="profileForm.email" type="email" required placeholder="tu@email.com" class="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-blue-500 transition-all text-sm" />
            </div>
            <div class="flex gap-3 pt-2">
              <button type="button" @click="showProfileModal = false" class="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold text-sm transition-all">Cancelar</button>
              <button type="submit" :disabled="authStore.loading" class="flex-1 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold text-sm text-white transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50">
                {{ authStore.loading ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Modal Cambiar Contraseña -->
    <transition name="modal-fade">
      <div v-if="showPasswordModal" class="fixed inset-0 z-[200] flex items-center justify-center p-6">
        <div @click="showPasswordModal = false" class="absolute inset-0 bg-black/80 backdrop-blur-md"></div>
        <div class="relative bg-[#161d29] border border-white/10 w-full max-w-sm rounded-[40px] p-8 shadow-2xl animate-scale-in">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h3 class="text-xl font-bold">Cambiar contraseña</h3>
              <p class="text-xs text-slate-500 mt-1">Elige una contraseña segura</p>
            </div>
            <button @click="showPasswordModal = false" class="p-2 hover:bg-white/5 rounded-xl"><X class="w-5 h-5 text-slate-500" /></button>
          </div>

          <div v-if="passwordSuccess" class="flex flex-col items-center py-8 text-emerald-400">
            <Check class="w-14 h-14 mb-3" />
            <p class="font-bold text-lg">¡Contraseña actualizada!</p>
          </div>

          <form v-else @submit.prevent="savePassword" class="space-y-4">
            <div v-if="passwordError" class="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-3 px-4 rounded-xl text-center">{{ passwordError }}</div>
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Contraseña actual</label>
              <input v-model="passwordForm.oldPassword" type="password" required placeholder="••••••••" class="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-blue-500 transition-all text-sm" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Nueva contraseña</label>
              <input v-model="passwordForm.newPassword" type="password" required minlength="6" placeholder="Mínimo 6 caracteres" class="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-blue-500 transition-all text-sm" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Confirmar nueva contraseña</label>
              <input v-model="passwordForm.confirmPassword" type="password" required placeholder="Repite la contraseña" class="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-blue-500 transition-all text-sm" />
            </div>
            <div class="flex gap-3 pt-2">
              <button type="button" @click="showPasswordModal = false" class="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold text-sm transition-all">Cancelar</button>
              <button type="submit" :disabled="authStore.loading" class="flex-1 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold text-sm text-white transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50">
                {{ authStore.loading ? 'Guardando...' : 'Cambiar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Modal Logout -->
    <transition name="modal-fade">
      <div v-if="showLogoutModal" class="fixed inset-0 z-[200] flex items-center justify-center p-6">
        <div @click="toggleLogoutModal" class="absolute inset-0 bg-black/80 backdrop-blur-md"></div>
        <div class="relative bg-[#161d29] border border-white/10 w-full max-w-sm rounded-[40px] p-8 shadow-2xl text-center animate-scale-in">
          <div class="w-20 h-20 bg-red-500/10 rounded-[28px] flex items-center justify-center mx-auto mb-6">
            <LogOut class="w-10 h-10 text-red-500" />
          </div>
          <h3 class="text-xl font-bold mb-2">¿Cerrar sesión?</h3>
          <p class="text-slate-400 text-sm mb-8">Tendrás que volver a ingresar tus credenciales para acceder.</p>
          <div class="flex gap-4">
            <button @click="toggleLogoutModal" class="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold text-sm transition-all active:scale-95">Cancelar</button>
            <button @click="handleLogout" class="flex-1 py-4 bg-red-600 hover:bg-red-500 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-red-600/20 active:scale-95 text-white">Sí, salir</button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<style scoped>
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

@keyframes scale-in { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.animate-scale-in { animation: scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
</style>
