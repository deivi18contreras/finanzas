<template>
  <div class="forgot-wrapper row justify-center items-center">
    <div class="absolute-full bg-decoration">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
    </div>
    
    <q-card class="q-pa-lg glass-panel forgot-card animate-fade-in" style="width: 100%; max-width: 420px;">
      
      <!-- Encabezado / Logo -->
      <q-card-section class="text-center q-pb-none">
        <q-avatar size="80px" font-size="52px" class="bg-gradient-primary text-white shadow-3 glow-effect" icon="lock_reset" />
        <div class="text-h4 font-heading q-mt-md text-slate-800 text-weight-bold">Recuperar Acceso</div>
        <div class="text-subtitle2 text-grey-6 q-mt-xs">Ingresa tu correo para recibir un enlace de recuperación</div>
      </q-card-section>

      <!-- Formulario -->
      <q-card-section class="q-pt-md">
        <q-form @submit.prevent="handleResetRequest" class="q-gutter-y-sm">
          <q-input 
            outlined 
            v-model="email" 
            label="Correo Electrónico" 
            type="email" 
            lazy-rules
            color="primary"
            :rules="[
              val => val && val.length > 0 || 'El correo es obligatorio',
              val => /.+@.+\..+/.test(val) || 'Ingresa un correo válido'
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="mail" color="primary" />
            </template>
          </q-input>

          <div class="q-mt-lg">
            <q-btn 
              label="Enviar Enlace" 
              type="submit" 
              class="full-width bg-gradient-primary text-white text-weight-bold" 
              size="lg" 
              :loading="cargando" 
              no-caps 
            />
          </div>
        </q-form>
      </q-card-section>

      <!-- Enlace a Login -->
      <q-card-section class="text-center q-pt-none">
        <div class="text-grey-6 text-caption text-weight-medium">
          ¿Recordaste tu contraseña?
          <router-link to="/login" class="text-primary text-weight-bold link-hover" style="text-decoration: none;">
            Inicia sesión aquí
          </router-link>
        </div>
      </q-card-section>

    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../services/authService.js';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const router = useRouter();
const email = ref('');
const cargando = ref(false);

const handleResetRequest = async () => {
    cargando.value = true;
    try {
        const respuesta = await authService.solicitarRecuperacion(email.value);
        if (respuesta?.success) {
            $q.notify({
                type: 'positive',
                message: respuesta.msg || 'Enlace de recuperación enviado con éxito.',
                position: 'top',
                timeout: 4000
            });
            email.value = '';
            // Redirigir al login después de 3 segundos
            setTimeout(() => {
                router.push({ name: 'Login' });
            }, 3000);
        }
    } catch (error) {
        $q.notify({
            type: 'negative',
            message: error.response?.data?.msg || 'Error al procesar la solicitud.',
            position: 'top'
        });
    } finally {
        cargando.value = false;
    }
};
</script>

<style scoped>
.forgot-wrapper {
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

.forgot-card {
  z-index: 1;
  background: rgba(255, 255, 255, 0.85) !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  border-radius: 24px !important;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3) !important;
}

.forgot-card:hover {
  transform: none !important;
}

.link-hover {
  transition: color 0.2s ease;
}

.link-hover:hover {
  color: #4f46e5 !important;
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
