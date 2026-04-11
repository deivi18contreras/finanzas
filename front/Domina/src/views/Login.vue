<script setup>
import { reactive, ref } from 'vue';
import { useAuthStore } from '../store/authStore';
import { Mail, Lock, Loader2, Award } from 'lucide-vue-next';

const authStore = useAuthStore();
const form = reactive({
  email: '',
  password: ''
});

const login = async () => {
  if (!form.email || !form.password) return;
  try {
    await authStore.login(form);
  } catch (err) {
    // Error manejado en el store
  }
};
</script>

<template>
  <div class="min-h-screen bg-[#0b111b] flex flex-col justify-center px-6 py-12 relative overflow-hidden">
    <!-- Decoración de fondo -->
    <div class="absolute top-[-10%] right-[-10%] w-64 h-64 bg-blue-600/20 rounded-full blur-[120px]"></div>
    <div class="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-slate-600/10 rounded-full blur-[120px]"></div>

    <div class="relative z-10 w-full max-w-md mx-auto">
      <!-- Logo / Título -->
      <div class="flex flex-col items-center mb-10 text-center">
        <div class="w-20 h-20 bg-blue-600 rounded-[28px] flex items-center justify-center shadow-2xl shadow-blue-600/30 mb-6 rotate-3">
          <Award class="w-10 h-10 text-white" />
        </div>
        <h1 class="text-4xl font-extrabold tracking-tight mb-2">Domina</h1>
        <p class="text-slate-400 font-medium">Gestiona tus finanzas con estilo</p>
      </div>

      <!-- Formulario (Glassmorphism) -->
      <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-2xl">
        <form @submit.prevent="login" class="space-y-6">
          
          <div v-if="authStore.error" class="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-3 px-4 rounded-xl text-center">
            {{ authStore.error }}
          </div>

          <!-- Email -->
          <div class="space-y-2">
            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail class="w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input 
                v-model="form.email"
                type="email" 
                class="w-full bg-[#0b111b]/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <!-- Password -->
          <div class="space-y-2">
            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Contraseña</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock class="w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input 
                v-model="form.password"
                type="password" 
                class="w-full bg-[#0b111b]/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <!-- Botón Login -->
          <button 
            type="submit"
            :disabled="authStore.loading"
            class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            <Loader2 v-if="authStore.loading" class="w-5 h-5 animate-spin" />
            <span v-else>Entrar ahora</span>
          </button>
        </form>

        <div class="mt-8 text-center">
          <p class="text-slate-400 text-sm font-medium">
            ¿No tienes cuenta? 
            <router-link to="/register" class="text-blue-500 hover:text-blue-400 font-bold ml-1 transition-colors">Regístrate</router-link>
          </p>
        </div>
      </div>

    </div>
  </div>
</template>
