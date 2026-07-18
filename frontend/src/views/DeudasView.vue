<template>
  <q-page class="q-pa-lg bg-grey-1">

    <div class="row justify-between items-center q-mb-xl">
      <div>
        <h4 class="text-h4 text-weight-bold q-my-none text-slate-800 font-heading">Control de Deudas</h4>
      </div>
    </div>

    <!-- Las 3 Tarjetas de Resumen superiores idénticas al mockup -->
    <div class="row q-col-gutter-lg q-mb-xl">
      <!-- Tarjeta 1: Por Pagar (Roja) -->
      <div class="col-12 col-sm-4">
        <q-card class="shadow-1 card-resumen card-resumen-pagar" style="border-radius: 16px;">
          <q-card-section class="row items-center q-pa-lg">
            <div class="icon-box icon-box-pagar q-mr-md">
              <q-icon name="o_payments" size="28px" color="red-5" />
            </div>
            <div>
              <div class="text-subtitle2 text-grey-7 text-weight-bold">Por Pagar Pendiente</div>
              <div class="text-h4 text-weight-bolder text-slate-900 q-my-xs">${{ totalPorPagar.toLocaleString() }}</div>
              <div class="text-caption text-grey-8 text-weight-medium">{{ deudasPorPagarPendientesCount }} deudas pendientes</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Tarjeta 2: Por Cobrar (Verde) -->
      <div class="col-12 col-sm-4">
        <q-card class="shadow-1 card-resumen card-resumen-cobrar" style="border-radius: 16px;">
          <q-card-section class="row items-center q-pa-lg">
            <div class="icon-box icon-box-cobrar q-mr-md">
              <q-icon name="o_account_balance_wallet" size="28px" color="green-5" />
            </div>
            <div>
              <div class="text-subtitle2 text-grey-7 text-weight-bold">Por Cobrar Pendiente</div>
              <div class="text-h4 text-weight-bolder text-slate-900 q-my-xs">${{ totalPorCobrar.toLocaleString() }}</div>
              <div class="text-caption text-grey-8 text-weight-medium">{{ deudasPorCobrarPendientesCount }} cuentas por cobrar</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Tarjeta 3: Total Liquidado (Azul) -->
      <div class="col-12 col-sm-4">
        <q-card class="shadow-1 card-resumen card-resumen-liquidado" style="border-radius: 16px;">
          <q-card-section class="row items-center q-pa-lg">
            <div class="icon-box icon-box-liquidado q-mr-md">
              <q-icon name="o_check_circle" size="28px" color="blue-5" />
            </div>
            <div>
              <div class="text-subtitle2 text-grey-7 text-weight-bold">Total Liquidado</div>
              <div class="text-h4 text-weight-bolder text-slate-900 q-my-xs">${{ totalLiquidado.toLocaleString() }}</div>
              <div class="text-caption text-grey-8 text-weight-medium">{{ deudasLiquidadasCount }} deudas pagadas</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- TABLA 1: DEUDAS POR PAGAR (Lo que debes) -->
    <div class="q-mb-xl">
      <div class="row items-center justify-between q-mb-md">
        <div>
          <div class="row items-center">
            <span class="dot-indicator bg-red q-mr-sm"></span>
            <span class="text-h6 text-weight-bold text-slate-900 font-heading">Deudas por Pagar</span>
          </div>
          <span class="text-caption text-grey-6 block q-ml-sm">Lo que debes</span>
        </div>
        <div class="row q-gutter-sm items-center">
          <q-input
            v-model="buscarPagar"
            placeholder="Buscar"
            dense
            outlined
            rounded
            bg-color="white"
            class="search-bar"
          >
            <template v-slot:prepend>
              <q-icon name="search" size="20px" color="grey-5" />
            </template>
          </q-input>
          <q-btn
            color="black"
            label="Nueva Deuda"
            class="btn-dark text-weight-bold"
            no-caps
            unelevated
            @click="abrirModalCrear('por_pagar')"
          />
        </div>
      </div>

      <q-card class="shadow-1 table-card" style="border-radius: 12px;">
        <q-card-section class="q-pa-none">
          <q-table
            flat
            :rows="deudasPorPagarFiltradas"
            :columns="columnasMock"
            row-key="_id"
            :pagination="{ rowsPerPage: 10 }"
            class="table-premium-mock"
            hide-bottom
          >
            <template v-slot:body-cell-contacto="props">
              <q-td :props="props" class="text-slate-800">
                <div class="row items-center">
                  <span class="dot-indicator bg-red q-mr-sm"></span>
                  <div class="text-weight-bold">{{ props.value }}</div>
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-montoTotal="props">
              <q-td :props="props" class="text-weight-medium text-slate-800">
                ${{ props.value.toLocaleString() }}
              </q-td>
            </template>

            <template v-slot:body-cell-fechaLimite="props">
              <q-td :props="props" class="text-center text-grey-7">
                {{ props.value ? new Date(props.value).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Sin límite' }}
              </q-td>
            </template>

            <template v-slot:body-cell-estado="props">
              <q-td :props="props" class="text-center">
                <q-chip
                  :color="props.value === 'pendiente' ? 'orange-1' : 'green-1'"
                  :text-color="props.value === 'pendiente' ? 'orange-8' : 'green-8'"
                  class="text-weight-bold text-caption rounded-chip"
                  dense
                >
                  {{ props.value === 'pendiente' ? 'Pendiente' : 'Liquidada' }}
                </q-chip>
              </q-td>
            </template>

            <template v-slot:body-cell-acciones="props">
              <q-td :props="props" class="text-center q-gutter-xs">
                <q-btn
                  label="Ver"
                  color="grey-2"
                  text-color="slate-800"
                  unelevated
                  no-caps
                  class="btn-action-pill"
                  @click="abrirEditar(props.row)"
                />
                <q-btn
                  v-if="props.row.estado === 'pendiente'"
                  label="Pagar"
                  color="negative"
                  unelevated
                  no-caps
                  class="btn-action-pill text-white"
                  @click="abrirAbonar(props.row)"
                />
                <q-btn
                  label="Eliminar"
                  color="grey-2"
                  text-color="red-7"
                  unelevated
                  no-caps
                  class="btn-action-pill"
                  @click="confirmarEliminarDeuda(props.row._id)"
                />
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>

    <!-- TABLA 2: CUENTAS POR COBRAR (Lo que te deben) -->
    <div class="q-mb-xl">
      <div class="row items-center justify-between q-mb-md">
        <div>
          <div class="row items-center">
            <span class="dot-indicator bg-green q-mr-sm"></span>
            <span class="text-h6 text-weight-bold text-slate-900 font-heading">Cuentas por Cobrar</span>
          </div>
          <span class="text-caption text-grey-6 block q-ml-sm">Lo que te deben</span>
        </div>
        <div class="row q-gutter-sm items-center">
          <q-input
            v-model="buscarCobrar"
            placeholder="Buscar"
            dense
            outlined
            rounded
            bg-color="white"
            class="search-bar"
          >
            <template v-slot:prepend>
              <q-icon name="search" size="20px" color="grey-5" />
            </template>
          </q-input>
          <q-btn
            color="black"
            label="Nuevo Cobro"
            class="btn-dark text-weight-bold"
            no-caps
            unelevated
            @click="abrirModalCrear('por_cobrar')"
          />
        </div>
      </div>

      <q-card class="shadow-1 table-card" style="border-radius: 12px;">
        <q-card-section class="q-pa-none">
          <q-table
            flat
            :rows="deudasPorCobrarFiltradas"
            :columns="columnasMock"
            row-key="_id"
            :pagination="{ rowsPerPage: 10 }"
            class="table-premium-mock"
            hide-bottom
          >
            <template v-slot:body-cell-contacto="props">
              <q-td :props="props" class="text-slate-800">
                <div class="row items-center">
                  <span class="dot-indicator bg-green q-mr-sm"></span>
                  <div class="text-weight-bold">{{ props.value }}</div>
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-montoTotal="props">
              <q-td :props="props" class="text-weight-medium text-slate-800">
                ${{ props.value.toLocaleString() }}
              </q-td>
            </template>

            <template v-slot:body-cell-fechaLimite="props">
              <q-td :props="props" class="text-center text-grey-7">
                {{ props.value ? new Date(props.value).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Sin límite' }}
              </q-td>
            </template>

            <template v-slot:body-cell-estado="props">
              <q-td :props="props" class="text-center">
                <q-chip
                  :color="props.value === 'pendiente' ? 'orange-1' : 'green-1'"
                  :text-color="props.value === 'pendiente' ? 'orange-8' : 'green-8'"
                  class="text-weight-bold text-caption rounded-chip"
                  dense
                >
                  {{ props.value === 'pendiente' ? 'Pendiente' : 'Liquidada' }}
                </q-chip>
              </q-td>
            </template>

            <template v-slot:body-cell-acciones="props">
              <q-td :props="props" class="text-center q-gutter-xs">
                <q-btn
                  label="Ver"
                  color="grey-2"
                  text-color="slate-800"
                  unelevated
                  no-caps
                  class="btn-action-pill"
                  @click="abrirEditar(props.row)"
                />
                <q-btn
                  v-if="props.row.estado === 'pendiente'"
                  label="Cobrar"
                  color="positive"
                  unelevated
                  no-caps
                  class="btn-action-pill text-white"
                  @click="abrirAbonar(props.row)"
                />
                <q-btn
                  label="Eliminar"
                  color="grey-2"
                  text-color="red-7"
                  unelevated
                  no-caps
                  class="btn-action-pill"
                  @click="confirmarEliminarDeuda(props.row._id)"
                />
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>

    <!-- Modal: Crear / Editar Deuda -->
    <q-dialog v-model="modalDeuda" persistent :position="$q.screen.lt.md ? 'bottom' : 'standard'">
      <q-card :class="$q.screen.lt.md ? 'modal-sheet' : 'modal-sheet-desktop'">

        <div
          class="modal-header"
          :style="nuevaDeuda.tipo === 'por_pagar'
            ? 'background: linear-gradient(135deg, #f43f5e 0%, #7c3aed 100%)'
            : 'background: linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)'">
          <div class="drag-handle"></div>
          <div class="row items-start">
            <div>
              <div class="modal-title">
                {{ modoEdicion ? '✏️ Editar Registro' : (nuevaDeuda.tipo === 'por_pagar' ? '🔴 Registrar Deuda a Pagar' : '🟢 Registrar Deuda a Cobrar') }}
              </div>
              <div class="modal-subtitle">Completa los datos del compromiso financiero</div>
            </div>
            <q-space />
            <q-btn icon="close" flat round dense color="white" class="modal-close-btn" v-close-popup />
          </div>
        </div>

        <div class="modal-body">
          <q-form ref="formDeuda" @submit.prevent="submitDeuda" class="q-gutter-y-sm">

            <!-- Pill toggle tipo (solo en crear) -->
            <div v-if="!modoEdicion">
              <div class="text-caption text-grey-6 text-weight-bold q-mb-xs" style="letter-spacing:0.05em">TIPO DE REGISTRO</div>
              <div class="type-toggle">
                <div class="type-pill" :class="nuevaDeuda.tipo === 'por_pagar' ? 'active-gasto' : ''" @click="nuevaDeuda.tipo = 'por_pagar'">
                  🔴 Por Pagar
                </div>
                <div class="type-pill" :class="nuevaDeuda.tipo === 'por_cobrar' ? 'active-ingreso' : ''" @click="nuevaDeuda.tipo = 'por_cobrar'">
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

            <!-- Toggle descontar caja (solo en crear) -->
            <q-toggle
              v-if="!modoEdicion"
              v-model="nuevaDeuda.descontarCaja"
              :label="nuevaDeuda.tipo === 'por_cobrar'
                ? '¿Descontar este préstamo de mi dinero disponible (caja)?'
                : '¿Descontar este retiro (préstamo tomado) de mi dinero disponible (caja)?'"
              color="positive"
              class="q-mt-sm full-width"
            />

          </q-form>
        </div>

        <div class="modal-action-bar">
          <q-btn label="Cancelar" flat no-caps class="btn-cancel" v-close-popup />
          <q-btn
            :label="modoEdicion ? 'Guardar Cambios' : 'Registrar'"
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
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { deudaService } from '../services/deudaService.js';

import { formatMonto } from '../utils/formatters.js';

const $q = useQuasar();
const formDeuda = ref(null);
const modalDeuda = ref(false);
const modoEdicion = ref(false);
const editandoId = ref(null);

const buscarPagar = ref('');
const buscarCobrar = ref('');

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
const totalPorCobrar = ref(0);
const totalLiquidado = ref(0);

const deudasPorPagarPendientesCount = ref(0);
const deudasPorCobrarPendientesCount = ref(0);
const deudasLiquidadasCount = ref(0);

const columnasMock = [
  { name: 'contacto', align: 'left', label: 'Acreedor', field: 'contacto', sortable: true },
  { name: 'descripcion', align: 'left', label: 'Descripción', field: 'descripcion' },
  { name: 'montoTotal', align: 'right', label: 'Monto', field: 'montoTotal', sortable: true },
  { name: 'fechaLimite', align: 'center', label: 'Fecha Límite', field: 'fechaLimite', sortable: true },
  { name: 'estado', align: 'center', label: 'Estado', field: 'estado', sortable: true },
  { name: 'acciones', align: 'center', label: 'Acciones' }
];

const deudasPorPagar = computed(() =>
  deudas.value.filter(d => d.tipo === 'por_pagar')
);

const deudasPorCobrar = computed(() =>
  deudas.value.filter(d => d.tipo === 'por_cobrar')
);

// Filtrado de búsquedas reactivo
const deudasPorPagarFiltradas = computed(() => {
  const query = buscarPagar.value.toLowerCase().trim();
  if (!query) return deudasPorPagar.value;
  return deudasPorPagar.value.filter(d =>
    d.contacto.toLowerCase().includes(query) || (d.descripcion && d.descripcion.toLowerCase().includes(query))
  );
});

const deudasPorCobrarFiltradas = computed(() => {
  const query = buscarCobrar.value.toLowerCase().trim();
  if (!query) return deudasPorCobrar.value;
  return deudasPorCobrar.value.filter(d =>
    d.contacto.toLowerCase().includes(query) || (d.descripcion && d.descripcion.toLowerCase().includes(query))
  );
});

const cargarDeudas = async () => {
  try {
    const res = await deudaService.obtener();
    if (res?.success) {
      deudas.value = res.deudas || [];

      totalPorPagar.value = deudas.value
        .filter(d => d.tipo === 'por_pagar' && d.estado === 'pendiente')
        .reduce((sum, d) => sum + (d.montoTotal - d.montoPagado), 0);

      totalPorCobrar.value = deudas.value
        .filter(d => d.tipo === 'por_cobrar' && d.estado === 'pendiente')
        .reduce((sum, d) => sum + (d.montoTotal - d.montoPagado), 0);

      totalLiquidado.value = deudas.value
        .reduce((sum, d) => sum + d.montoPagado, 0);

      // Conteos dinámicos
      deudasPorPagarPendientesCount.value = deudas.value.filter(d => d.tipo === 'por_pagar' && d.estado === 'pendiente').length;
      deudasPorCobrarPendientesCount.value = deudas.value.filter(d => d.tipo === 'por_cobrar' && d.estado === 'pendiente').length;
      deudasLiquidadasCount.value = deudas.value.filter(d => d.estado === 'liquidada').length;
    }
  } catch (error) {
    console.error('Error al cargar deudas:', error);
    $q.notify({ type: 'negative', message: 'Error al cargar el módulo de deudas.', position: 'top' });
  }
};

const abrirModalCrear = (tipo) => {
  modoEdicion.value = false;
  editandoId.value = null;
  nuevaDeuda.value = {
    tipo,
    contacto: '',
    descripcion: '',
    montoTotal: null,
    fechaLimite: '',
    descontarCaja: false,
    estado: 'pendiente'
  };
  modalDeuda.value = true;
};

const abrirEditar = (deuda) => {
  modoEdicion.value = true;
  editandoId.value = deuda._id;
  nuevaDeuda.value = {
    tipo: deuda.tipo,
    contacto: deuda.contacto,
    descripcion: deuda.descripcion || '',
    montoTotal: deuda.montoTotal,
    fechaLimite: deuda.fechaLimite ? deuda.fechaLimite.substring(0, 10) : '',
    descontarCaja: false
  };
  modalDeuda.value = true;
};

const submitDeuda = async () => {
  const valid = await formDeuda.value?.validate();
  if (!valid) return;

  if (modoEdicion.value) {
    await guardarEdicion();
  } else {
    await guardarDeuda();
  }
};

const guardarDeuda = async () => {
  try {
    $q.loading.show({ message: 'Registrando...' });
    const res = await deudaService.crear(nuevaDeuda.value);
    if (res?.success) {
      modalDeuda.value = false;
      $q.notify({ type: 'positive', message: 'Registrado correctamente.', position: 'top' });
      await cargarDeudas();
    }
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.msg || 'Error al guardar.', position: 'top' });
  } finally {
    $q.loading.hide();
  }
};

const guardarEdicion = async () => {
  try {
    $q.loading.show({ message: 'Guardando cambios...' });
    const res = await deudaService.editar(editandoId.value, nuevaDeuda.value);
    if (res?.success) {
      modalDeuda.value = false;
      $q.notify({ type: 'positive', message: 'Actualizado correctamente.', position: 'top' });
      await cargarDeudas();
    }
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.msg || 'Error al actualizar.', position: 'top' });
  } finally {
    $q.loading.hide();
  }
};

const abrirAbonar = (deuda) => {
  const saldoPendiente = deuda.montoTotal - deuda.montoPagado;
  $q.dialog({
    title: deuda.tipo === 'por_pagar' ? 'Registrar Pago' : 'Registrar Cobro',
    message: `Ingrese el monto (Máximo $${saldoPendiente.toLocaleString()}):`,
    prompt: { model: saldoPendiente.toString(), type: 'number' },
    cancel: { color: 'grey-7', flat: true },
    ok: { color: 'positive', label: 'Procesar' },
    persistent: true
  }).onOk(async (data) => {
    const monto = parseInt(data);
    if (isNaN(monto) || monto <= 0 || monto > saldoPendiente) {
      $q.notify({ type: 'warning', message: 'Monto inválido.', position: 'top' });
      return;
    }
    try {
      $q.loading.show({ message: 'Procesando transaccion...' });
      const res = await deudaService.registrarAbono(deuda._id, monto);
      if (res?.success) {
        $q.notify({ type: 'positive', message: res.msg || 'Procesado con éxito.', position: 'top' });
        await cargarDeudas();
      }
    } catch (error) {
      $q.notify({ type: 'negative', message: error.response?.data?.msg || 'Error al procesar.', position: 'top' });
    } finally {
      $q.loading.hide();
    }
  });
};

const confirmarEliminarDeuda = (id) => {
  $q.dialog({
    title: 'Eliminar Registro',
    message: '¿Está seguro de que desea eliminar permanentemente este registro?',
    cancel: { color: 'grey-7', flat: true },
    ok: { color: 'negative', label: 'Eliminar' },
    persistent: true
  }).onOk(async () => {
    try {
      $q.loading.show({ message: 'Eliminando...' });
      const res = await deudaService.eliminar(id);
      if (res?.success) {
        $q.notify({ type: 'positive', message: 'Eliminado correctamente.', position: 'top' });
        await cargarDeudas();
      }
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Error al intentar eliminar.', position: 'top' });
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
/* Las 3 cards de resumen del mockup con fondo pastel degradado suave */
.card-resumen {
  border: 1px solid rgba(0,0,0,0.03);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card-resumen:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.05) !important;
}
.card-resumen-pagar { 
  background: linear-gradient(135deg, #fff5f5 0%, #ffe3e3 100%) !important; 
}
.card-resumen-cobrar { 
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%) !important; 
}
.card-resumen-liquidado { 
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important; 
}

.icon-box {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-box-pagar { background: #fee2e2; }
.icon-box-cobrar { background: #d1fae5; }
.icon-box-liquidado { background: #dbeafe; }

/* Indicador de punto de color redondo */
.dot-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

/* Buscador */
.search-bar {
  width: 180px;
}
.search-bar :deep(.q-field__control) {
  border-radius: 99px !important;
}

/* Botón negro del mockup */
.btn-dark {
  background: #18181b !important;
  color: white !important;
  border-radius: 8px !important;
  padding: 8px 16px;
}

/* Estructura limpia de tablas con cabecera en degradado */
.table-card {
  border: 1.5px solid #f1f5f9;
  overflow: hidden !important;
}
.table-pagar :deep(thead tr) {
  background: linear-gradient(135deg, #f43f5e 0%, #7c3aed 100%) !important;
}
.table-pagar :deep(thead th) {
  color: white !important;
  font-weight: 700 !important;
  font-size: 12px !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em;
  border-bottom: none !important;
}
.table-cobrar :deep(thead tr) {
  background: linear-gradient(135deg, #10b981 0%, #0ea5e9 100%) !important;
}
.table-cobrar :deep(thead th) {
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

/* Botones píldora de acción */
.btn-action-pill {
  border-radius: 8px !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  padding: 4px 12px !important;
  min-height: unset !important;
}

.rounded-chip {
  border-radius: 8px !important;
}

/* Diálogo modal */
.modal-sheet { width: 100%; max-width: 100%; border-radius: 24px 24px 0 0 !important; }
.modal-sheet-desktop { width: 520px; border-radius: 20px !important; }
.modal-header { padding: 20px 20px 16px; color: white; }
.drag-handle { width: 40px; height: 4px; background: rgba(255,255,255,0.4); border-radius: 2px; margin: 0 auto 16px; }
.modal-title { font-size: 20px; font-weight: 700; }
.modal-subtitle { font-size: 13px; opacity: 0.8; margin-top: 2px; }
.modal-close-btn { margin-top: -4px; }
.modal-body { padding: 20px; }
.modal-action-bar { display: flex; gap: 12px; padding: 16px 20px; border-top: 1px solid #f1f5f9; }
.btn-cancel { flex: 1; color: #64748b; border-radius: 10px; }
.btn-confirm { flex: 2; border-radius: 10px; }
</style>