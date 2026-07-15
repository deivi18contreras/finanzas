<template>
  <q-page class="q-pa-lg bg-grey-1">

    <div class="row justify-between items-center q-mb-xl">
      <div>
        <h4 class="text-h4 text-weight-bold q-my-none text-slate-800 font-heading">Mi Dinero</h4>
        <p class="text-subtitle2 text-grey-6 q-my-none">Monitoreo en tiempo real de tus deudas, ingresos y presupuestos.</p>
      </div>
    </div>

    <!-- Tarjetas de Resumen Financiero en Estilo Pastel del Mockup -->
    <div class="row q-col-gutter-md q-mb-xl">
      <!-- Tarjeta 1: Capital Total (Celeste/Azul Pastel - 100% en móvil para destacar) -->
      <div class="col-12 col-md-4">
        <q-card class="shadow-1 card-resumen card-resumen-capital" style="border-radius: 16px;">
          <q-card-section class="row items-center q-pa-md q-pa-sm-lg">
            <div class="icon-box icon-box-capital q-mr-md">
              <q-icon name="o_stars" size="24px" color="blue-7" />
            </div>
            <div>
              <div class="text-subtitle2 text-grey-7 text-weight-bold">Capital Total</div>
              <div class="text-h5 text-sm-h4 text-weight-bolder text-slate-900 q-my-xs">${{ (saldoDisponible + totalAhorrado).toLocaleString() }}</div>
              <div class="text-caption text-grey-8 text-weight-medium">Saldo total + Ahorros</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Tarjeta 2: Saldo Disponible (Morado Pastel - 50% en móvil) -->
      <div class="col-6 col-md-4">
        <q-card class="shadow-1 card-resumen card-resumen-disponible" style="border-radius: 16px;">
          <q-card-section class="row items-center q-pa-md q-pa-sm-lg">
            <div class="icon-box icon-box-disponible q-mr-md">
              <q-icon name="o_account_balance_wallet" size="24px" color="indigo-5" />
            </div>
            <div>
              <div class="text-subtitle2 text-grey-7 text-weight-bold">Saldo Disponible</div>
              <div class="text-h5 text-sm-h4 text-weight-bolder text-slate-900 q-my-xs">${{ saldoDisponible.toLocaleString() }}</div>
              <div class="text-caption text-grey-8 text-weight-medium">Libre en cuenta</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Tarjeta 3: Total Ahorrado (Amarillo/Oro Pastel - 50% en móvil) -->
      <div class="col-6 col-md-4">
        <q-card class="shadow-1 card-resumen card-resumen-ahorrado" style="border-radius: 16px;">
          <q-card-section class="row items-center q-pa-md q-pa-sm-lg">
            <div class="icon-box icon-box-ahorrado q-mr-md">
              <q-icon name="o_savings" size="24px" color="amber-7" />
            </div>
            <div>
              <div class="text-subtitle2 text-grey-7 text-weight-bold">Total Ahorrado</div>
              <div class="text-h5 text-sm-h4 text-weight-bolder text-slate-900 q-my-xs">${{ totalAhorrado.toLocaleString() }}</div>
              <div class="text-caption text-grey-8 text-weight-medium">En tus bolsillos</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Tarjeta 4: Ingresos Mensuales (Verde Pastel - 50% en móvil) -->
      <div class="col-6 col-md-6">
        <q-card class="shadow-1 card-resumen card-resumen-ingresos" style="border-radius: 16px;">
          <q-card-section class="row items-center q-pa-md q-pa-sm-lg">
            <div class="icon-box icon-box-ingresos q-mr-md">
              <q-icon name="o_trending_up" size="24px" color="green-5" />
            </div>
            <div>
              <div class="text-subtitle2 text-grey-7 text-weight-bold">Ingresos</div>
              <div class="text-h5 text-sm-h4 text-weight-bolder text-slate-900 q-my-xs">${{ ingresosMensuales.toLocaleString() }}</div>
              <div class="text-caption text-grey-8 text-weight-medium">Entradas del mes</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Tarjeta 5: Deudas por Pagar (Rojo/Rosa Pastel - 50% en móvil) -->
      <div class="col-6 col-md-6">
        <q-card class="shadow-1 card-resumen card-resumen-deudas" style="border-radius: 16px;">
          <q-card-section class="row items-center q-pa-md q-pa-sm-lg">
            <div class="icon-box icon-box-deudas q-mr-md">
              <q-icon name="o_gavel" size="24px" color="red-5" />
            </div>
            <div>
              <div class="text-subtitle2 text-grey-7 text-weight-bold">Deudas</div>
              <div class="text-h5 text-sm-h4 text-weight-bolder text-slate-900 q-my-xs">${{ deudasPorPagar.toLocaleString() }}</div>
              <div class="text-caption text-grey-8 text-weight-medium">Por pagar pendiente</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Secciones Inferiores -->
    <div class="row q-col-gutter-lg">

      <!-- Recordatorios Críticos -->
      <div class="col-12 col-md-5 col-lg-4">
        <q-card class="shadow-1 border-reminder-card" style="border-radius: 16px; overflow:hidden">
          <div class="q-py-md q-px-lg text-white" style="background: linear-gradient(135deg, #7c3aed 0%, #f43f5e 100%)">
            <div class="text-subtitle1 text-weight-bold font-heading row items-center">
              <q-icon name="o_notification_important" size="24px" class="q-mr-xs glow-effect" /> Recordatorios Críticos
            </div>
          </div>

          <q-card-section class="q-pa-none bg-white">
            <q-list separator class="q-py-xs">
              <q-item v-for="r in recordatorios" :key="r._id" class="q-py-md item-reminder">
                <q-item-section avatar>
                  <q-avatar color="red-1" text-color="red-9">
                    <q-icon name="o_warning" size="22px" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-slate-800">{{ r.contacto }}</q-item-label>
                  <q-item-label caption class="text-negative text-weight-medium row items-center">
                    <q-icon name="o_event" size="14px" class="q-mr-xs" />
                    Vence: {{ r.fechaLimite ? new Date(r.fechaLimite).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : 'Sin límite' }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="text-subtitle2 text-weight-bolder text-slate-850 font-heading">{{ formatMonto(r.montoTotal - r.montoPagado) }}</div>
                </q-item-section>
              </q-item>

              <div v-if="recordatorios.length === 0" class="q-pa-xl text-center text-grey-5">
                <q-icon name="o_check_circle" size="48px" color="positive" class="q-mb-sm opacity-60" />
                <div class="text-weight-medium">¡Al día! No tienes deudas pendientes.</div>
              </div>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Últimas Transacciones -->
      <div class="col-12 col-md-7 col-lg-8">
        <div class="row justify-between items-center q-mb-md">
          <div class="row items-center">
            <span class="dot-indicator bg-slate-700 q-mr-sm"></span>
            <span class="text-h6 text-weight-bold text-slate-900 font-heading">Últimos Movimientos</span>
          </div>
          <q-btn label="Ver Todas" color="primary" flat dense no-caps class="text-weight-bold text-subtitle2" to="/transacciones" />
        </div>

        <q-card class="shadow-1 table-card" style="border-radius: 12px;">
          <q-card-section class="q-pa-none">
            <q-table
              flat
              :rows="rows"
              :columns="columns"
              row-key="_id"
              hide-bottom
              :pagination="{ rowsPerPage: 5 }"
              class="table-premium-mock table-movimientos-dash"
            >
              <template v-slot:body-cell-fecha="props">
                <q-td :props="props" class="text-slate-800 text-weight-medium">
                  {{ props.value }}
                </q-td>
              </template>

              <template v-slot:body-cell-descripcion="props">
                <q-td :props="props" class="text-slate-900 text-weight-bold">
                  <div class="row items-center">
                    <span class="dot-indicator q-mr-sm" :class="props.row.tipo === 'ingreso' ? 'bg-green' : 'bg-red'"></span>
                    <span>{{ props.value }}</span>
                  </div>
                </q-td>
              </template>

              <template v-slot:body-cell-categoria="props">
                <q-td :props="props" class="text-center">
                  <q-chip
                    :color="props.row.tipo === 'ingreso' ? 'green-1' : 'red-1'"
                    :text-color="props.row.tipo === 'ingreso' ? 'green-9' : 'red-9'"
                    class="text-weight-bold text-caption text-uppercase rounded-chip"
                    dense
                  >
                    {{ props.value }}
                  </q-chip>
                </q-td>
              </template>

              <template v-slot:body-cell-monto="props">
                <q-td :props="props" :class="props.row.tipo === 'ingreso' ? 'text-positive text-weight-bold text-subtitle2 font-heading' : 'text-negative text-weight-bold text-subtitle2 font-heading'">
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
import { ahorroService } from '../services/ahorroService.js';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();

const saldoDisponible = ref(0);
const totalAhorrado = ref(0);
const ingresosMensuales = ref(0);
const deudasPorPagar = ref(0);
const recordatorios = ref([]);
const rows = ref([]);

const columns = [
  { name: 'fecha', align: 'left', label: 'Fecha', field: 'fecha', format: val => val ? new Date(val).toLocaleDateString('es-ES') : '', sortable: true },
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

    // 3. Obtener ahorros acumulados en bolsillos
    const resAhorros = await ahorroService.obtener();
    if (resAhorros?.success) {
      const bolsillos = resAhorros.cajas || [];
      totalAhorrado.value = bolsillos.reduce((sum, c) => sum + c.montoAcumulado, 0);
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

onMounted(() => {
  cargarDatos();
});
</script>

<style scoped>
/* Las 5 cards de resumen pastel degradado suave del mockup */
.card-resumen {
  background: white !important;
  border: 1px solid rgba(0,0,0,0.03);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  min-height: 100px;
}
.card-resumen:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.05) !important;
}
.card-resumen-capital { 
  background: linear-gradient(135deg, #ecfeff 0%, #cffafe 100%) !important; /* Celeste/Capital total */
}
.card-resumen-disponible { 
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%) !important; /* Indigo/Disponible pastel */
}
.card-resumen-ahorrado { 
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%) !important; /* Amarillo/Oro pastel */
}
.card-resumen-ingresos { 
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%) !important; /* Verde/Ingresos pastel */
}
.card-resumen-deudas { 
  background: linear-gradient(135deg, #fff5f5 0%, #ffe3e3 100%) !important; /* Rojo/Deudas pastel */
}

@media (max-width: 768px) {
  .card-resumen {
    min-height: 80px !important;
  }
  .card-resumen :deep(.q-card__section) {
    padding: 10px 8px !important;
  }
  .icon-box {
    width: 32px !important;
    height: 32px !important;
    margin-right: 6px !important;
  }
  .icon-box :deep(.q-icon) {
    font-size: 18px !important;
  }
  .card-resumen .text-subtitle2 {
    font-size: 11px !important;
  }
  .card-resumen .text-h5 {
    font-size: 15px !important;
    margin: 2px 0 !important;
  }
  .card-resumen .text-caption {
    font-size: 9px !important;
  }
}

.icon-box {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-box-capital { background: #cffafe; }
.icon-box-disponible { background: #e0e7ff; }
.icon-box-ahorrado { background: #fef3c7; }
.icon-box-ingresos { background: #d1fae5; }
.icon-box-deudas { background: #fee2e2; }

/* Indicador de punto de color redondo */
.dot-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

/* Card de recordatorios */
.border-reminder-card {
  border: 1.5px solid #f1f5f9;
}

.item-reminder {
  transition: background-color 0.2s ease;
}
.item-reminder:hover {
  background-color: #f8fafc;
}

/* Estructura limpia de tablas con cabecera en degradado */
.table-card {
  border: 1.5px solid #f1f5f9;
  overflow: hidden !important;
}
.table-movimientos-dash :deep(thead tr) {
  background: linear-gradient(135deg, #0f172a 0%, #0284c7 100%) !important; /* Slate a Celeste */
}
.table-movimientos-dash :deep(thead th) {
  color: white !important;
  font-weight: 700 !important;
  font-size: 12px !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em;
  border-bottom: none !important;
}
.table-premium-mock :deep(thead th) {
  padding: 16px 12px !important;
}
.table-premium-mock :deep(tbody td) {
  padding: 18px 12px !important;
}
.table-premium-mock :deep(tbody tr) {
  border-bottom: 1px solid #f1f5f9 !important;
}

.rounded-chip {
  border-radius: 8px !important;
}
</style>