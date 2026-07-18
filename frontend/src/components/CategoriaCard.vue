<template>
  <div
    class="cat-card"
    :class="{
      'cat-card--seleccionada': seleccionada,
      'cat-card--seleccion-mode': modoSeleccion
    }"
    @click="modoSeleccion ? $emit('toggle-seleccion', categoria._id) : null"
  >
    <!-- Checkbox selección -->
    <div v-if="modoSeleccion" class="cat-checkbox">
      <q-icon
        :name="seleccionada ? 'check_circle' : 'radio_button_unchecked'"
        :color="seleccionada ? 'primary' : 'grey-4'"
        size="20px"
      />
    </div>

    <!-- Badge tipo -->
    <div class="cat-badge" :class="categoria.tipo === 'ingreso' ? 'cat-badge--ingreso' : 'cat-badge--gasto'">
      {{ categoria.tipo === 'ingreso' ? 'Ingreso' : 'Gasto' }}
    </div>

    <!-- Emoji / Ícono grande -->
    <div class="cat-emoji" :style="{ background: categoria.color + '22', borderColor: categoria.color + '40' }">
      <span class="cat-emoji-text">{{ resolverEmoji(categoria.nombre, categoria.icono) }}</span>
    </div>

    <!-- Nombre -->
    <div class="cat-name">{{ categoria.nombre }}</div>

    <!-- Botón editar (solo categorías propias, fuera de modo selección) -->
    <q-btn
      v-if="!modoSeleccion && categoria.usuarioId"
      icon="edit"
      flat round dense
      color="primary"
      size="xs"
      class="cat-edit-btn"
      @click.stop="$emit('editar', categoria)"
    />

    <!-- Botón eliminar (solo categorías propias, fuera de modo selección) -->
    <q-btn
      v-if="!modoSeleccion && categoria.usuarioId"
      icon="delete"
      flat round dense
      color="negative"
      size="xs"
      class="cat-delete-btn"
      @click.stop="$emit('eliminar', categoria._id)"
    />

    <!-- Indicador: categoría del sistema (no eliminable) -->
    <q-icon
      v-if="!modoSeleccion && !categoria.usuarioId"
      name="lock"
      color="grey-4"
      size="14px"
      class="cat-lock-icon"
    >
      <q-tooltip>Categoría base del sistema</q-tooltip>
    </q-icon>
  </div>
</template>

<script setup>
import { useCategoryEmoji } from '../composables/useCategoryEmoji.js';

defineProps({
  categoria: {
    type: Object,
    required: true
  },
  modoSeleccion: {
    type: Boolean,
    default: false
  },
  seleccionada: {
    type: Boolean,
    default: false
  }
});

defineEmits(['toggle-seleccion', 'eliminar']);

const { resolverEmoji } = useCategoryEmoji();
</script>

<style scoped>
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
  user-select: none;
}

.cat-card--seleccion-mode {
  cursor: pointer;
}

.cat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
}

.cat-card--seleccionada {
  border-color: #6366f1 !important;
  background: #f5f7ff !important;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.12) !important;
}

/* Checkbox */
.cat-checkbox {
  position: absolute;
  top: 10px;
  left: 10px;
}

/* Badge tipo */
.cat-badge {
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 99px;
  letter-spacing: 0.05em;
}

.cat-badge--gasto {
  background: #fee2e2;
  color: #ef4444;
}

.cat-badge--ingreso {
  background: #d1fae5;
  color: #10b981;
}

/* Emoji grande */
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

/* Nombre */
.cat-name {
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
  text-align: center;
  line-height: 1.3;
  word-break: break-word;
}

/* Botones de acción */
.cat-delete-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.cat-edit-btn {
  position: absolute;
  top: 6px;
  right: 30px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.cat-card:hover .cat-delete-btn,
.cat-card:hover .cat-edit-btn {
  opacity: 1;
}

.cat-lock-icon {
  position: absolute;
  top: 10px;
  right: 10px;
}
</style>
