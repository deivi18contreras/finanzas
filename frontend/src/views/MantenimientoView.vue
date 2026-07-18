<template>
  <div class="maintenance-wrapper row justify-center items-center">
    <div class="absolute-full bg-decoration">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
    </div>

    <div class="text-center maintenance-content animate-fade-in" style="z-index: 1;">
      <div class="maintenance-icon q-mb-lg">🔧</div>
      <div class="text-h3 text-white text-weight-bold q-mb-sm">En Mantenimiento</div>
      <div class="text-subtitle1 text-grey-4 q-mb-xl">
        Estamos realizando mejoras en el sistema.<br>
        Volveremos muy pronto. ¡Gracias por tu paciencia!
      </div>
      <q-btn
        label="Intentar de nuevo"
        icon="refresh"
        color="white"
        text-color="primary"
        unelevated
        rounded
        size="lg"
        no-caps
        @click="reintentar"
      />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const reintentar = () => {
  router.push({ name: 'Login' });
};
</script>

<style scoped>
.maintenance-wrapper {
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
  opacity: 0.35;
}

.shape-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #6366f1 0%, #4f46e5 100%);
  top: -150px;
  left: -150px;
}

.shape-2 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, #f59e0b 0%, #d97706 100%);
  bottom: -200px;
  right: -150px;
}

.maintenance-icon {
  font-size: 80px;
  animation: spin 4s linear infinite;
}

.maintenance-content {
  padding: 20px;
}

.animate-fade-in {
  animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
  0%, 100% { transform: rotate(-10deg); }
  50% { transform: rotate(10deg); }
}
</style>
