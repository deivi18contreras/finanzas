<template>
  <q-page class="q-pa-lg bg-grey-1">

    <!-- Encabezado -->
    <div class="row justify-between items-center q-mb-xl">
      <div>
        <h4 class="text-h4 text-weight-bold q-my-none text-slate-800 font-heading">Bolsillos de Ahorro</h4>
        <p class="text-subtitle2 text-grey-6 q-my-none">Define tus metas de ahorro y aparta dinero para cumplirlas.</p>
      </div>
      <div>
        <q-btn
          color="black"
          icon="add"
          label="Nuevo Bolsillo"
          class="btn-dark text-weight-bold"
          no-caps
          unelevated
          @click="abrirModal"
        />
      </div>
    </div>

    <!-- Resumen de Ahorros con Estilo Pastel del Mockup -->
    <div class="row q-col-gutter-lg q-mb-xl">
      <!-- Tarjeta 1: Total Ahorrado (Morado Pastel) -->
      <div class="col-12 col-sm-6">
        <q-card class="shadow-1 card-resumen card-resumen-pagar" style="border-radius: 16px;">
          <q-card-section class="row items-center q-pa-lg">
            <div class="icon-box icon-box-pagar q-mr-md">
              <q-icon name="o_savings" size="28px" color="indigo-5" />
            </div>
            <div>
              <div class="text-subtitle2 text-grey-7 text-weight-bold">Total Ahorrado</div>
              <div class="text-h3 text-weight-bolder text-slate-900 q-my-xs">${{ totalAhorrado.toLocaleString() }}</div>
              <div class="text-caption text-grey-8 text-weight-medium">Dinero reservado en tus bolsillos</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Tarjeta 2: Bolsillos Activos (Verde Pastel) -->
      <div class="col-12 col-sm-6">
        <q-card class="shadow-1 card-resumen card-resumen-cobrar" style="border-radius: 16px;">
          <q-card-section class="row items-center q-pa-lg">
            <div class="icon-box icon-box-cobrar q-mr-md">
              <q-icon name="o_folder_special" size="28px" color="green-5" />
            </div>
            <div>
              <div class="text-subtitle2 text-grey-7 text-weight-bold">Bolsillos Activos</div>
              <div class="text-h3 text-weight-bolder text-slate-900 q-my-xs">{{ cajas.length }}</div>
              <div class="text-caption text-grey-8 text-weight-medium">Metas de ahorro creadas</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Grid de Bolsillos de Ahorro -->
    <div class="row q-col-gutter-lg">
      <div v-for="caja in cajas" :key="caja._id" class="col-12 col-sm-6 col-md-4">
        <q-card class="shadow-hover card-pocket" style="border-radius: 20px;">
          <q-card-section class="q-pa-lg">
            <div class="row justify-between items-center q-mb-md">
              <div class="text-subtitle1 text-weight-bold font-heading text-slate-900">
                🐷 {{ caja.nombre }}
              </div>
              <div class="row q-gutter-xs">
                <q-btn icon="o_edit" color="primary" flat round dense size="sm" @click="abrirEditar(caja)">
                  <q-tooltip>Editar Meta</q-tooltip>
                </q-btn>
                <q-btn icon="o_delete" color="negative" flat round dense size="sm" @click="confirmarEliminar(caja._id)">
                  <q-tooltip>Eliminar bolsillo</q-tooltip>
                </q-btn>
              </div>
            </div>

            <!-- Balance actual en este bolsillo -->
            <div class="q-mb-md">
              <div class="text-caption text-grey-7 text-uppercase text-weight-bold">Ahorrado</div>
              <div class="text-h4 text-weight-bolder text-indigo-9">${{ caja.montoAcumulado.toLocaleString() }}</div>
            </div>

            <!-- Meta e información de progreso -->
            <div v-if="caja.meta" class="q-mb-md">
              <div class="row justify-between text-caption text-grey-8 q-mb-xs">
                <span>Progreso</span>
                <span>Meta: <strong>${{ caja.meta.toLocaleString() }}</strong></span>
              </div>
              <q-linear-progress
                :value="caja.montoAcumulado / caja.meta"
                color="indigo"
                size="10px"
                style="border-radius:5px"
                class="bg-indigo-1"
              />
              <div class="text-caption text-grey-8 q-mt-xs text-right text-weight-medium">
                {{ Math.min(100, Math.round((caja.montoAcumulado / caja.meta) * 100)) }}% completado
              </div>
            </div>

            <!-- Botones de Acción rápida al estilo Mockup (Píldoras) -->
            <div class="row q-gutter-sm q-mt-md justify-between">
              <q-btn
                label="Aportar"
                color="positive"
                unelevated
                class="col btn-action-pill text-white"
                no-caps
                @click="abrirAportar(caja)"
              />
              <q-btn
                label="Retirar"
                color="warning"
                unelevated
                class="col btn-action-pill text-white"
                no-caps
                @click="abrirRetirar(caja)"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Estado vacío -->
      <div v-if="cajas.length === 0" class="col-12 text-center q-py-xl text-grey-5">
        <q-avatar size="80px" color="indigo-50" class="q-mb-md">
          <q-icon name="o_savings" size="48px" color="primary" />
        </q-avatar>
        <div class="text-h6 text-weight-bold text-grey-6">No tienes bolsillos de ahorro</div>
        <div class="text-caption text-grey-5 q-mt-xs">Crea tu primer bolsillo para apartar dinero de tus gastos.</div>
      </div>
    </div>

    <!-- Modal: Configurar Nuevo/Editar Bolsillo -->
    <q-dialog v-model="modalAbierto" persistent :position="$q.screen.lt.md ? 'bottom' : 'standard'">
      <q-card :class="$q.screen.lt.md ? 'modal-sheet' : 'modal-sheet-desktop'">

        <div class="modal-header" style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)">
          <div class="drag-handle"></div>
          <div class="row items-start">
            <div>
              <div class="modal-title">🐷 {{ modoEdicion ? '✏️ Editar Bolsillo' : '➕ Nuevo Bolsillo de Ahorro' }}</div>
              <div class="modal-subtitle">Aparta dinero de tus ingresos y fíjate una meta</div>
            </div>
            <q-space />
            <q-btn icon="close" flat round dense color="white" class="modal-close-btn" v-close-popup />
          </div>
        </div>

        <div class="modal-body">
          <q-form ref="formCaja" class="q-gutter-y-sm">
            <q-input
              filled
              v-model="form.nombre"
              label="Nombre del bolsillo"
              placeholder="Ej: Viaje a la playa, Fondo de Emergencias, Consola..."
              color="primary"
              lazy-rules
              :rules="[val => val && val.length > 0 || 'El nombre es obligatorio']"
            />
            <q-input
              filled
              v-model.number="form.meta"
              type="number"
              label="Meta de ahorro opcional ($)"
              color="primary"
            >
              <template v-slot:prepend>
                <span class="text-weight-bold text-grey-6">$</span>
              </template>
            </q-input>
          </q-form>
        </div>

        <div class="modal-action-bar">
          <q-btn label="Cancelar" flat no-caps class="btn-cancel" v-close-popup />
          <q-btn
            :label="modoEdicion ? 'Actualizar Bolsillo' : 'Crear Bolsillo'"
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
import { ahorroService } from '../services/ahorroService.js';

import { formatMonto } from '../utils/formatters.js';

const $q = useQuasar();
const cajas = ref([]);
const modalAbierto = ref(false);
const modoEdicion = ref(false);
const editandoId = ref(null);
const formCaja = ref(null);

const form = ref({
  nombre: '',
  meta: null
});

const totalAhorrado = computed(() =>
  cajas.value.reduce((sum, c) => sum + c.montoAcumulado, 0)
);

const cargarData = async () => {
  try {
    const res = await ahorroService.obtener();
    if (res?.success) cajas.value = res.cajas || [];
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar bolsillos de ahorro.', position: 'top' });
  }
};

const abrirModal = () => {
  modoEdicion.value = false;
  editandoId.value = null;
  form.value = { nombre: '', meta: null };
  modalAbierto.value = true;
};

const abrirEditar = (caja) => {
  modoEdicion.value = true;
  editandoId.value = caja._id;
  form.value = {
    nombre: caja.nombre,
    meta: caja.meta
  };
  modalAbierto.value = true;
};

const submitForm = async () => {
  const valid = await formCaja.value?.validate();
  if (!valid) return;

  try {
    $q.loading.show({ message: modoEdicion.value ? 'Actualizando bolsillo...' : 'Creando bolsillo...' });
    const res = modoEdicion.value
      ? await ahorroService.editar(editandoId.value, form.value)
      : await ahorroService.crear(form.value);

    if (res?.success) {
      modalAbierto.value = false;
      $q.notify({
        type: 'positive',
        message: modoEdicion.value ? 'Bolsillo actualizado correctamente.' : 'Bolsillo creado correctamente.',
        position: 'top'
      });
      await cargarData();
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

const abrirAportar = (caja) => {
  const metaFaltante = caja.meta ? Math.max(0, caja.meta - caja.montoAcumulado) : '';
  $q.dialog({
    title: '➕ Aportar a Ahorros',
    message: `¿Cuánto dinero de tu saldo disponible quieres ingresar al bolsillo "${caja.nombre}"?`,
    prompt: {
      model: metaFaltante.toString(),
      type: 'number'
    },
    cancel: { color: 'grey-7', flat: true },
    ok: { color: 'positive', label: 'Realizar Aporte' },
    persistent: true
  }).onOk(async (val) => {
    const monto = parseInt(val);
    if (isNaN(monto) || monto <= 0) {
      $q.notify({ type: 'warning', message: 'Monto inválido.', position: 'top' });
      return;
    }

    try {
      $q.loading.show({ message: 'Procesando aporte...' });
      const res = await ahorroService.aportar(caja._id, monto);
      if (res?.success) {
        $q.notify({ type: 'positive', message: res.msg, position: 'top' });
        await cargarData();
      }
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.response?.data?.msg || 'Error al procesar el aporte.',
        position: 'top'
      });
    } finally {
      $q.loading.hide();
    }
  });
};

const abrirRetirar = (caja) => {
  $q.dialog({
    title: '➖ Retirar de Ahorros',
    message: `¿Cuánto dinero quieres retirar del bolsillo "${caja.nombre}"? (Máximo: $${caja.montoAcumulado.toLocaleString()})`,
    prompt: {
      model: caja.montoAcumulado.toString(),
      type: 'number'
    },
    cancel: { color: 'grey-7', flat: true },
    ok: { color: 'warning', label: 'Retirar Fondos' },
    persistent: true
  }).onOk(async (val) => {
    const monto = parseInt(val);
    if (isNaN(monto) || monto <= 0 || monto > caja.montoAcumulado) {
      $q.notify({ type: 'warning', message: 'Monto inválido o excede tus ahorros.', position: 'top' });
      return;
    }

    try {
      $q.loading.show({ message: 'Procesando retiro...' });
      const res = await ahorroService.retirar(caja._id, monto);
      if (res?.success) {
        $q.notify({ type: 'positive', message: res.msg, position: 'top' });
        await cargarData();
      }
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.response?.data?.msg || 'Error al procesar el retiro.',
        position: 'top'
      });
    } finally {
      $q.loading.hide();
    }
  });
};

const confirmarEliminar = (id) => {
  $q.dialog({
    title: 'Eliminar Bolsillo',
    message: '¿Estás seguro de que deseas eliminar este bolsillo de ahorro? No se alterarán los movimientos que hayas realizado.',
    cancel: { color: 'grey-7', flat: true },
    ok: { color: 'negative', label: 'Eliminar' },
    persistent: true
  }).onOk(async () => {
    try {
      $q.loading.show({ message: 'Eliminando...' });
      const res = await ahorroService.eliminar(id);
      if (res?.success) {
        $q.notify({ type: 'info', message: 'Bolsillo eliminado correctamente.', position: 'top' });
        await cargarData();
      }
    } catch {
      $q.notify({ type: 'negative', message: 'Error al eliminar.', position: 'top' });
    } finally {
      $q.loading.hide();
    }
  });
};

onMounted(() => {
  cargarData();
});
</script>

<style scoped>
/* Las cards de resumen con fondo pastel degradado suave */
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

/* Tarjetas de bolsillos en estilo premium */
.card-pocket {
  background: white !important;
  border: 1.5px solid #f1f5f9;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card-pocket:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.06) !important;
}

/* Botón negro */
.btn-dark {
  background: #18181b !important;
  color: white !important;
  border-radius: 8px !important;
  padding: 8px 16px;
}

/* Botones píldora de acción */
.btn-action-pill {
  border-radius: 8px !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  padding: 8px 16px !important;
  min-height: unset !important;
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
