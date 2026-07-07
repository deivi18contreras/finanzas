<template>
  <q-page class="q-pa-lg bg-grey-1">
    <div class="row justify-between items-center q-mb-xl">
      <div>
        <h4 class="text-h4 text-weight-bold q-my-none text-primary font-heading">Control</h4>
        <p class="text-subtitle2 text-grey-6 q-my-none">Establece límites de gastos y escanea tus facturas físicas.</p>
      </div>
      <div class="q-gutter-sm">
        <q-btn color="secondary" icon="document_scanner" label="Escanear Recibo" class="bg-gradient-secondary text-white text-weight-bold" no-caps @click="abrirOcr" />
        <q-btn color="primary" icon="add" label="Asignar Tope" class="bg-gradient-primary text-white text-weight-bold" no-caps @click="abrirPresupuesto" />
      </div>
    </div>

    <!-- Tarjetas de progreso -->
    <div class="row q-col-gutter-lg">
      <div v-for="p in presupuestos" :key="p.id" class="col-12 col-sm-6 col-md-4">
        <q-card class="shadow-hover bg-white" style="border-radius:20px">
          <q-card-section class="q-pa-lg">
            <div class="row justify-between items-center q-mb-md">
              <div class="text-subtitle1 text-weight-bold font-heading" style="color:#1e293b">{{ p.categoria }}</div>
              <q-btn icon="delete" color="negative" flat round dense size="sm" @click="confirmarEliminarPresupuesto(p.id)">
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </div>
            <div class="row justify-between text-caption text-grey-7 q-mb-xs">
              <span>Consumido: <strong style="color:#1e293b">${{ p.consumido.toLocaleString() }}</strong></span>
              <span>Límite: <strong style="color:#1e293b">${{ p.limite.toLocaleString() }}</strong></span>
            </div>
            <q-linear-progress
              :value="p.limite > 0 ? (p.consumido / p.limite) : 0"
              :color="p.consumido > p.limite ? 'negative' : 'primary'"
              size="12px" style="border-radius:6px"
            />
            <div v-if="p.consumido > p.limite" class="text-caption text-negative text-weight-bolder q-mt-sm row items-center">
              <q-icon name="warning" size="14px" class="q-mr-xs" />¡Has superado el límite!
            </div>
            <div v-else class="text-caption text-grey-5 q-mt-sm">
              Quedan ${{ Math.max(0, p.limite - p.consumido).toLocaleString() }} disponibles
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div v-if="presupuestos.length === 0" class="col-12 text-center q-py-xl text-grey-5">
        <q-avatar size="80px" color="indigo-50" class="q-mb-md">
          <q-icon name="donut_large" size="48px" color="primary" />
        </q-avatar>
        <div class="text-h6 text-weight-bold">Sin presupuestos activos</div>
        <div class="text-caption text-grey-6 q-mt-xs">Crea un presupuesto para monitorear tus topes de gastos.</div>
      </div>
    </div>

    <!-- Modal: Configurar Límite (bottom en móvil, centrado en desktop) -->
    <q-dialog v-model="modalPresupuesto" persistent :position="$q.screen.lt.md ? 'bottom' : 'standard'">
      <q-card :class="$q.screen.lt.md ? 'modal-sheet' : 'modal-sheet-desktop'">

        <div class="modal-header" style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)">
          <div class="drag-handle"></div>
          <div class="row items-start">
            <div>
              <div class="modal-title">🎯 Configurar Límite</div>
              <div class="modal-subtitle">Fija un tope de gasto para esta categoría</div>
            </div>
            <q-space />
            <q-btn icon="close" flat round dense color="white" class="modal-close-btn" v-close-popup />
          </div>
        </div>

        <div class="modal-body">
          <q-form ref="formPresupuesto" class="q-gutter-y-sm">
            <q-select
              filled
              v-model="nuevoPresupuesto.categoria"
              :options="categoriasGasto"
              label="Selecciona Categoría"
              color="primary"
              lazy-rules
              :rules="[val => val && val.length > 0 || 'Selecciona una categoría']"
              popup-content-class="select-popup-premium"
            >
              <!-- Slot de opción seleccionada -->
              <template v-slot:selected-item="scope">
                <div class="row items-center q-gutter-x-sm">
                  <span>{{ resolverEmojiPorNombre(scope.opt) }}</span>
                  <span class="text-weight-bold" style="color:#1e293b">{{ scope.opt }}</span>
                </div>
              </template>

              <!-- Slot de opciones en lista desplegable -->
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar style="min-width:32px">
                    <span style="font-size:20px">{{ resolverEmojiPorNombre(scope.opt) }}</span>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold" style="color:#1e293b">{{ scope.opt }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <q-input
              filled
              v-model.number="nuevoPresupuesto.montoLimite"
              type="number"
              label="Monto Límite ($)"
              color="primary"
              lazy-rules
              :rules="[val => val && val > 0 || 'Ingresa un monto válido']"
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
            label="Fijar Presupuesto"
            no-caps
            class="btn-confirm text-white"
            style="background: linear-gradient(135deg,#6366f1,#4f46e5)"
            @click="submitPresupuesto"
          />
        </div>

      </q-card>
    </q-dialog>

    <!-- Modal: OCR Scanner (bottom en móvil, centrado en desktop) -->
    <q-dialog v-model="modalOcr" persistent :position="$q.screen.lt.md ? 'bottom' : 'standard'">
      <q-card :class="$q.screen.lt.md ? 'modal-sheet' : 'modal-sheet-desktop'">

        <div class="modal-header" style="background: linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)">
          <div class="drag-handle"></div>
          <div class="row items-start">
            <div>
              <div class="modal-title">🤖 Escanear Recibo con IA</div>
              <div class="modal-subtitle">Extrae datos automáticamente de tu factura</div>
            </div>
            <q-space />
            <q-btn icon="close" flat round dense color="white" class="modal-close-btn" v-close-popup />
          </div>
        </div>

        <div class="modal-body">
          <!-- Imagen seleccionada: preview del nombre -->
          <div v-if="archivoImagen" class="ocr-file-selected q-mb-md">
            <q-icon name="check_circle" color="positive" size="28px" />
            <div class="q-ml-sm">
              <div class="text-weight-bold text-caption" style="color:#1e293b">{{ archivoImagen.name }}</div>
              <div class="text-caption text-grey-5">Listo para procesar</div>
            </div>
            <q-btn icon="close" flat round dense size="xs" color="grey-5" class="q-ml-auto" @click="archivoImagen = null" />
          </div>

          <!-- Sin imagen: botones de cámara / galería -->
          <div v-else class="q-gutter-sm q-mb-md">

            <!-- Botón cámara (solo en móvil) -->
            <div
              v-if="$q.screen.lt.md"
              class="ocr-option-btn"
              @click="triggerCamera"
            >
              <div class="ocr-option-icon" style="background:#d1fae5">
                <q-icon name="photo_camera" color="positive" size="28px" />
              </div>
              <div>
                <div class="text-weight-bold text-body2" style="color:#1e293b">Tomar Foto</div>
                <div class="text-caption text-grey-5">Abre la cámara directamente</div>
              </div>
            </div>

            <!-- Botón galería (siempre visible) -->
            <div class="ocr-option-btn" @click="triggerGallery">
              <div class="ocr-option-icon" style="background:#e0e7ff">
                <q-icon name="photo_library" color="primary" size="28px" />
              </div>
              <div>
                <div class="text-weight-bold text-body2" style="color:#1e293b">Desde Galería</div>
                <div class="text-caption text-grey-5">Selecciona una imagen guardada</div>
              </div>
            </div>

          </div>

          <!-- Inputs ocultos -->
          <!-- Input cámara nativa (capture) -->
          <input
            ref="cameraInputRef"
            type="file"
            accept="image/*"
            capture="environment"
            style="display:none"
            @change="onFileChange"
          />
          <!-- Input galería -->
          <input
            ref="galleryInputRef"
            type="file"
            accept=".jpg,.jpeg,.png"
            style="display:none"
            @change="onFileChange"
          />

          <p class="text-caption text-grey-5 text-center q-mb-none">
            La IA extraerá automáticamente el comercio, monto y categoría del recibo.
          </p>
        </div>

        <div class="modal-action-bar">
          <q-btn label="Cancelar" flat no-caps class="btn-cancel" v-close-popup />
          <q-btn
            label="Procesar con IA"
            icon="psychology"
            no-caps
            class="btn-confirm text-white"
            style="background: linear-gradient(135deg,#10b981,#0ea5e9)"
            :loading="procesando"
            @click="escanearDocumento"
          />
        </div>

      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { presupuestoService } from '../services/presupuestoService.js';
import { categoriaService } from '../services/categoriaService.js';
import { ocrService } from '../services/ocrService.js';
import { transaccionService } from '../services/transaccionService.js';

const $q = useQuasar();
const modalPresupuesto = ref(false);
const modalOcr = ref(false);
const procesando = ref(false);
const archivoImagen = ref(null);
const cameraInputRef = ref(null);
const galleryInputRef = ref(null);
const formPresupuesto = ref(null);

const nuevoPresupuesto = ref({ categoria: '', montoLimite: null });
const presupuestos = ref([]);
const categoriasGasto = ref([]);

const triggerCamera = () => cameraInputRef.value?.click();
const triggerGallery = () => galleryInputRef.value?.click();

const onFileChange = (event) => {
  const file = event.target.files?.[0];
  if (file) archivoImagen.value = file;
  // Resetear el input para poder seleccionar el mismo archivo de nuevo
  event.target.value = '';
};

const cargarPresupuestos = async () => {
  try {
    const hoy = new Date();
    const res = await presupuestoService.obtenerProgreso(hoy.getMonth() + 1, hoy.getFullYear());
    if (res?.success) presupuestos.value = res.presupuestos || [];
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al cargar presupuestos.', position: 'top' });
  }
};

// Mapeos de palabras clave a Emojis (idénticos a CategoriasView)
const EMOJI_MAP = [
  { keys: ['comida', 'mercado', 'supermercado', 'alimento'],  emoji: '🛒' },
  { keys: ['restaurante', 'comedor', 'cafetería', 'cafe'],    emoji: '🍽️' },
  { keys: ['transporte', 'bus', 'taxi', 'metro', 'gasolina'], emoji: '🚌' },
  { keys: ['salud', 'farmacia', 'médico', 'doctor', 'clinica'],emoji: '💊' },
  { keys: ['educación', 'colegio', 'universidad', 'curso'],   emoji: '📚' },
  { keys: ['ropa', 'moda', 'vestimenta', 'zapatos'],          emoji: '👗' },
  { keys: ['vivienda', 'alquiler', 'arriendo', 'hogar'],      emoji: '🏠' },
  { keys: ['tecnología', 'tecno', 'computadora', 'celular'],  emoji: '💻' },
  { keys: ['deporte', 'gym', 'gimnasio', 'ejercicio'],        emoji: '💪' },
  { keys: ['mascotas', 'mascota', 'perro', 'gato', 'veterinario'], emoji: '🐾' },
  { keys: ['viaje', 'viajes', 'hotel', 'vuelo', 'avion'],     emoji: '✈️' },
  { keys: ['servicios', 'servicio', 'agua', 'luz', 'internet'],emoji: '🧾' },
  { keys: ['entretenimiento', 'ocio', 'cine', 'juego'],       emoji: '🎬' },
  { keys: ['suscripción', 'suscripciones', 'streaming', 'netflix'], emoji: '📱' },
  { keys: ['salario', 'nómina', 'nomina', 'sueldo'],          emoji: '💼' },
  { keys: ['freelance', 'proyecto', 'trabajo independiente'],  emoji: '🧑‍💻' },
  { keys: ['inversión', 'inversiones', 'ahorro', 'bolsa'],    emoji: '📈' },
  { keys: ['venta', 'ventas', 'comercio'],                    emoji: '🏷️' },
  { keys: ['bonificación', 'bono', 'prima', 'extra'],         emoji: '⭐' },
  { keys: ['regalo', 'obsequio'],                             emoji: '🎁' },
  { keys: ['seguro', 'poliza', 'póliza'],                     emoji: '🛡️' },
  { keys: ['deuda', 'préstamo', 'prestamo', 'crédito'],       emoji: '💳' },
];

const ICON_NAME_MAP = {
  'shopping_cart': '🛒',
  'restaurant': '🍽️',
  'receipt_long': '🧾',
  'directions_bus': '🚌',
  'movie': '🎬',
  'local_hospital': '💊',
  'school': '📚',
  'checkroom': '👗',
  'home': '🏠',
  'devices': '💻',
  'fitness_center': '💪',
  'pets': '🐾',
  'flight': '✈️',
  'subscriptions': '📱',
  'more_horiz': '⋯',
  'account_balance_wallet': '💼',
  'laptop_mac': '🧑‍💻',
  'trending_up': '📈',
  'star': '⭐',
  'sell': '🏷️',
  'credit_card': '💳',
};

const categoriasOriginales = ref([]);

const resolverEmojiPorNombre = (nombre) => {
  if (!nombre) return '🏷️';
  const encontrada = categoriasOriginales.value.find(c => c.nombre === nombre);
  if (encontrada && encontrada.icono) {
    if (ICON_NAME_MAP[encontrada.icono]) return ICON_NAME_MAP[encontrada.icono];
    const codePoint = encontrada.icono.codePointAt(0);
    if (codePoint && codePoint > 127) return encontrada.icono;
  }
  const lower = nombre.toLowerCase();
  for (const entry of EMOJI_MAP) {
    if (entry.keys.some(k => lower.includes(k))) return entry.emoji;
  }
  return '💸';
};

const cargarCategoriasGasto = async () => {
  try {
    const res = await categoriaService.obtener('gasto');
    if (res?.success) {
      categoriasOriginales.value = res.categorias || [];
      categoriasGasto.value = res.categorias.map(c => c.nombre) || [];
    }
  } catch (error) {
    console.error('Error al cargar categorías:', error);
  }
};

const abrirPresupuesto = () => {
  nuevoPresupuesto.value = { categoria: '', montoLimite: null };
  modalPresupuesto.value = true;
};

const abrirOcr = () => {
  archivoImagen.value = null;
  modalOcr.value = true;
};

const submitPresupuesto = async () => {
  const valid = await formPresupuesto.value?.validate();
  if (!valid) return;
  await guardarPresupuesto();
};

const guardarPresupuesto = async () => {
  try {
    $q.loading.show({ message: 'Guardando presupuesto...' });
    const hoy = new Date();
    const res = await presupuestoService.guardar({
      categoria: nuevoPresupuesto.value.categoria,
      montoLimite: nuevoPresupuesto.value.montoLimite,
      mes: hoy.getMonth() + 1,
      anio: hoy.getFullYear()
    });
    if (res?.success) {
      modalPresupuesto.value = false;
      $q.notify({ type: 'positive', message: 'Presupuesto fijado con éxito.', position: 'top' });
      await cargarPresupuestos();
    }
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.msg || 'Error al guardar el presupuesto.', position: 'top' });
  } finally {
    $q.loading.hide();
  }
};

const confirmarEliminarPresupuesto = (id) => {
  $q.dialog({
    title: 'Eliminar Presupuesto',
    message: '¿Estás seguro de que deseas eliminar este tope de presupuesto?',
    cancel: { color: 'grey-7', flat: true },
    ok: { color: 'negative', label: 'Eliminar' },
    persistent: true
  }).onOk(async () => {
    try {
      $q.loading.show({ message: 'Eliminando...' });
      const res = await presupuestoService.eliminar(id);
      if (res?.success) {
        $q.notify({ type: 'info', message: 'Presupuesto eliminado.', position: 'top' });
        await cargarPresupuestos();
      }
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Error al eliminar.', position: 'top' });
    } finally {
      $q.loading.hide();
    }
  });
};

const escanearDocumento = async () => {
  if (!archivoImagen.value) {
    $q.notify({ type: 'warning', message: 'Selecciona una imagen primero', position: 'top' });
    return;
  }
  procesando.value = true;
  try {
    const res = await ocrService.escanear(archivoImagen.value);
    if (res?.success) {
      modalOcr.value = false;
      const sugerencia = res.datosSugeridos;
      $q.dialog({
        title: '✅ Factura Detectada',
        message: `Comercio: ${sugerencia.comercio}\nMonto: $${sugerencia.monto.toLocaleString()}\nCategoría: ${sugerencia.categoria}\n\n¿Deseas registrar este gasto?`,
        cancel: { color: 'grey-7', flat: true },
        ok: { color: 'positive', label: 'Registrar Gasto' },
        persistent: true
      }).onOk(async () => {
        try {
          $q.loading.show({ message: 'Registrando gasto...' });
          await transaccionService.crear({
            tipo: 'gasto',
            descripcion: sugerencia.descripcion,
            categoria: sugerencia.categoria,
            monto: sugerencia.monto,
            fecha: new Date().toISOString().substring(0, 10)
          });
          $q.notify({ type: 'positive', message: 'Gasto registrado correctamente.', position: 'top' });
          await cargarPresupuestos();
        } catch (err) {
          $q.notify({ type: 'negative', message: 'No se pudo guardar la transacción.', position: 'top' });
        } finally {
          $q.loading.hide();
        }
      });
    }
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.msg || 'Error al procesar el recibo.', position: 'top' });
  } finally {
    procesando.value = false;
    archivoImagen.value = null;
  }
};

onMounted(() => {
  cargarPresupuestos();
  cargarCategoriasGasto();
});
</script>

<style scoped>
/* Botones de opción OCR (cámara / galería) */
.ocr-option-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.ocr-option-btn:hover {
  border-color: #6366f1;
  background: #eef2ff;
}
.ocr-option-btn:active {
  transform: scale(0.97);
}

.ocr-option-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Preview del archivo seleccionado */
.ocr-file-selected {
  display: flex;
  align-items: center;
  background: #f0fdf4;
  border: 1.5px solid #86efac;
  border-radius: 14px;
  padding: 12px 14px;
}
</style>