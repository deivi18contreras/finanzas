<template>
  <q-page class="q-pa-md bg-grey-1">

    <!-- ─── HEADER ─── -->
    <div class="row justify-between items-center q-mb-lg">
      <div>
        <h4 class="text-h5 text-weight-bold q-my-none text-primary font-heading">Categorías</h4>
        <p class="text-caption text-grey-6 q-my-none">Organiza tus ingresos y gastos en categorías.</p>
      </div>
      <div class="row q-gutter-sm">
        <!-- Botón eliminar seleccionadas (aparece en modo selección) -->
        <q-btn
          v-if="modoSeleccion && seleccionadas.length > 0"
          icon="delete_sweep"
          :label="`Eliminar (${seleccionadas.length})`"
          color="negative"
          unelevated
          no-caps
          class="text-weight-bold"
          @click="confirmarEliminarMultiple"
        />
        <q-btn
          :icon="modoSeleccion ? 'close' : 'checklist'"
          :label="modoSeleccion ? 'Cancelar' : 'Seleccionar'"
          :color="modoSeleccion ? 'grey-7' : 'indigo-7'"
          flat
          no-caps
          class="text-weight-bold"
          @click="toggleModoSeleccion"
        />
        <q-btn
          icon="add"
          label="Nueva"
          class="bg-gradient-primary text-white text-weight-bold"
          no-caps
          unelevated
          @click="abrirModal"
        />
      </div>
    </div>

    <!-- ─── TABS tipo/filtro ─── -->
    <div class="row q-gutter-sm q-mb-lg">
      <q-chip
        v-for="tab in ['todas', 'gasto', 'ingreso']"
        :key="tab"
        clickable
        :color="filtroTipo === tab ? 'primary' : 'white'"
        :text-color="filtroTipo === tab ? 'white' : 'grey-7'"
        class="text-weight-bold text-capitalize"
        :class="filtroTipo === tab ? '' : 'border-chip'"
        @click="filtroTipo = tab"
      >
        {{ tab === 'todas' ? '🗂️ Todas' : tab === 'gasto' ? '🔴 Gastos' : '🟢 Ingresos' }}
      </q-chip>

      <!-- Seleccionar todo (modo selección) -->
      <q-chip
        v-if="modoSeleccion"
        clickable
        color="indigo-1"
        text-color="indigo-8"
        class="text-weight-bold"
        icon="select_all"
        @click="seleccionarTodo"
      >
        Seleccionar todo
      </q-chip>
    </div>

    <!-- ─── GRID DE TARJETAS ─── -->
    <div class="categoria-grid">
      <CategoriaCard
        v-for="cat in categoriasFiltradas"
        :key="cat._id"
        :categoria="cat"
        :modo-seleccion="modoSeleccion"
        :seleccionada="seleccionadas.includes(cat._id)"
        @toggle-seleccion="toggleSeleccion"
        @eliminar="eliminarCategoria"
      />

      <!-- Estado vacío -->
      <div v-if="categoriasFiltradas.length === 0" class="col-12 text-center q-py-xl cat-empty">
        <div style="font-size:48px">🗂️</div>
        <div class="text-subtitle1 text-weight-bold text-grey-6 q-mt-sm">No hay categorías</div>
        <div class="text-caption text-grey-5">Crea una nueva categoría para comenzar</div>
      </div>
    </div>

    <!-- ─── MODAL: Nueva Categoría (bottom sheet en móvil) ─── -->
    <q-dialog
      v-model="modalCategoria"
      persistent
      :position="$q.screen.lt.md ? 'bottom' : 'standard'"
    >
      <q-card :class="$q.screen.lt.md ? 'modal-sheet' : 'modal-sheet-desktop'">

        <div
          class="modal-header"
          :style="nuevaCategoria.tipo === 'ingreso'
            ? 'background: linear-gradient(135deg, #10b981 0%, #059669 100%)'
            : 'background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'"
        >
          <div class="drag-handle"></div>
          <div class="row items-start">
            <div>
              <div class="modal-title">
                {{ emojiPreview }} Nueva Categoría
              </div>
              <div class="modal-subtitle">Se asigna un emoji automáticamente</div>
            </div>
            <q-space />
            <q-btn icon="close" flat round dense color="white" class="modal-close-btn" v-close-popup />
          </div>
        </div>

        <div class="modal-body">
          <q-form ref="formCategoria" class="q-gutter-y-sm">

            <!-- Pill toggle tipo -->
            <div>
              <div class="text-caption text-grey-6 text-weight-bold q-mb-xs" style="letter-spacing:0.05em">TIPO</div>
              <div class="type-toggle">
                <div class="type-pill" :class="nuevaCategoria.tipo === 'ingreso' ? 'active-ingreso' : ''" @click="nuevaCategoria.tipo = 'ingreso'">↑ Ingreso</div>
                <div class="type-pill" :class="nuevaCategoria.tipo === 'gasto' ? 'active-gasto' : ''" @click="nuevaCategoria.tipo = 'gasto'">↓ Gasto</div>
              </div>
            </div>

            <!-- Preview emoji en tiempo real -->
            <div class="emoji-preview-row">
              <div class="emoji-preview-box">
                <span style="font-size: 32px">{{ emojiPreview }}</span>
              </div>
              <div class="text-caption text-grey-5 q-ml-sm">
                Emoji asignado automáticamente según el nombre
              </div>
            </div>

            <q-input
              filled
              v-model="nuevaCategoria.nombre"
              label="Nombre de la categoría"
              color="primary"
              lazy-rules
              :rules="[val => val && val.length > 0 || 'El nombre es obligatorio']"
              @update:model-value="actualizarEmoji"
            />

          </q-form>
        </div>

        <div class="modal-action-bar">
          <q-btn label="Cancelar" flat no-caps class="btn-cancel" v-close-popup />
          <q-btn
            label="Guardar"
            no-caps
            class="btn-confirm text-white"
            :style="nuevaCategoria.tipo === 'ingreso'
              ? 'background: linear-gradient(135deg,#10b981,#059669)'
              : 'background: linear-gradient(135deg,#6366f1,#4f46e5)'"
            @click="submitCategoria"
          />
        </div>

      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { categoriaService } from '../services/categoriaService.js';
import CategoriaCard from '../components/CategoriaCard.vue';

import { useCategoryEmoji } from '../composables/useCategoryEmoji.js';

const $q = useQuasar();
const modalCategoria = ref(false);
const formCategoria = ref(null);
const modoSeleccion = ref(false);
const seleccionadas = ref([]);
const filtroTipo = ref('todas');
const emojiPreview = ref('🏷️');

const nuevaCategoria = ref({ nombre: '', tipo: 'gasto' });
const categorias = ref([]);

const { resolverEmoji } = useCategoryEmoji();


// ─── Filtrado de categorías ───
const categoriasFiltradas = computed(() => {
  if (filtroTipo.value === 'todas') return categorias.value;
  return categorias.value.filter(c => c.tipo === filtroTipo.value);
});

// ─── Modo selección ───
const toggleModoSeleccion = () => {
  modoSeleccion.value = !modoSeleccion.value;
  seleccionadas.value = [];
};

const toggleSeleccion = (id) => {
  const idx = seleccionadas.value.indexOf(id);
  if (idx === -1) seleccionadas.value.push(id);
  else seleccionadas.value.splice(idx, 1);
};

const seleccionarTodo = () => {
  const ids = categoriasFiltradas.value
    .filter(c => c.usuarioId) // solo las que se pueden eliminar
    .map(c => c._id);
  seleccionadas.value = ids;
};

// ─── CRUD ───
const cargarCategorias = async () => {
  try {
    const [resGastos, resIngresos] = await Promise.all([
      categoriaService.obtener('gasto'),
      categoriaService.obtener('ingreso')
    ]);
    let lista = [];
    if (resGastos?.success)   lista = lista.concat(resGastos.categorias);
    if (resIngresos?.success) lista = lista.concat(resIngresos.categorias);
    categorias.value = lista;
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al cargar categorías.', position: 'top' });
  }
};

const abrirModal = () => {
  nuevaCategoria.value = { nombre: '', tipo: 'gasto' };
  emojiPreview.value = '💸';
  modalCategoria.value = true;
};

const submitCategoria = async () => {
  const valid = await formCategoria.value?.validate();
  if (!valid) return;
  await guardarCategoria();
};
const guardarCategoria = async () => {
  try {
    $q.loading.show({ message: 'Guardando...' });
    const emoji = resolverEmoji(nuevaCategoria.value.nombre);
    const res = await categoriaService.crear({
      ...nuevaCategoria.value,
      icono: emoji,
      color: nuevaCategoria.value.tipo === 'ingreso' ? '#10b981' : '#6366f1'
    });
    if (res?.success) {
      modalCategoria.value = false;
      $q.notify({ type: 'positive', message: 'Categoría creada.', position: 'top' });
      await cargarCategorias();
    }
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.msg || 'Error al crear.', position: 'top' });
  } finally {
    $q.loading.hide();
  }
};

const eliminarCategoria = async (id) => {
  $q.dialog({
    title: 'Eliminar Categoría',
    message: '¿Estás seguro?',
    cancel: { color: 'grey-7', flat: true },
    ok: { color: 'negative', label: 'Eliminar' },
    persistent: true
  }).onOk(async () => {
    try {
      $q.loading.show({ message: 'Eliminando...' });
      await categoriaService.eliminar(id);
      $q.notify({ type: 'info', message: 'Categoría eliminada.', position: 'top' });
      await cargarCategorias();
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Error al eliminar.', position: 'top' });
    } finally {
      $q.loading.hide();
    }
  });
};

const confirmarEliminarMultiple = () => {
  // Filtrar cuáles son del sistema y cuáles propias
  const seleccionadasCategorias = categorias.value.filter(c => seleccionadas.value.includes(c._id));
  const delSistema = seleccionadasCategorias.filter(c => !c.usuarioId);
  const propias = seleccionadasCategorias.filter(c => c.usuarioId);

  if (propias.length === 0) {
    $q.dialog({
      title: 'Categorías del Sistema',
      message: 'Las categorías del sistema son necesarias para el funcionamiento de la aplicación y no se pueden eliminar.',
      ok: { color: 'primary', label: 'Entendido' },
      persistent: true
    });
    return;
  }

  let mensaje = `¿Estás seguro de que deseas eliminar las ${propias.length} categorías seleccionadas? Esta acción no se puede deshacer.`;
  if (delSistema.length > 0) {
    mensaje = `De las categorías seleccionadas, ${delSistema.length} son del sistema y no se pueden eliminar. ¿Deseas eliminar únicamente las ${propias.length} categorías creadas por ti?`;
  }

  $q.dialog({
    title: `Confirmar Eliminación`,
    message: mensaje,
    cancel: { color: 'grey-7', flat: true },
    ok: { color: 'negative', label: `Eliminar ${propias.length}` },
    persistent: true
  }).onOk(async () => {
    try {
      $q.loading.show({ message: 'Eliminando categorías...' });
      let eliminadas = 0;
      for (const cat of propias) {
        try {
          await categoriaService.eliminar(cat._id);
          eliminadas++;
        } catch (e) {
          console.error(e);
        }
      }
      $q.notify({
        type: 'positive',
        message: `${eliminadas} categoría(s) eliminada(s) correctamente.`,
        position: 'top'
      });
      seleccionadas.value = [];
      modoSeleccion.value = false;
      await cargarCategorias();
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Error durante la eliminación.', position: 'top' });
    } finally {
      $q.loading.hide();
    }
  });
};

const actualizarEmoji = (val) => {
  emojiPreview.value = resolverEmoji(val);
};

onMounted(() => { cargarCategorias(); });
</script>

<style scoped>
/* ─── Grid de tarjetas ─── */
.categoria-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 12px;
}

@media (min-width: 768px) {
  .categoria-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
  }
}

/* ─── Tarjeta individual ─── */
.cat-card {
  position: relative;
  background: #ffffff;
  border-radius: 20px;
  padding: 20px 14px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border: 1.5px solid #f1f5f9;
  transition: all 0.22s cubic-bezier(0.16,1,0.3,1);
  cursor: default;
  min-height: 130px;
}

.cat-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.cat-card--seleccion-mode {
  cursor: pointer;
}

.cat-card--seleccionada {
  border-color: #6366f1;
  background: #eef2ff;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
}

/* ─── Emoji grande ─── */
.cat-emoji {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid;
}

.cat-emoji-text {
  font-size: 32px;
  line-height: 1;
}

/* ─── Nombre ─── */
.cat-name {
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
  text-align: center;
  line-height: 1.3;
  word-break: break-word;
}

/* ─── Badge tipo ─── */
.cat-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 999px;
}

.cat-badge--gasto {
  background: #fee2e2;
  color: #dc2626;
}

.cat-badge--ingreso {
  background: #d1fae5;
  color: #059669;
}

/* ─── Botón eliminar ─── */
.cat-delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.cat-card:hover .cat-delete-btn {
  opacity: 1;
}

/* ─── Candado del sistema ─── */
.cat-lock-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  opacity: 0.4;
}

/* ─── Checkbox selección ─── */
.cat-checkbox {
  position: absolute;
  top: 8px;
  right: 8px;
}

/* ─── Estado vacío ─── */
.cat-empty {
  grid-column: 1 / -1;
  padding: 48px 0;
}

/* ─── Preview emoji en modal ─── */
.emoji-preview-row {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border-radius: 12px;
  padding: 10px 14px;
}

.emoji-preview-box {
  width: 48px;
  height: 48px;
  background: #e0e7ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ─── Chip de filtro sin seleccionar ─── */
.border-chip {
  border: 1.5px solid #e2e8f0 !important;
}
</style>