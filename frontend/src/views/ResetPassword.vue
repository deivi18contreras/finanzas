<template>
  <div class="reset-wrapper row justify-center items-center">
    <div class="absolute-full bg-decoration">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
    </div>
    
    <q-card class="q-pa-lg glass-panel reset-card animate-fade-in" style="width: 100%; max-width: 420px;">
      
      <!-- Encabezado / Logo -->
      <q-card-section class="text-center q-pb-none">
        <q-avatar size="80px" font-size="52px" class="bg-gradient-primary text-white shadow-3 glow-effect" icon="lock_open" />
        <div class="text-h4 font-heading q-mt-md text-slate-800 text-weight-bold">Nueva Contraseña</div>
        <div class="text-subtitle2 text-grey-6 q-mt-xs">Ingresa tu nueva contraseña para actualizar tu acceso</div>
      </q-card-section>

      <!-- Formulario -->
      <q-card-section class="q-pt-md">
        <q-form @submit.prevent="handleResetPassword" class="q-gutter-y-sm">
          
          <q-input 
            outlined 
            v-model="password" 
            label="Nueva Contraseña" 
            :type="isPwd ? 'password' : 'text'" 
            lazy-rules
            color="primary"
            :rules="[
              val => val && val.length >= 6 || 'La contraseña debe tener al menos 6 caracteres'
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="lock" color="primary" />
            </template>
            <template v-slot:append>
              <q-icon 
                :name="isPwd ? 'visibility_off' : 'visibility'" 
                class="cursor-pointer" 
                @click="isPwd = !isPwd" 
                color="primary"
              />
            </template>
          </q-input>

          <q-input 
            outlined 
            v-model="confirmPassword" 
            label="Confirmar Contraseña" 
            :type="isConfirmPwd ? 'password' : 'text'" 
            lazy-rules
            color="primary"
            :rules="[
              val => val === password || 'Las contraseñas no coinciden'
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="lock" color="primary" />
            </template>
            <template v-slot:append>
              <q-icon 
                :name="isConfirmPwd ? 'visibility_off' : 'visibility'" 
                class="cursor-pointer" 
                @click="isConfirmPwd = !isConfirmPwd" 
                color="primary"
              />
            </template>
          </q-input>

          <div class="q-mt-lg">
            <q-btn 
              label="Restablecer Contraseña" 
              type="submit" 
              class="full-width bg-gradient-primary text-white text-weight-bold" 
              size="lg" 
              :loading="cargando" 
              no-caps 
            />
          </div>
        </q-form>
      </q-card-section>

    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { authService } from '../services/authService.js';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();

const password = ref('');
const confirmPassword = ref('');
const isPwd = ref(true);
const isConfirmPwd = ref(true);
const cargando = ref(false);

const handleResetPassword = async () => {
    cargando.value = true;
    try {
        const token = route.params.token;
        const respuesta = await authService.restablecerPassword(token, password.value);
        if (respuesta?.success) {
            $q.notify({
                type: 'positive',
                message: respuesta.msg || 'Contraseña restablecida con éxito.',
                position: 'top'
            });
            setTimeout(() => {
                router.push({ name: 'Login' });
            }, 2000);
        }
    } catch (error) {
        $q.notify({
            type: 'negative',
            message: error.response?.data?.msg || 'Error al restablecer la contraseña. El enlace puede haber expirado.',
            position: 'top'
        });
    } finally {
        cargando.value = false;
    }
};
</script>

<style scoped>
.reset-wrapper {
  min-height: 100vh;
  width: 100vw;
  background-color: #0f172a;
  position: relative;
  overflow: hidden;
}

.bg-decoration {
  position: absolute;
  z-index: 0;
}

.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.45;
}

.shape-1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #6366f1 0%, #4f46e5 100%);
  top: -100px;
  left: -100px;
}

.shape-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #10b981 0%, #059669 100%);
  bottom: -150px;
  right: -100px;
}

.reset-card {
  z-index: 1;
  background: rgba(255, 255, 255, 0.85) !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  border-radius: 24px !important;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3) !important;
}

.reset-card:hover {
  transform: none !important;
}

.animate-fade-in {
  animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
