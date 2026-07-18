<template>
  <div class="register-wrapper row justify-center items-center">
    <div class="absolute-full bg-decoration">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
    </div>
    
    <q-card class="q-pa-lg glass-panel register-card animate-fade-in" style="width: 100%; max-width: 460px;">
      
      <!-- Encabezado / Logo -->
      <q-card-section class="text-center q-pb-none">
        <q-avatar size="80px" font-size="52px" class="bg-gradient-primary text-white shadow-3 glow-effect" icon="person_add" />
        <div class="text-h4 font-heading q-mt-md text-slate-800 text-weight-bold">Crear Cuenta</div>
        <div class="text-subtitle2 text-grey-6 q-mt-xs">Regístrate para empezar a gestionar tus finanzas</div>
      </q-card-section>

      <!-- Formulario -->
      <q-card-section class="q-pt-md">
        <q-form @submit.prevent="handleRegister" class="q-gutter-y-xs">
          
          <q-input 
            outlined 
            v-model="nombre" 
            label="Nombre Completo" 
            type="text" 
            lazy-rules
            color="primary"
            :rules="[val => val && val.length > 0 || 'El nombre es obligatorio']"
          >
            <template v-slot:prepend>
              <q-icon name="person" color="primary" />
            </template>
          </q-input>

          <!-- Correo Electrónico -->
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

          <!-- Contraseña -->
          <q-input 
            outlined 
            v-model="password" 
            label="Contraseña" 
            type="password" 
            lazy-rules 
            color="primary"
            :rules="[
              val => val && val.length >= 6 || 'La contraseña debe tener al menos 6 caracteres'
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="lock" color="primary" />
            </template>
          </q-input>

          <!-- Confirmar Contraseña -->
          <q-input 
            outlined 
            v-model="confirmPassword" 
            label="Confirmar Contraseña" 
            type="password" 
            lazy-rules
            color="primary"
            :rules="[
              val => val === password || 'Las contraseñas no coinciden'
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="lock_reset" color="primary" />
            </template>
          </q-input>

          <div class="q-mt-lg">
            <q-btn 
              label="Registrarse" 
              type="submit" 
              class="full-width bg-gradient-primary text-white text-weight-bold" 
              size="lg" 
              :loading="authStore.cargando" 
              no-caps 
            />
          </div>
        </q-form>
      </q-card-section>



      <!-- Enlace a Login -->
      <q-card-section class="text-center q-pt-none">
        <div class="text-grey-6 text-caption text-weight-medium">
          ¿Ya tienes una cuenta?
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
import { useAuthStore } from '../store/auth.js';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();

const nombre = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');

const handleRegister = async () => {
    $q.loading.show({
        message: 'Creando tu cuenta, por favor espera...'
    });

    try {
        const respuesta = await authStore.registrarUsuario({
            nombre: nombre.value,
            email: email.value,
            password: password.value
        });
        if(respuesta?.success){
            $q.notify({
                type: 'positive',
                message: '¡Registro exitoso! Ya puedes iniciar sesión.',
                position: 'top'
            });
            router.push({ name: 'Login' });
        }
    } catch (error) {
        $q.notify({
            type: 'negative',
            message: error.response?.data?.msg || 'Error al registrar el usuario.',
            position: 'top'
        });
    } finally {
        $q.loading.hide();
    }
};


</script>

<style scoped>
.register-wrapper {
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

.register-card {
  z-index: 1;
  background: rgba(255, 255, 255, 0.85) !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  border-radius: 24px !important;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3) !important;
}

.register-card:hover {
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