<template>
  <q-page class="q-pa-lg bg-grey-1">
    
    <div class="row justify-between items-center q-mb-xl">
      <div>
        <h4 class="text-h4 text-weight-bold q-my-none text-primary font-heading">Mi Dinero</h4>
        <p class="text-subtitle2 text-grey-6 q-my-none">Monitoreo en tiempo real de tus deudas, ingresos y presupuestos.</p>
      </div>
    </div>

    <!-- Tarjetas de Resumen Financiero -->
    <div class="row q-col-gutter-lg q-mb-xl">
      <div class="col-12 col-sm-4">
        <BalanceCard
          titulo="Saldo Disponible"
          :monto="saldoDisponible"
          icono="account_balance_wallet"
          color-class="bg-gradient-primary"
        />
      </div>

      <div class="col-12 col-sm-4">
        <BalanceCard
          titulo="Ingresos Mensuales"
          :monto="ingresosMensuales"
          icono="trending_up"
          color-class="bg-gradient-secondary"
        />
      </div>

      <div class="col-12 col-sm-4">
        <BalanceCard
          titulo="Deudas por Pagar"
          :monto="deudasPorPagar"
          icono="gavel"
          color-class="bg-gradient-accent"
        />
      </div>
    </div>

    <!-- Secciones Inferiores -->
    <div class="row q-col-gutter-lg">
      
      <!-- Recordatorios Críticos -->
      <div class="col-12 col-md-5 col-lg-4">
        <q-card class="shadow-hover" style="border-radius: 16px;">
          <q-card-section class="bg-gradient-dark text-white q-py-md">
            <div class="text-subtitle1 text-weight-bold font-heading row items-center">
              <q-icon name="notification_important" class="q-mr-xs text-accent glow-effect" /> Recordatorios Críticos
            </div>
          </q-card-section>

          <q-card-section class="q-pa-none">
            <q-list separator class="q-py-xs">
              <q-item v-for="r in recordatorios" :key="r._id" class="q-py-md item-reminder">
                <q-item-section avatar>
                  <q-avatar color="red-1" text-color="red-9">
                    <q-icon name="warning" size="24px" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-slate-800">{{ r.contacto }}</q-item-label>
                  <q-item-label caption class="text-negative text-weight-medium row items-center">
                    <q-icon name="event" size="14px" class="q-mr-xs" />
                    Vence: {{ r.fechaLimite ? new Date(r.fechaLimite).toLocaleDateString() : 'Sin fecha' }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="text-subtitle2 text-weight-bolder text-slate-800 font-heading">{{ formatMonto(r.montoTotal - r.montoPagado) }}</div>
                </q-item-section>
              </q-item>
              
              <div v-if="recordatorios.length === 0" class="q-pa-xl text-center text-grey-5">
                <q-icon name="check_circle" size="48px" color="positive" class="q-mb-sm opacity-60" />
                <div class="text-weight-medium">¡Al día! No tienes deudas pendientes.</div>
              </div>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Últimas Transacciones -->
      <div class="col-12 col-md-7 col-lg-8">
        <q-card class="shadow-hover" style="border-radius: 16px;">
          <q-card-section class="row justify-between items-center q-py-md bg-grey-2">
            <div class="text-subtitle1 text-weight-bold text-slate-800 font-heading row items-center">
              <q-icon name="swap_horiz" class="q-mr-xs" color="primary" /> Últimas Transacciones
            </div>
            <q-btn label="Ver Todas" color="primary" flat dense no-caps class="text-weight-bold text-subtitle2" to="/transacciones" />
          </q-card-section>

          <q-card-section class="q-pa-none">
            <q-table
              flat
              :rows="rows"
              :columns="columns"
              row-key="_id"
              hide-bottom
              :pagination="{ rowsPerPage: 5 }"
            >
              <template v-slot:body-cell-monto="props">
                <q-td :props="props" :class="props.row.tipo === 'ingreso' ? 'text-positive text-weight-bold' : 'text-negative text-weight-bold'">
                  {{ props.row.tipo === 'ingreso' ? '+' : '-' }} ${{ props.value.toLocaleString() }}
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>

    </div>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth.js';
import { useQuasar } from 'quasar';
import { transaccionService } from '../services/transaccionService.js';
import { deudaService } from '../services/deudaService.js';
import BalanceCard from '../components/BalanceCard.vue';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();

const saldoDisponible = ref(0);
const ingresosMensuales = ref(0);
const deudasPorPagar = ref(0);
const recordatorios = ref([]);
const rows = ref([]);

const columns = [
  { name: 'fecha', align: 'left', label: 'Fecha', field: 'fecha', format: val => val ? new Date(val).toLocaleDateString() : '', sortable: true },
  { name: 'descripcion', align: 'left', label: 'Descripción', field: 'descripcion' },
  { name: 'categoria', align: 'center', label: 'Categoría', field: 'categoria' },
  { name: 'monto', align: 'right', label: 'Monto', field: 'monto', sortable: true }
];

import { formatMonto } from '../utils/formatters.js';

const cargarDatos = async () => {
  try {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = hoy.getMonth() + 1;

    // 1. Obtener transacciones del mes
    const resTrans = await transaccionService.obtenerPorMes(anio, mes);
    if (resTrans?.success) {
      ingresosMensuales.value = resTrans.resumenMes.totalIngresos || 0;
      saldoDisponible.value = resTrans.resumenMes.balanceNeto || 0;
      rows.value = resTrans.transacciones.slice(0, 5) || [];
    }

    // 2. Obtener deudas
    const resDeudas = await deudaService.obtener();
    if (resDeudas?.success) {
      const deudasFiltradas = resDeudas.deudas || [];
      const pendientesPorPagar = deudasFiltradas.filter(
        d => d.tipo === 'por_pagar' && d.estado === 'pendiente'
      );
      
      // Sumar deudas pendientes
      deudasPorPagar.value = pendientesPorPagar.reduce(
        (sum, d) => sum + (d.montoTotal - d.montoPagado), 0
      );

      // Recordatorios críticos
      recordatorios.value = pendientesPorPagar.slice(0, 4);
    }
  } catch (error) {
    console.error('Error al cargar datos del dashboard:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al actualizar datos en tiempo real.',
      position: 'top'
    });
  }
};

const handleLogout = () => {
  $q.loading.show({ message: 'Cerrando sesión de forma segura...' });
  
  setTimeout(() => {
    authStore.cerrarSesion();
    $q.loading.hide();
    
    $q.notify({
      type: 'info',
      message: 'Sesión finalizada con éxito.',
      position: 'top'
    });
    
    router.push({ name: 'Login' });
  }, 1000);
};

onMounted(() => {
  cargarDatos();
});
</script>

<style scoped>
.card-premium {
  border-radius: 20px !important;
  border: none !important;
}

.tracking-wider {
  letter-spacing: 0.05em;
}

.bg-white-10 {
  background: rgba(255, 255, 255, 0.15);
}

.item-reminder {
  transition: background-color 0.25s ease;
}

.item-reminder:hover {
  background-color: #f8fafc;
}

.text-slate-800 {
  color: #1e293b;
}
</style>