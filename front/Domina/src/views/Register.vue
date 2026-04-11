<script setup>
import { reactive } from 'vue';
import { useAuthStore } from '../store/authStore';
import { User, Mail, Lock, Loader2, Award } from 'lucide-vue-next';

const authStore = useAuthStore();
const form = reactive({
  name: '',
  email: '',
  password: ''
});

const register = async () => {
  if (!form.name || !form.email || !form.password) return;
  try {
    await authStore.register(form);
  } catch (err) { }
};
</script>

<template>
  <div class="min-h-screen bg-[#0b111b] flex flex-col justify-center px-6 py-12 relative overflow-hidden">
    <!-- Decoración -->
    <div class="absolute top-[-10%] left-[-10%] w-64 h-64 bg-slate-600/10 rounded-full blur-[120px]"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-blue-600/15 rounded-full blur-[120px]"></div>

    <div class="relative z-10 w-full max-w-md mx-auto">
      <div class="flex flex-col items-center mb-10 text-center">
        <div class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/30 mb-6 rotate-3">
          <Award class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-3xl font-extrabold tracking-tight mb-1">Crea tu cuenta</h1>
        <p class="text-slate-400 font-medium text-sm">Empieza a dominar tus gastos hoy</p>
      </div>

      <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-2xl">
        <form @submit.prevent="register" class="space-y-5">
          
          <div v-if="authStore.error" class="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold py-3 px-4 rounded-xl text-center uppercase tracking-widest">
            {{ authStore.error }}
          </div>

          <!-- Nombre -->
          <div class="space-y-2">
            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nombre Completo</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User class="w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input 
                v-model="form.name"
                type="text" 
                class="w-full bg-[#0b111b]/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500/50 transition-all text-sm"
                placeholder="Tu nombre"
                required
              />
            </div>
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
                class="w-full bg-[#0b111b]/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500/50 transition-all text-sm"
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
                class="w-full bg-[#0b111b]/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500/50 transition-all text-sm"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            :disabled="authStore.loading"
            class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 mt-4"
          >
            <Loader2 v-if="authStore.loading" class="w-5 h-5 animate-spin" />
            <span v-else>Unirse a Domina</span>
          </button>
        </form>

        <div class="mt-8 text-center border-t border-white/5 pt-6">
          <p class="text-slate-400 text-sm font-medium">
            ¿Ya tienes cuenta? 
            <router-link to="/login" class="text-blue-500 hover:text-blue-400 font-bold ml-1 transition-colors">Entrar</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
