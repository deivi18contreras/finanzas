<template>
  <div class="login-wrapper row justify-center items-center">
    <div class="absolute-full bg-decoration">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
    </div>
    
    <q-card class="q-pa-lg glass-panel login-card animate-fade-in" style="width: 100%; max-width: 420px;">
      
      <!-- Encabezado / Logo -->
      <q-card-section class="text-center q-pb-none">
        <q-avatar size="80px" font-size="52px" class="bg-gradient-primary text-white shadow-3 glow-effect" icon="wallet" />
        <div class="text-h4 font-heading q-mt-md text-slate-800 text-weight-bold">Bienvenido</div>
        <div class="text-subtitle2 text-grey-6 q-mt-xs">Ingresa a tu portal de finanzas personales</div>
      </q-card-section>

      <!-- Formulario Tradicional -->
      <q-card-section class="q-pt-md">
        <q-form @submit.prevent="handleLogin" class="q-gutter-y-sm">
          <q-input 
            outlined 
            v-model="email" 
            label="Correo Electrónico" 
            type="email" 
            lazy-rules
            color="primary"
            :rules="[val => val && val.length > 0 || 'El correo es obligatorio']"
          >
            <template v-slot:prepend>
              <q-icon name="mail" color="primary" />
            </template>
          </q-input>

          <q-input 
            outlined 
            v-model="password" 
            label="Contraseña" 
            type="password" 
            lazy-rules
            color="primary"
            :rules="[val => val && val.length > 0 || 'La contraseña es obligatoria']"
          >
            <template v-slot:prepend>
              <q-icon name="lock" color="primary" />
            </template>
          </q-input>

          <div class="q-mt-lg">
            <q-btn 
              label="Ingresar al Sistema" 
              type="submit" 
              class="full-width bg-gradient-primary text-white text-weight-bold" 
              size="lg" 
              :loading="authStore.cargando" 
              no-caps 
            />
          </div>
        </q-form>
      </q-card-section>

      <!-- Separador O -->
      <q-card-section class="row items-center q-py-xs text-grey-5">
        <div class="col bg-grey-3" style="height: 1px;"></div>
        <div class="col-auto q-px-sm text-caption text-weight-bold">O TAMBIÉN CON</div>
        <div class="col bg-grey-3" style="height: 1px;"></div>
      </q-card-section>

      <!-- Botones de Redes Sociales -->
      <q-card-section class="row q-col-gutter-sm q-pt-sm q-pb-md">
        <div class="col-12 col-sm-6">
          <q-btn 
            outline 
            color="red-5" 
            class="full-width text-weight-bold" 
            icon="login" 
            label="Google"
            @click="loginConGoogle" 
            no-caps 
          />
        </div>
        <div class="col-12 col-sm-6">
          <q-btn 
            outline 
            color="indigo-5" 
            class="full-width text-weight-bold" 
            icon="facebook"
            label="Facebook" 
            @click="loginConFacebook" 
            no-caps 
          />
        </div>
      </q-card-section>

      <!-- Enlace a Registro -->
      <q-card-section class="text-center q-pt-none">
        <div class="text-grey-6 text-caption text-weight-medium">
          ¿No tienes una cuenta?
          <router-link to="/register" class="text-primary text-weight-bold link-hover" style="text-decoration: none;">
            Regístrate aquí
          </router-link>
        </div>
      </q-card-section>

    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../store/auth.js';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');

const handleLogin = async () => {
    $q.loading.show({
        message: 'Validando credenciales...'
    });
    try {
        const respuesta = await authStore.iniciarSesion(email.value, password.value);
        if (respuesta?.success) {
            $q.notify({
                type: 'positive',
                message: `Bienvenido de nuevo, ${authStore.usuario?.nombre || 'Usuario'}`,
                position: 'top'
            });
            router.push({ name: 'Dashboard' });
        }
    } catch (error) {
        $q.notify({
            type: 'negative',
            message: error.response?.data?.msg || 'Error al iniciar sesión. Verifica tus credenciales.',
            position: 'top'
        });
    } finally {
        $q.loading.hide();
    }
};

const loginConGoogle = () => {
    $q.loading.show({ message: 'Conectando con Google...' });
    $q.notify({
        type: 'info',
        message: 'Redirigiendo a Google...',
        position: 'top'
    });
    setTimeout(() => {
        $q.loading.hide();
    }, 1200);
};

const loginConFacebook = () => {
    $q.loading.show({ message: 'Conectando con Facebook...' });
    $q.notify({
        type: 'info',
        message: 'Redirigiendo a Facebook...',
        position: 'top'
    });
    setTimeout(() => {
        $q.loading.hide();
    }, 1200);
};
</script>

<style scoped>
.login-wrapper {
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

.login-card {
  z-index: 1;
  background: rgba(255, 255, 255, 0.85) !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  border-radius: 24px !important;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3) !important;
}

.login-card:hover {
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