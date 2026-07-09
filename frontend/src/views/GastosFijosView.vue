<template>
  <q-page class="q-pa-lg bg-grey-1">

    <!-- Encabezado -->
    <div class="row justify-between items-center q-mb-xl">
      <div>
        <h4 class="text-h4 text-weight-bold q-my-none text-primary font-heading">Gastos Fijos</h4>
        <p class="text-subtitle2 text-grey-6 q-my-none">Administra tus compromisos mensuales recurrentes.</p>
      </div>
      <q-btn
        color="primary"
        icon="add"
        label="Nuevo Fijo"
        class="text-white text-weight-bold q-px-md"
        style="background: linear-gradient(135deg,#6366f1,#4f46e5); border-radius:12px"
        no-caps
        @click="abrirModal()"
      />
    </div>

    <!-- Tarjeta resumen -->
    <div class="row q-col-gutter-lg q-mb-xl">
      <div class="col-12 col-sm-4">
        <q-card class="text-white shadow-hover card-premium" style="background: linear-gradient(135deg,#6366f1,#4f46e5); border-radius:20px">
          <q-card-section class="row justify-between items-center q-pa-lg">
            <div>
              <div class="text-subtitle2 text-uppercase text-weight-bolder opacity-80">Total Mensual Fijo</div>
              <div class="text-h3 text-weight-bold q-mt-sm">${{ totalMensual.toLocaleString() }}</div>
            </div>
            <q-avatar size="56px" style="background:rgba(255,255,255,0.15)">
              <q-icon name="repeat" size="32px" color="white" />
            </q-avatar>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-4">
        <q-card class="text-white shadow-hover card-premium" style="background: linear-gradient(135deg,#10b981,#059669); border-radius:20px">
          <q-card-section class="row justify-between items-center q-pa-lg">
            <div>
              <div class="text-subtitle2 text-uppercase text-weight-bolder opacity-80">Gastos Registrados</div>
              <div class="text-h3 text-weight-bold q-mt-sm">{{ gastosFijos.length }}</div>
            </div>
            <q-avatar size="56px" style="background:rgba(255,255,255,0.15)">
              <q-icon name="playlist_add_check" size="32px" color="white" />
            </q-avatar>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-4">
        <q-card class="shadow-hover card-premium" style="background:#fff; border-radius:20px; border: 2px dashed #6366f1">
          <q-card-section class="column items-center justify-center q-pa-lg text-center" style="height:100%">
            <q-icon name="flash_on" size="36px" color="primary" class="q-mb-sm" />
            <div class="text-weight-bold text-subtitle1" style="color:#4f46e5">Registrar este mes</div>
            <div class="text-caption text-grey-5 q-mb-md">Agrega todos tus fijos de un solo golpe</div>
            <q-btn
              label="⚡ Registrar Todos"
              no-caps
              unelevated
              class="text-white text-weight-bold"
              style="background: linear-gradient(135deg,#6366f1,#4f46e5); border-radius:10px"
              :loading="registrando"
              @click="registrarTodos"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Lista de gastos fijos -->
    <q-card class="shadow-hover" style="border-radius:16px">
      <q-card-section class="q-pa-none">
        <q-list separator>
          <q-item
            v-for="g in gastosFijos"
            :key="g._id"
            class="q-py-md gasto-item"
          >
            <q-item-section avatar>
              <q-avatar color="indigo-1" text-color="indigo-8" size="44px">
                <q-icon name="repeat" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-bold text-subtitle1" style="color:#1e293b">{{ g.nombre }}</q-item-label>
              <q-item-label caption class="row items-center q-gutter-x-xs">
                <q-chip dense color="indigo-1" text-color="indigo-8" class="text-caption text-weight-bold q-ma-none">
                  {{ g.categoria }}
                </q-chip>
                <span class="text-grey-5">· Día {{ g.diaPago }} de cada mes</span>
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="text-h6 text-weight-bolder text-negative q-mb-xs">-${{ g.monto.toLocaleString() }}</div>
              <div class="row q-gutter-xs justify-end">
                <q-btn icon="edit" color="primary" flat round dense size="sm" @click="abrirModal(g)">
                  <q-tooltip>Editar</q-tooltip>
                </q-btn>
                <q-btn icon="delete" color="negative" flat round dense size="sm" @click="confirmarEliminar(g._id)">
                  <q-tooltip>Eliminar</q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </q-item>

          <!-- Estado vacío -->
          <div v-if="gastosFijos.length === 0" class="q-pa-xl text-center text-grey-5">
            <q-icon name="repeat" size="64px" color="indigo-2" class="q-mb-md" />
            <div class="text-h6 text-weight-bold text-grey-6">Sin gastos fijos registrados</div>
            <div class="text-caption q-mt-xs">Agrega tu arriendo, celular, servicios y demás compromisos mensuales.</div>
          </div>
        </q-list>
      </q-card-section>
    </q-card>

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
            <q-input
              filled
              v-model="form.nombre"
              label="Nombre del gasto"
              placeholder="Ej: Arriendo, Celular, Netflix..."
              color="primary"
              lazy-rules
              :rules="[val => val && val.length > 0 || 'El nombre es obligatorio']"
            />
            <q-input
              filled
              v-model.number="form.monto"
              type="number"
              label="Monto mensual ($)"
              color="primary"
              lazy-rules
              :rules="[val => val && val > 0 || 'Ingresa un monto válido']"
            >
              <template v-slot:prepend>
                <span class="text-weight-bold text-grey-6">$</span>
              </template>
            </q-input>
            <q-select
              filled
              v-model="form.categoria"
              :options="categorias"
              label="Categoría"
              color="primary"
              lazy-rules
              :rules="[val => val && val.length > 0 || 'Selecciona una categoría']"
              popup-content-class="select-popup-premium"
            />
            <q-input
              filled
              v-model.number="form.diaPago"
              type="number"
              label="Día de pago (1 al 28)"
              color="primary"
              :rules="[val => val >= 1 && val <= 28 || 'Ingresa un día entre 1 y 28']"
            />
          </q-form>
        </div>

        <div class="modal-action-bar">
          <q-btn label="Cancelar" flat no-caps class="btn-cancel" v-close-popup />
          <q-btn
            :label="modoEdicion ? 'Actualizar' : 'Guardar Fijo'"
            no-caps
            class="btn-confirm text-white"
            style="background: linear-gradient(135deg,#6366f1,#4f46e5)"
            @click="submitForm"
          />
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

const $q = useQuasar();
const gastosFijos = ref([]);
const categorias = ref([]);
const modalAbierto = ref(false);
const modoEdicion = ref(false);
const editandoId = ref(null);
const registrando = ref(false);
const formGasto = ref(null);

const form = ref({
  nombre: '',
  monto: null,
  categoria: '',
  diaPago: 1
});

const totalMensual = computed(() =>
  gastosFijos.value.reduce((sum, g) => sum + g.monto, 0)
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

const abrirModal = (gasto = null) => {
  if (gasto) {
    modoEdicion.value = true;
    editandoId.value = gasto._id;
    form.value = {
      nombre: gasto.nombre,
      monto: gasto.monto,
      categoria: gasto.categoria,
      diaPago: gasto.diaPago
    };
  } else {
    modoEdicion.value = false;
    editandoId.value = null;
    form.value = { nombre: '', monto: null, categoria: '', diaPago: 1 };
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

const registrarTodos = async () => {
  $q.dialog({
    title: '⚡ Registrar Gastos Fijos',
    message: `Se registrarán ${gastosFijos.value.length} gastos por un total de $${totalMensual.value.toLocaleString()} como movimientos de este mes. ¿Confirmas?`,
    cancel: { color: 'grey-7', flat: true },
    ok: { color: 'primary', label: 'Sí, registrar todos' },
    persistent: true
  }).onOk(async () => {
    registrando.value = true;
    try {
      $q.loading.show({ message: 'Registrando gastos fijos del mes...' });
      const res = await gastoFijoService.registrarTodosEsteMes();
      if (res?.success) {
        $q.notify({ type: 'positive', message: res.msg, position: 'top' });
      }
    } catch (error) {
      $q.notify({
        type: 'warning',
        message: error.response?.data?.msg || 'Error al registrar.',
        position: 'top'
      });
    } finally {
      $q.loading.hide();
      registrando.value = false;
    }
  });
};

onMounted(() => {
  cargar();
  cargarCategorias();
});
</script>

<style scoped>
.card-premium { border-radius: 20px !important; border: none !important; }
.gasto-item { transition: background-color 0.2s ease; }
.gasto-item:hover { background-color: #f8fafc; }

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