<template>
  <q-layout view="lHh Lpr lFf">

    <!-- ─── HEADER ─── -->
    <q-header class="bg-gradient-dark text-white shadow-2">
      <q-toolbar class="q-px-md">
        <!-- Hamburger solo en desktop -->
        <q-btn v-if="$q.screen.gt.sm" flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer"
          class="q-mr-sm" />

        <q-toolbar-title class="text-weight-bold font-heading text-h6 row items-center">
          <q-icon name="query_stats" size="28px" class="q-mr-xs text-secondary" />
          <span>Finanzas</span>
        </q-toolbar-title>

        <div class="row items-center q-gutter-sm">
          <!-- Badge de usuario -->
          <div class="row items-center q-gutter-sm user-badge q-px-sm q-py-xs">
            <q-avatar color="primary" text-color="white" class="text-weight-bold text-caption font-heading shadow-1"
              size="32px">
              {{ authStore.inicialesUsuario }}
            </q-avatar>
            <span class="gt-xs text-weight-bold text-body2">
              {{ authStore.usuario?.nombre || 'Usuario' }}
            </span>
          </div>

          <!-- Logout siempre visible en header -->
          <q-btn flat round dense icon="logout" color="white" aria-label="Cerrar Sesión" @click="handleLogout">
            <q-tooltip anchor="bottom right" self="top right">Cerrar Sesión</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <!-- ─── DRAWER LATERAL (solo desktop) ─── -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-sidebar" :width="260" :breakpoint="768">
      <q-list class="q-py-md">
        <div class="q-px-md q-mb-md">
          <q-item-label header
            class="text-grey-5 text-weight-bolder text-uppercase tracking-wider text-caption q-pa-none">
            Navegación Principal
          </q-item-label>
        </div>

        <q-item clickable v-ripple to="/" exact active-class="menu-item-active" class="menu-item q-mx-sm q-mb-xs">
          <q-item-section avatar><q-icon name="dashboard" /></q-item-section>
          <q-item-section><q-item-label>Mi Dinero</q-item-label></q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/transacciones" active-class="menu-item-active"
          class="menu-item q-mx-sm q-mb-xs">
          <q-item-section avatar><q-icon name="receipt_long" /></q-item-section>
          <q-item-section><q-item-label>Movimientos</q-item-label></q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/deudas" active-class="menu-item-active" class="menu-item q-mx-sm q-mb-xs">
          <q-item-section avatar><q-icon name="payment" /></q-item-section>
          <q-item-section><q-item-label>Deudas</q-item-label></q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/categorias" active-class="menu-item-active" class="menu-item q-mx-sm q-mb-xs">
          <q-item-section avatar><q-icon name="category" /></q-item-section>
          <q-item-section><q-item-label>Categorías</q-item-label></q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/presupuestos" active-class="menu-item-active" class="menu-item q-mx-sm q-mb-xs">
          <q-item-section avatar><q-icon name="track_changes" /></q-item-section>
          <q-item-section><q-item-label>Control</q-item-label></q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/gastos-fijos" active-class="menu-item-active" class="menu-item q-mx-sm q-mb-xs">
          <q-item-section avatar><q-icon name="repeat" /></q-item-section>
          <q-item-section><q-item-label>Gastos Fijos</q-item-label></q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- ─── CONTENIDO ─── -->
    <q-page-container class="bg-app-container" :class="{ 'mobile-content': $q.screen.lt.md }">
      <router-view />
    </q-page-container>

    <!-- ─── BOTTOM TAB BAR (solo móvil) ─── -->
    <q-footer v-if="$q.screen.lt.md" class="bottom-tab-bar">
      <div class="tab-bar-inner">

        <router-link to="/" custom v-slot="{ isActive, navigate }">
          <div class="tab-item" :class="{ 'tab-active': isActive }" @click="navigate">
            <q-icon name="dashboard" size="22px" />
            <span class="tab-label">Mi Dinero</span>
          </div>
        </router-link>

        <router-link to="/transacciones" custom v-slot="{ isActive, navigate }">
          <div class="tab-item" :class="{ 'tab-active': isActive }" @click="navigate">
            <q-icon name="receipt_long" size="22px" />
            <span class="tab-label">Movimientos</span>
          </div>
        </router-link>

        <router-link to="/deudas" custom v-slot="{ isActive, navigate }">
          <div class="tab-item" :class="{ 'tab-active': isActive }" @click="navigate">
            <q-icon name="payment" size="22px" />
            <span class="tab-label">Deudas</span>
          </div>
        </router-link>

        <router-link to="/categorias" custom v-slot="{ isActive, navigate }">
          <div class="tab-item" :class="{ 'tab-active': isActive }" @click="navigate">
            <q-icon name="category" size="22px" />
            <span class="tab-label">Categorías</span>
          </div>
        </router-link>

        <router-link to="/presupuestos" custom v-slot="{ isActive, navigate }">
          <div class="tab-item" :class="{ 'tab-active': isActive }" @click="navigate">
            <q-icon name="track_changes" size="22px" />
            <span class="tab-label">Control</span>
          </div>
        </router-link>

        <router-link to="/gastos-fijos" custom v-slot="{ isActive, navigate }">
          <div class="tab-item" :class="{ 'tab-active': isActive }" @click="navigate">
            <q-icon name="repeat" size="22px" />
            <span class="tab-label">Fijos</span>
          </div>
        </router-link>

      </div>
    </q-footer>

  </q-layout>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../store/auth.js';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();
const leftDrawerOpen = ref(false);

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const handleLogout = () => {
  $q.dialog({
    title: 'Cerrar Sesión',
    message: '¿Estás seguro de que deseas salir del sistema?',
    cancel: { color: 'grey-7', flat: true },
    ok: { color: 'negative', label: 'Cerrar Sesión' },
    persistent: true
  }).onOk(() => {
    authStore.cerrarSesion();
    router.push({ name: 'Login' });
    $q.notify({ type: 'info', message: 'Sesión finalizada correctamente.', position: 'top' });
  });
};
</script>

<style scoped>
.bg-sidebar {
  background-color: #ffffff;
}

.bg-app-container {
  background-color: #f8fafc;
}

/* Padding extra en móvil para no quedar detrás del tab bar */
.mobile-content {
  padding-bottom: 68px;
}

.user-badge {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
}

.user-badge:hover {
  background: rgba(255, 255, 255, 0.25);
}

.tracking-wider {
  letter-spacing: 0.075em;
}

/* ─── Sidebar items ─── */
.menu-item {
  border-radius: 12px;
  color: #64748b;
  font-weight: 500;
  transition: all 0.2s ease;
}

.menu-item .q-icon {
  color: #64748b;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background-color: #f1f5f9;
  color: #334155;
}

.menu-item-active {
  background-color: #e0e7ff !important;
  color: #4f46e5 !important;
  font-weight: 700;
}

.menu-item-active .q-icon {
  color: #4f46e5 !important;
}

/* ─── Bottom Tab Bar ─── */
.bottom-tab-bar {
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  padding: 0;
  height: auto;
}

.tab-bar-inner {
  display: flex;
  align-items: stretch;
  height: 64px;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  /* iPhone notch */
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  cursor: pointer;
  color: #94a3b8;
  transition: all 0.2s ease;
  border-radius: 0;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  padding: 6px 2px;
}

.tab-item:active {
  transform: scale(0.92);
}

.tab-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.01em;
  line-height: 1;
}

.tab-active {
  color: #4f46e5;
}

.tab-active .tab-label {
  color: #4f46e5;
}

/* Indicador activo: línea arriba del ícono */
.tab-active::before {
  content: '';
  position: absolute;
  top: 0;
  width: 32px;
  height: 3px;
  background: linear-gradient(90deg, #6366f1, #4f46e5);
  border-radius: 0 0 4px 4px;
}

.tab-item {
  position: relative;
}
</style>