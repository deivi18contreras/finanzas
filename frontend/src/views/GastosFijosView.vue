<template>
  <q-page class="q-pa-lg bg-grey-1">

    <!-- Encabezado -->
    <div class="row justify-between items-center q-mb-xl">
      <div>
        <h4 class="text-h4 text-weight-bold q-my-none text-slate-800 font-heading">Gastos Fijos</h4>
      </div>
    </div>

    <!-- Tarjetas de Resumen en Estilo Pastel del Mockup -->
    <div class="row q-col-gutter-lg q-mb-xl">
      <!-- Tarjeta 1: Total Mensual (Morado/Índigo Pastel) -->
      <div class="col-12 col-sm-6">
        <q-card class="shadow-1 card-resumen card-resumen-pagar" style="border-radius: 16px;">
          <q-card-section class="row items-center q-pa-lg">
            <div class="icon-box icon-box-pagar q-mr-md">
              <q-icon name="o_repeat" size="28px" color="indigo-5" />
            </div>
            <div>
              <div class="text-subtitle2 text-grey-7 text-weight-bold">Total Mensual Fijo</div>
              <div class="text-h3 text-weight-bolder text-slate-900 q-my-xs">${{ totalMensual.toLocaleString() }}</div>
              <div class="text-caption text-grey-8 text-weight-medium">Presupuesto mensual comprometido</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Tarjeta 2: Gastos Registrados (Verde Pastel) -->
      <div class="col-12 col-sm-6">
        <q-card class="shadow-1 card-resumen card-resumen-cobrar" style="border-radius: 16px;">
          <q-card-section class="row items-center q-pa-lg">
            <div class="icon-box icon-box-cobrar q-mr-md">
              <q-icon name="o_playlist_add_check" size="28px" color="green-5" />
            </div>
            <div>
              <div class="text-subtitle2 text-grey-7 text-weight-bold">Compromisos Guardados</div>
              <div class="text-h3 text-weight-bolder text-slate-900 q-my-xs">{{ gastosFijos.length }}</div>
              <div class="text-caption text-grey-8 text-weight-medium">Gastos fijos activos</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Lista/Tabla de Gastos Fijos -->
    <div class="q-mb-xl">
      <div class="row items-center justify-between q-mb-md">
        <div>
          <div class="row items-center">
            <span class="dot-indicator bg-indigo-6 q-mr-sm"></span>
            <span class="text-h6 text-weight-bold text-slate-900 font-heading">Lista de Gastos Fijos</span>
          </div>
          <span class="text-caption text-grey-6 block q-ml-sm">Tus facturas y servicios mensuales</span>
        </div>
        <div class="row q-gutter-sm items-center">
          <q-input
            v-model="buscarGasto"
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
            label="Nuevo Fijo"
            class="btn-dark text-weight-bold"
            no-caps
            unelevated
            @click="abrirModal()"
          />
        </div>
      </div>

      <q-card class="shadow-1 table-card" style="border-radius: 12px;">
        <q-card-section class="q-pa-none">
          <q-table
            flat
            :rows="gastosFijosFiltrados"
            :columns="columnas"
            row-key="_id"
            :pagination="{ rowsPerPage: 10 }"
            class="table-premium-mock table-pagar"
            hide-bottom
          >
            <template v-slot:body-cell-nombre="props">
              <q-td :props="props" class="text-slate-800">
                <div class="row items-center">
                  <span class="dot-indicator bg-indigo-6 q-mr-sm"></span>
                  <div>
                    <div class="text-weight-bold" style="font-size:14px">{{ props.value }}</div>
                    <div class="row items-center q-gutter-x-xs q-mt-xs">
                      <q-chip dense color="indigo-1" text-color="indigo-8" class="text-caption text-weight-bold q-ma-none rounded-chip">
                        {{ props.row.categoria }}
                      </q-chip>
                      <q-chip v-if="props.row.deudaId" dense color="orange-1" text-color="orange-8" icon="link" class="text-caption q-ma-none rounded-chip">
                        Vinculado
                      </q-chip>
                    </div>
                  </div>
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-monto="props">
              <q-td :props="props" class="text-weight-bolder text-slate-900 font-heading" style="font-size:15px">
                -${{ props.value.toLocaleString() }}
              </q-td>
            </template>

            <template v-slot:body-cell-diaPago="props">
              <q-td :props="props" class="text-center text-grey-8 text-weight-medium">
                Día {{ props.value }}
              </q-td>
            </template>

            <template v-slot:body-cell-acciones="props">
              <q-td :props="props" class="text-center q-gutter-xs">
                <q-btn
                  label="Registrar"
                  color="positive"
                  unelevated
                  no-caps
                  class="btn-action-pill text-white"
                  @click="registrarUno(props.row)"
                />
                <q-btn
                  label="Ver"
                  color="grey-2"
                  text-color="slate-800"
                  unelevated
                  no-caps
                  class="btn-action-pill"
                  @click="abrirModal(props.row)"
                />
                <q-btn
                  label="Eliminar"
                  color="grey-2"
                  text-color="red-7"
                  unelevated
                  no-caps
                  class="btn-action-pill"
                  @click="confirmarEliminar(props.row._id)"
                />
              </q-td>
            </template>
          </q-table>

          <!-- Estado vacío -->
          <div v-if="gastosFijosFiltrados.length === 0" class="q-pa-xl text-center text-grey-5">
            <q-icon name="repeat" size="64px" color="indigo-2" class="q-mb-md" />
            <div class="text-h6 text-weight-bold text-grey-6">Sin gastos fijos registrados</div>
            <div class="text-caption q-mt-xs">Agrega tu arriendo, celular, servicios y demás compromisos mensuales.</div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Modal crear / editar -->
    <q-dialog v-model="modalAbierto" persistent :position="$q.screen.lt.md ? 'bottom' : 'standard'">
      <q-card :class="$q.screen.lt.md ? 'modal-sheet' : 'modal-sheet-desktop'">

        <div class="modal-header" style="background: linear-gradient(135deg,#6366f1,#4f46e5)">
          <div class="drag-handle"></div>
          <div class="row items-start">
            <div>
              <div class="modal-title">{{ modoEdicion ? '✏️ Editar Gasto Fijo' : '➕ Nuevo Gasto Fijo' }}</div>
              <div class="modal-subtitle">{{ modoEdicion ? 'Modifica los datos del gasto' : 'Agrega un compromiso mensual recurrente' }}</div>
            </div>
            <q-space />
            <q-btn icon="close" flat round dense color="white" class="modal-close-btn" v-close-popup />
          </div>
        </div>

        <div class="modal-body">
          <q-form ref="formGasto" class="q-gutter-y-sm">
            <q-input filled v-model="form.nombre" label="Nombre del gasto"
              placeholder="Ej: Arriendo, Celular, Netflix..." color="primary" lazy-rules
              :rules="[val => val && val.length > 0 || 'El nombre es obligatorio']" />
            <q-input filled v-model.number="form.monto" type="number" label="Monto mensual ($)" color="primary"
              lazy-rules :rules="[val => val && val > 0 || 'Ingresa un monto válido']">
              <template v-slot:prepend>
                <span class="text-weight-bold text-grey-6">$</span>
              </template>
            </q-input>
            <q-select filled v-model="form.categoria" :options="categorias" label="Categoría" color="primary" lazy-rules
              :rules="[val => val && val.length > 0 || 'Selecciona una categoría']"
              popup-content-class="select-popup-premium" />
            <q-input filled v-model.number="form.diaPago" type="number" label="Día de pago (1 al 28)" color="primary"
              :rules="[val => val >= 1 && val <= 28 || 'Ingresa un día entre 1 y 28']" />
            <q-select filled v-model="form.deudaId" :options="opcionesDeudas" label="🔗 Vincular a una deuda (opcional)"
              option-value="value" option-label="label" emit-value map-options clearable color="primary"
              hint="Al registrar este gasto, se abonará automáticamente a la deuda vinculada" />
          </q-form>
        </div>

        <div class="modal-action-bar">
          <q-btn label="Cancelar" flat no-caps class="btn-cancel" v-close-popup />
          <q-btn :label="modoEdicion ? 'Actualizar' : 'Guardar Fijo'" no-caps class="btn-confirm text-white"
            style="background: linear-gradient(135deg,#6366f1,#4f46e5)" @click="submitForm" />
        </div>

      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { gastoFijoService } from '../services/gastoFijoService.js';
import { categoriaService } from '../services/categoriaService.js';
import { deudaService } from '../services/deudaService.js';

const $q = useQuasar();
const gastosFijos = ref([]);
const categorias = ref([]);
const deudas = ref([]);
const modalAbierto = ref(false);
const modoEdicion = ref(false);
const editandoId = ref(null);
const formGasto = ref(null);
const buscarGasto = ref('');

const form = ref({
  nombre: '',
  monto: null,
  categoria: '',
  diaPago: 1,
  deudaId: null
});

const columnas = [
  { name: 'nombre', align: 'left', label: 'Compromiso / Nombre', field: 'nombre', sortable: true },
  { name: 'monto', align: 'right', label: 'Monto Mensual', field: 'monto', sortable: true },
  { name: 'diaPago', align: 'center', label: 'Día Pago', field: 'diaPago', sortable: true },
  { name: 'acciones', align: 'center', label: 'Acciones' }
];

const totalMensual = computed(() =>
  gastosFijos.value.reduce((sum, g) => sum + g.monto, 0)
);

const gastosFijosFiltrados = computed(() => {
  const query = buscarGasto.value.toLowerCase().trim();
  if (!query) return gastosFijos.value;
  return gastosFijos.value.filter(g =>
    g.nombre.toLowerCase().includes(query) || g.categoria.toLowerCase().includes(query)
  );
});

const opcionesDeudas = computed(() =>
  deudas.value
    .filter(d => d.estado === 'pendiente' && d.tipo === 'por_pagar')
    .map(d => ({
      label: `${d.contacto} — Saldo: $${(d.montoTotal - d.montoPagado).toLocaleString()}`,
      value: d._id
    }))
);

const cargar = async () => {
  try {
    const res = await gastoFijoService.obtener();
    if (res?.success) gastosFijos.value = res.gastosFijos || [];
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar gastos fijos.', position: 'top' });
  }
};

const cargarCategorias = async () => {
  try {
    const res = await categoriaService.obtener('gasto');
    if (res?.success) categorias.value = res.categorias.map(c => c.nombre);
  } catch {
    console.error('Error al cargar categorías');
  }
};

const cargarDeudas = async () => {
  try {
    const res = await deudaService.obtener();
    if (res?.success) deudas.value = res.deudas || [];
  } catch {
    console.error('Error al cargar deudas');
  }
};

const abrirModal = (gasto = null) => {
  if (gasto) {
    modoEdicion.value = true;
    editandoId.value = gasto._id;
    form.value = {
      nombre: gasto.nombre,
      monto: gasto.monto,
      categoria: gasto.categoria,
      diaPago: gasto.diaPago,
      deudaId: gasto.deudaId || null
    };
  } else {
    modoEdicion.value = false;
    editandoId.value = null;
    form.value = { nombre: '', monto: null, categoria: '', diaPago: 1, deudaId: null };
  }
  modalAbierto.value = true;
};

const submitForm = async () => {
  const valid = await formGasto.value?.validate();
  if (!valid) return;

  try {
    $q.loading.show({ message: modoEdicion.value ? 'Actualizando...' : 'Guardando...' });
    const res = modoEdicion.value
      ? await gastoFijoService.editar(editandoId.value, form.value)
      : await gastoFijoService.crear(form.value);

    if (res?.success) {
      modalAbierto.value = false;
      $q.notify({
        type: 'positive',
        message: modoEdicion.value ? 'Gasto fijo actualizado.' : 'Gasto fijo guardado correctamente.',
        position: 'top'
      });
      await cargar();
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.msg || 'Error al guardar.',
      position: 'top'
    });
  } finally {
    $q.loading.hide();
  }
};

const confirmarEliminar = (id) => {
  $q.dialog({
    title: 'Eliminar Gasto Fijo',
    message: '¿Estás seguro? Se eliminará de tu lista de fijos pero NO de tus movimientos anteriores.',
    cancel: { color: 'grey-7', flat: true },
    ok: { color: 'negative', label: 'Eliminar' },
    persistent: true
  }).onOk(async () => {
    try {
      $q.loading.show({ message: 'Eliminando...' });
      const res = await gastoFijoService.eliminar(id);
      if (res?.success) {
        $q.notify({ type: 'info', message: 'Gasto fijo eliminado.', position: 'top' });
        await cargar();
      }
    } catch {
      $q.notify({ type: 'negative', message: 'Error al eliminar.', position: 'top' });
    } finally {
      $q.loading.hide();
    }
  });
};

const registrarUno = (gasto) => {
  $q.dialog({
    title: '▶ Registrar Gasto Fijo',
    message: `¿Registrar "${gasto.nombre}" por $${gasto.monto.toLocaleString()} como movimiento de este mes?`,
    cancel: { color: 'grey-7', flat: true },
    ok: { color: 'positive', label: 'Sí, registrar' },
    persistent: true
  }).onOk(async () => {
    try {
      $q.loading.show({ message: 'Registrando...' });
      const res = await gastoFijoService.registrarUno(gasto._id);
      if (res?.success) {
        $q.notify({ type: 'positive', message: res.msg, position: 'top' });
        await cargarDeudas();
      }
    } catch (error) {
      $q.notify({
        type: 'warning',
        message: error.response?.data?.msg || 'Error al registrar.',
        position: 'top'
      });
    } finally {
      $q.loading.hide();
    }
  });
};

onMounted(() => {
  cargar();
  cargarCategorias();
  cargarDeudas();
});
</script>

<style scoped>
/* Las 2 cards de resumen con fondo pastel degradado suave */
.card-resumen {
  background: white !important;
  border: 1px solid rgba(0,0,0,0.03);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card-resumen:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.05) !important;
}
.card-resumen-pagar { 
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%) !important; /* Indigo pastel */
}
.card-resumen-cobrar { 
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%) !important; /* Verde pastel */
}

.icon-box {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-box-pagar { background: #e0e7ff; }
.icon-box-cobrar { background: #d1fae5; }

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

/* Botón negro */
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
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%) !important;
}
.table-pagar :deep(thead th) {
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
.modal-sheet-desktop { width: 480px; border-radius: 20px !important; }
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