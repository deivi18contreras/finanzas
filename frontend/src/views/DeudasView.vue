<template>
  <q-page class="q-pa-lg bg-grey-1">
    
    <div class="row justify-between items-center q-mb-xl">
      <div>
        <h4 class="text-h4 text-weight-bold q-my-none text-primary font-heading">Control de Deudas</h4>
        <p class="text-subtitle2 text-grey-6 q-my-none">Registra, analiza y liquida tus compromisos financieros pendientes.</p>
      </div>
      <div>
        <q-btn 
          color="primary" 
          icon="add" 
          label="Nueva Deuda" 
          class="bg-gradient-primary text-white text-weight-bold q-px-md"
          no-caps 
          @click="abrirModal" 
        />
      </div>
    </div>

    <!-- Resumen de deudas -->
    <div class="row q-col-gutter-lg q-mb-xl">
      <div class="col-12 col-sm-6">
        <BalanceCard
          titulo="Por Pagar Pendiente"
          :monto="totalPorPagar"
          icono="trending_down"
          color-class="bg-gradient-accent"
        />
      </div>

      <div class="col-12 col-sm-6">
        <BalanceCard
          titulo="Total Liquidado (Pagado)"
          :monto="totalLiquidado"
          icono="check_circle"
          color-class="bg-gradient-secondary"
        />
      </div>
    </div>

    <!-- Tabla -->
    <q-card class="shadow-hover" style="border-radius: 16px;">
      <q-card-section class="q-pa-none">
        <q-table
          flat
          :rows="deudas"
          :columns="columnas"
          row-key="_id"
          :pagination="{ rowsPerPage: 10 }"
          class="table-premium"
        >
          <template v-slot:body-cell-contacto="props">
            <q-td :props="props" class="text-slate-800">
              <div class="row items-center">
                <q-avatar size="28px" :color="props.row.tipo === 'por_pagar' ? 'red-1' : 'green-1'" :text-color="props.row.tipo === 'por_pagar' ? 'red-9' : 'green-9'" class="q-mr-sm text-caption text-weight-bold">
                  {{ props.row.tipo === 'por_pagar' ? 'P' : 'C' }}
                </q-avatar>
                <div>
                  <div class="text-weight-bold" style="font-size:14px">{{ props.value }}</div>
                  <div class="text-caption text-grey-6" style="font-size:11px">{{ props.row.descripcion || 'Sin descripción' }}</div>
                </div>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-montoTotal="props">
            <q-td :props="props" class="text-weight-bold text-subtitle2 font-heading">
              ${{ props.value.toLocaleString() }}
            </q-td>
          </template>

          <template v-slot:body-cell-montoPagado="props">
            <q-td :props="props" class="text-weight-medium text-subtitle2 text-grey-7 font-heading">
              ${{ props.value.toLocaleString() }}
            </q-td>
          </template>

          <template v-slot:body-cell-estado="props">
            <q-td :props="props" class="text-center">
              <q-chip 
                :color="props.value === 'pendiente' ? 'amber-2' : 'green-2'" 
                :text-color="props.value === 'pendiente' ? 'amber-9' : 'green-9'" 
                class="text-weight-bolder text-uppercase text-caption"
                square
                dense
              >
                {{ props.value }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-acciones="props">
            <q-td :props="props" class="text-center q-gutter-xs">
              <q-btn 
                v-if="props.row.estado === 'pendiente'"
                icon="payment" 
                color="positive" 
                flat 
                round 
                dense 
                @click="abrirAbonar(props.row)"
              >
                <q-tooltip>Registrar Abono / Liquidar</q-tooltip>
              </q-btn>
              <q-btn 
                icon="delete" 
                color="negative" 
                flat 
                round 
                dense 
                @click="confirmarEliminarDeuda(props.row._id)"
              >
                <q-tooltip>Eliminar Registro</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Modal Bottom Sheet: Registrar Deuda -->
    <q-dialog v-model="modalDeuda" persistent :position="$q.screen.lt.md ? 'bottom' : 'standard'">
      <q-card :class="$q.screen.lt.md ? 'modal-sheet' : 'modal-sheet-desktop'">

        <!-- Cabecera degradado según tipo -->
        <div
          class="modal-header"
          :style="nuevaDeuda.tipo === 'por_pagar'
            ? 'background: linear-gradient(135deg, #f43f5e 0%, #7c3aed 100%)'
            : 'background: linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)'">
          <div class="drag-handle"></div>
          <div class="row items-start">
            <div>
              <div class="modal-title">
                {{ nuevaDeuda.tipo === 'por_pagar' ? '🔴 Registrar Deuda a Pagar' : '🟢 Registrar Deuda a Cobrar' }}
              </div>
              <div class="modal-subtitle">Completa los datos del compromiso financiero</div>
            </div>
            <q-space />
            <q-btn icon="close" flat round dense color="white" class="modal-close-btn" v-close-popup />
          </div>
        </div>

        <!-- Formulario -->
        <div class="modal-body">
          <q-form ref="formDeuda" @submit.prevent="guardarDeuda" class="q-gutter-y-sm">

            <!-- Pill toggle tipo de deuda -->
            <div>
              <div class="text-caption text-grey-6 text-weight-bold q-mb-xs" style="letter-spacing:0.05em">TIPO DE DEUDA</div>
              <div class="type-toggle">
                <div
                  class="type-pill"
                  :class="nuevaDeuda.tipo === 'por_pagar' ? 'active-gasto' : ''"
                  @click="nuevaDeuda.tipo = 'por_pagar'"
                >
                  🔴 Por Pagar
                </div>
                <div
                  class="type-pill"
                  :class="nuevaDeuda.tipo === 'por_cobrar' ? 'active-ingreso' : ''"
                  @click="nuevaDeuda.tipo = 'por_cobrar'"
                >
                  🟢 Por Cobrar
                </div>
              </div>
            </div>

            <q-input
              filled
              v-model="nuevaDeuda.contacto"
              label="Acreedor / Deudor"
              placeholder="Ej. Dr. Ortodoncista, Juan Pérez"
              color="primary"
              lazy-rules
              :rules="[val => val && val.length > 0 || 'El nombre es obligatorio']"
            />

            <q-input
              filled
              v-model="nuevaDeuda.descripcion"
              label="Descripción / Concepto"
              placeholder="Ej. Tratamiento de Ortodoncia, Préstamo para repuesto"
              color="primary"
            />

            <q-input
              filled
              v-model.number="nuevaDeuda.montoTotal"
              label="Monto Total ($)"
              type="number"
              color="primary"
              lazy-rules
              :rules="[val => val && val > 0 || 'Ingresa un monto válido']"
            >
              <template v-slot:prepend>
                <span class="text-weight-bold text-grey-6">$</span>
              </template>
            </q-input>

            <q-input
              filled
              v-model="nuevaDeuda.fechaLimite"
              label="Fecha de Vencimiento (Opcional)"
              type="date"
              stack-label
              color="primary"
            />

            <!-- Toggle descontar caja -->
            <q-toggle
              v-model="nuevaDeuda.descontarCaja"
              :label="nuevaDeuda.tipo === 'por_cobrar'
                ? '¿Descontar este préstamo de mi dinero disponible (caja)?'
                : '¿Descontar este retiro (préstamo tomado) de mi dinero disponible (caja)?'"
              color="positive"
              class="q-mt-sm full-width"
            />

          </q-form>
        </div>

        <!-- Acciones sticky -->
        <div class="modal-action-bar">
          <q-btn label="Cancelar" flat no-caps class="btn-cancel" v-close-popup />
          <q-btn
            label="Registrar Deuda"
            no-caps
            class="btn-confirm text-white"
            :style="nuevaDeuda.tipo === 'por_pagar'
              ? 'background: linear-gradient(135deg,#f43f5e,#7c3aed)'
              : 'background: linear-gradient(135deg,#10b981,#0ea5e9)'"
            @click="submitDeuda"
          />
        </div>

      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { deudaService } from '../services/deudaService.js';
import BalanceCard from '../components/BalanceCard.vue';

const $q = useQuasar();
const formDeuda = ref(null);

const modalDeuda = ref(false);
const nuevaDeuda = ref({
  tipo: 'por_pagar',
  contacto: '',
  descripcion: '',
  montoTotal: null,
  fechaLimite: '',
  descontarCaja: false,
  estado: 'pendiente'
});

const deudas = ref([]);
const totalPorPagar = ref(0);
const totalLiquidado = ref(0);

const columnas = [
  { name: 'contacto', align: 'left', label: 'Contacto / Concepto', field: 'contacto', sortable: true },
  { name: 'montoTotal', align: 'right', label: 'Monto Total', field: 'montoTotal', sortable: true },
  { name: 'montoPagado', align: 'right', label: 'Monto Pagado', field: 'montoPagado', sortable: true },
  { name: 'fechaLimite', align: 'center', label: 'Vencimiento', field: 'fechaLimite', format: val => val ? new Date(val).toLocaleDateString() : 'Sin límite', sortable: true },
  { name: 'estado', align: 'center', label: 'Estado', field: 'estado', sortable: true },
  { name: 'acciones', align: 'center', label: 'Acciones' }
];

const formatMonto = (v) => {
  if (v === undefined || v === null) return '$0';
  return (v < 0 ? '-' : '') + '$' + Math.abs(v).toLocaleString();
};

const cargarDeudas = async () => {
  try {
    const res = await deudaService.obtener();
    if (res?.success) {
      deudas.value = res.deudas || [];
      
      // Calcular totales
      totalPorPagar.value = deudas.value
        .filter(d => d.tipo === 'por_pagar' && d.estado === 'pendiente')
        .reduce((sum, d) => sum + (d.montoTotal - d.montoPagado), 0);
        
      totalLiquidado.value = deudas.value
        .reduce((sum, d) => sum + d.montoPagado, 0);
    }
  } catch (error) {
    console.error('Error al cargar deudas:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar el módulo de deudas.',
      position: 'top'
    });
  }
};

const abrirModal = () => {
  nuevaDeuda.value = {
    tipo: 'por_pagar',
    contacto: '',
    descripcion: '',
    montoTotal: null,
    fechaLimite: '',
    descontarCaja: false,
    estado: 'pendiente'
  };
  modalDeuda.value = true;
};

const submitDeuda = async () => {
  const valid = await formDeuda.value?.validate();
  if (!valid) return;
  await guardarDeuda();
};

const guardarDeuda = async () => {
  try {
    $q.loading.show({ message: 'Registrando deuda...' });
    const res = await deudaService.crear(nuevaDeuda.value);
    if (res?.success) {
      modalDeuda.value = false;
      $q.notify({
        type: 'positive',
        message: 'Deuda registrada correctamente.',
        position: 'top'
      });
      await cargarDeudas();
    }
  } catch (error) {
    console.error('Error al registrar deuda:', error);
    $q.notify({
      type: 'negative',
      message: error.response?.data?.msg || 'Error al guardar la deuda.',
      position: 'top'
    });
  } finally {
    $q.loading.hide();
  }
};

const abrirAbonar = (deuda) => {
  const saldoPendiente = deuda.montoTotal - deuda.montoPagado;
  $q.dialog({
    title: 'Registrar Pago / Abono',
    message: `Ingrese el monto a abonar (Máximo $${saldoPendiente.toLocaleString()}):`,
    prompt: {
      model: saldoPendiente.toString(),
      type: 'number'
    },
    cancel: {
      color: 'grey-7',
      flat: true
    },
    ok: {
      color: 'positive',
      label: 'Registrar Pago'
    },
    persistent: true
  }).onOk(async (data) => {
    const monto = parseInt(data);
    if (isNaN(monto) || monto <= 0 || monto > saldoPendiente) {
      $q.notify({
        type: 'warning',
        message: 'Monto inválido para el abono.',
        position: 'top'
      });
      return;
    }
    try {
      $q.loading.show({ message: 'Procesando abono...' });
      const res = await deudaService.registrarAbono(deuda._id, monto);
      if (res?.success) {
        $q.notify({
          type: 'positive',
          message: res.msg || 'Abono registrado con éxito.',
          position: 'top'
        });
        await cargarDeudas();
      }
    } catch (error) {
      console.error('Error al registrar abono:', error);
      $q.notify({
        type: 'negative',
        message: error.response?.data?.msg || 'Error al abonar a la deuda.',
        position: 'top'
      });
    } finally {
      $q.loading.hide();
    }
  });
};

const confirmarEliminarDeuda = (id) => {
  $q.dialog({
    title: 'Eliminar Registro',
    message: '¿Está seguro de que desea eliminar permanentemente esta deuda?',
    cancel: {
      color: 'grey-7',
      flat: true
    },
    ok: {
      color: 'negative',
      label: 'Eliminar'
    },
    persistent: true
  }).onOk(async () => {
    try {
      $q.loading.show({ message: 'Eliminando deuda...' });
      const res = await deudaService.eliminar(id);
      if (res?.success) {
        $q.notify({
          type: 'positive',
          message: 'Deuda eliminada del sistema.',
          position: 'top'
        });
        await cargarDeudas();
      }
    } catch (error) {
      console.error('Error al eliminar deuda:', error);
      $q.notify({
        type: 'negative',
        message: 'Error al intentar eliminar la deuda.',
        position: 'top'
      });
    } finally {
      $q.loading.hide();
    }
  });
};

onMounted(() => {
  cargarDeudas();
});
</script>

<style scoped>
.card-premium {
  border-radius: 20px !important;
  border: none !important;
}

.bg-white-10 {
  background: rgba(255, 255, 255, 0.15);
}

.tracking-wider {
  letter-spacing: 0.05em;
}

.table-premium {
  border: none !important;
}

.text-slate-800 {
  color: #1e293b;
}
</style>