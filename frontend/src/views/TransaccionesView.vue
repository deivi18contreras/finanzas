<template>
  <q-page class="q-pa-lg bg-grey-1">

    <div class="row justify-between items-center q-mb-xl">
      <div>
        <h4 class="text-h4 text-weight-bold q-my-none text-primary font-heading">Movimientos</h4>
        <p class="text-subtitle2 text-grey-6 q-my-none">Registra y administra todos tus ingresos y egresos diarios.</p>
      </div>
      <div class="q-gutter-sm">
        <q-btn color="secondary" icon="download" label="Exportar"
          class="bg-gradient-secondary text-white text-weight-bold q-px-md" no-caps @click="abrirExportar" />
        <q-btn color="primary" icon="add" label="Nuevo Movimiento"
          class="bg-gradient-primary text-white text-weight-bold q-px-md" no-caps @click="abrirModal" />
      </div>
    </div>

    <!-- Resumen del mes en curso -->
    <div class="row q-col-gutter-lg q-mb-xl">
      <div class="col-12 col-sm-6">
        <q-card class="bg-gradient-secondary text-white shadow-hover card-premium">
          <q-card-section class="row justify-between items-center q-pa-lg">
            <div>
              <div class="text-subtitle2 text-uppercase text-weight-bolder tracking-wider opacity-80">Total Ingresos
              </div>
              <div class="text-h3 text-weight-bold q-mt-sm font-heading">{{ formatMonto(totalIngresos) }}</div>
            </div>
            <q-avatar size="56px" class="bg-white-10">
              <q-icon name="arrow_upward" size="32px" color="white" />
            </q-avatar>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6">
        <q-card class="bg-gradient-accent text-white shadow-hover card-premium">
          <q-card-section class="row justify-between items-center q-pa-lg">
            <div>
              <div class="text-subtitle2 text-uppercase text-weight-bolder tracking-wider opacity-80">Total Gastos</div>
              <div class="text-h3 text-weight-bold q-mt-sm font-heading">{{ formatMonto(totalGastos) }}</div>
            </div>
            <q-avatar size="56px" class="bg-white-10">
              <q-icon name="arrow_downward" size="32px" color="white" />
            </q-avatar>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Tabla -->
    <q-card class="shadow-hover" style="border-radius: 16px;">
      <q-card-section class="q-pa-none">
        <q-table flat :rows="transacciones" :columns="columnas" row-key="_id" :pagination="{ rowsPerPage: 10 }"
          class="table-premium">
          <template v-slot:body-cell-monto="props">
            <q-td :props="props"
              :class="props.row.tipo === 'ingreso' ? 'text-positive text-weight-bolder text-subtitle1 font-heading' : 'text-negative text-weight-bolder text-subtitle1 font-heading'">
              {{ props.row.tipo === 'ingreso' ? '+' : '-' }} ${{ props.value.toLocaleString() }}
            </q-td>
          </template>

          <template v-slot:body-cell-categoria="props">
            <q-td :props="props">
              <q-chip :color="props.row.tipo === 'ingreso' ? 'green-1' : 'red-1'"
                :text-color="props.row.tipo === 'ingreso' ? 'green-9' : 'red-9'"
                class="text-weight-bold text-caption text-uppercase" dense>
                {{ props.value }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-acciones="props">
            <q-td :props="props" class="text-center">
              <q-btn icon="edit" color="primary" flat round dense class="q-mr-xs" @click="abrirEditar(props.row)">
                <q-tooltip>Editar Transacción</q-tooltip>
              </q-btn>
              <q-btn icon="delete" color="negative" flat round dense @click="confirmarEliminar(props.row._id)">
                <q-tooltip>Eliminar Transacción</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Modal Bottom Sheet: Registrar Transacción -->
    <q-dialog v-model="modalTransaccion" persistent :position="$q.screen.lt.md ? 'bottom' : 'standard'">
      <q-card :class="$q.screen.lt.md ? 'modal-sheet' : 'modal-sheet-desktop'">

        <!-- Cabecera con gradiente -->
        <div class="modal-header" :style="nuevaTransaccion.tipo === 'ingreso'
          ? 'background: linear-gradient(135deg, #10b981 0%, #059669 100%)'
          : 'background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)'">
          <div class="drag-handle"></div>
          <div class="row items-start">
            <div>
              <div class="modal-title">
                {{ nuevaTransaccion.tipo === 'ingreso' ? '💰 Registrar Ingreso' : '💸 Registrar Gasto' }}
              </div>
              <div class="modal-subtitle">Completa los datos del movimiento</div>
            </div>
            <q-space />
            <q-btn icon="close" flat round dense color="white" class="modal-close-btn" v-close-popup />
          </div>
        </div>

        <!-- Cuerpo del formulario -->
        <div class="modal-body">
          <q-form ref="formTransaccion" @submit.prevent="guardarTransaccion" class="q-gutter-y-sm">

            <!-- Pill toggle tipo -->
            <div>
              <div class="text-caption text-grey-6 text-weight-bold q-mb-xs" style="letter-spacing:0.05em">TIPO DE
                MOVIMIENTO</div>
              <div class="type-toggle">
                <div class="type-pill" :class="nuevaTransaccion.tipo === 'ingreso' ? 'active-ingreso' : ''"
                  @click="nuevaTransaccion.tipo = 'ingreso'">
                  ↑ Ingreso
                </div>
                <div class="type-pill" :class="nuevaTransaccion.tipo === 'gasto' ? 'active-gasto' : ''"
                  @click="nuevaTransaccion.tipo = 'gasto'">
                  ↓ Gasto
                </div>
              </div>
            </div>

            <q-input filled v-model="nuevaTransaccion.descripcion" label="Descripción"
              :color="nuevaTransaccion.tipo === 'ingreso' ? 'positive' : 'negative'" lazy-rules
              :rules="[val => val && val.length > 0 || 'La descripción es obligatoria']" />

            <q-select filled v-model="nuevaTransaccion.categoria" :options="categoriasDisponibles" label="Categoría"
              :color="nuevaTransaccion.tipo === 'ingreso' ? 'positive' : 'negative'" lazy-rules
              :rules="[val => val && val.length > 0 || 'La categoría es obligatoria']"
              popup-content-class="select-popup-premium">
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

            <q-input filled v-model.number="nuevaTransaccion.monto" label="Monto ($)" type="number"
              :color="nuevaTransaccion.tipo === 'ingreso' ? 'positive' : 'negative'" lazy-rules
              :rules="[val => val && val > 0 || 'Ingresa un monto válido']">
              <template v-slot:prepend>
                <span class="text-weight-bold text-grey-6">$</span>
              </template>
            </q-input>

            <q-input filled v-model="nuevaTransaccion.fecha" label="Fecha" type="date" stack-label
              :color="nuevaTransaccion.tipo === 'ingreso' ? 'positive' : 'negative'" lazy-rules
              :rules="[val => val && val.length > 0 || 'La fecha es obligatoria']" />

          </q-form>
        </div>

        <!-- Barra de acciones sticky -->
        <div class="modal-action-bar">
          <q-btn label="Cancelar" flat no-caps class="btn-cancel" v-close-popup />
          <q-btn label="Guardar Movimiento" no-caps class="btn-confirm text-white" :style="nuevaTransaccion.tipo === 'ingreso'
            ? 'background: linear-gradient(135deg,#10b981,#059669)'
            : 'background: linear-gradient(135deg,#f43f5e,#e11d48)'" @click="submitTransaccion" />
        </div>

      </q-card>
    </q-dialog>

    <!-- ─── MODAL EXPORTAR (bottom sheet en móvil) ─── -->
    <q-dialog v-model="modalExportar" persistent :position="$q.screen.lt.md ? 'bottom' : 'standard'">
      <q-card :class="$q.screen.lt.md ? 'modal-sheet' : 'modal-sheet-desktop'">
        <div class="modal-header" style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)">
          <div class="drag-handle"></div>
          <div class="row items-start">
            <div>
              <div class="modal-title">📊 Generar Extracto</div>
              <div class="modal-subtitle">Descarga tus movimientos en PDF o Excel</div>
            </div>
            <q-space />
            <q-btn icon="close" flat round dense color="white" class="modal-close-btn" v-close-popup />
          </div>
        </div>

        <div class="modal-body q-gutter-y-md">
          <!-- Filtro Mes -->
          <div>
            <div class="text-caption text-grey-6 text-weight-bold q-mb-xs" style="letter-spacing:0.05em">MES DEL
              EXTRACTO
            </div>
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-select filled v-model="filtroExportar.mes" :options="mesesOpciones" label="Mes" emit-value
                  map-options color="primary" />
              </div>
              <div class="col-6">
                <q-select filled v-model="filtroExportar.anio" :options="aniosOpciones" label="Año" color="primary" />
              </div>
            </div>
          </div>

          <!-- Filtro Tipo -->
          <div>
            <div class="text-caption text-grey-6 text-weight-bold q-mb-xs" style="letter-spacing:0.05em">TIPO DE
              MOVIMIENTOS
            </div>
            <div class="type-toggle">
              <div class="type-pill" :class="filtroExportar.tipo === 'todos' ? 'active-ingreso' : ''"
                @style="filtroExportar.tipo === 'todos' ? 'background:#e0e7ff;color:#4f46e5' : ''"
                @click="filtroExportar.tipo = 'todos'">💼 Todos</div>
              <div class="type-pill" :class="filtroExportar.tipo === 'ingreso' ? 'active-ingreso' : ''"
                @click="filtroExportar.tipo = 'ingreso'">↑ Ingresos</div>
              <div class="type-pill" :class="filtroExportar.tipo === 'gasto' ? 'active-gasto' : ''"
                @click="filtroExportar.tipo = 'gasto'">↓ Gastos</div>
            </div>
          </div>
        </div>

        <div class="modal-action-bar">
          <q-btn label="Cancelar" flat no-caps class="btn-cancel" v-close-popup />
          <q-btn label="Descargar Excel" icon="description" no-caps class="btn-confirm text-white"
            style="background: #10b981" @click="exportarExcel" />
          <q-btn label="Descargar PDF" icon="picture_as_pdf" no-caps class="btn-confirm text-white"
            style="background: #ef4444" @click="exportarPDF" />
        </div>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const formTransaccion = ref(null);
import { transaccionService } from '../services/transaccionService.js';
import { categoriaService } from '../services/categoriaService.js';

const $q = useQuasar();

// ─── VARIABLES MODAL EXPORTAR ───
const modalExportar = ref(false);
const filtroExportar = ref({
  mes: new Date().getMonth() + 1,
  anio: new Date().getFullYear(),
  tipo: 'todos'
});

const mesesOpciones = [
  { label: 'Enero', value: 1 },
  { label: 'Febrero', value: 2 },
  { label: 'Marzo', value: 3 },
  { label: 'Abril', value: 4 },
  { label: 'Mayo', value: 5 },
  { label: 'Junio', value: 6 },
  { label: 'Julio', value: 7 },
  { label: 'Agosto', value: 8 },
  { label: 'Septiembre', value: 9 },
  { label: 'Octubre', value: 10 },
  { label: 'Noviembre', value: 11 },
  { label: 'Diciembre', value: 12 }
];

const aniosOpciones = [
  new Date().getFullYear() - 1,
  new Date().getFullYear(),
  new Date().getFullYear() + 1
];

const abrirExportar = () => {
  filtroExportar.value = {
    mes: new Date().getMonth() + 1,
    anio: new Date().getFullYear(),
    tipo: 'todos'
  };
  modalExportar.value = true;
};

// ─── EXPORTAR EXCEL ───
const exportarExcel = async () => {
  try {
    $q.loading.show({ message: 'Preparando archivo Excel...' });
    const data = await transaccionService.obtenerPorMes(filtroExportar.value.anio, filtroExportar.value.mes);
    if (!data?.success || !data.transacciones?.length) {
      $q.notify({ type: 'warning', message: 'No hay movimientos registrados para este periodo.', position: 'top' });
      return;
    }

    // Filtrar por tipo si aplica
    let filtrados = data.transacciones;
    if (filtroExportar.value.tipo !== 'todos') {
      filtrados = filtrados.filter(t => t.tipo === filtroExportar.value.tipo);
    }

    if (!filtrados.length) {
      $q.notify({ type: 'warning', message: 'No hay movimientos del tipo seleccionado en este periodo.', position: 'top' });
      return;
    }

    // Estructura de datos para Excel
    const rows = filtrados.map(t => ({
      Fecha: new Date(t.fecha).toLocaleDateString(),
      Descripción: t.descripcion,
      Categoría: t.categoria,
      Tipo: t.tipo.toUpperCase(),
      Monto: t.monto
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Movimientos');

    // Autoadjust columns width
    const maxCols = [{ wch: 15 }, { wch: 30 }, { wch: 20 }, { wch: 12 }, { wch: 15 }];
    worksheet['!cols'] = maxCols;

    const nombreMes = mesesOpciones.find(m => m.value === filtroExportar.value.mes)?.label;
    XLSX.writeFile(workbook, `Extracto_Finanzas_${nombreMes}_${filtroExportar.value.anio}.xlsx`);

    modalExportar.value = false;
    $q.notify({ type: 'positive', message: 'Archivo Excel generado y descargado.', position: 'top' });
  } catch (err) {
    console.error(err);
    $q.notify({ type: 'negative', message: 'Error al exportar a Excel.', position: 'top' });
  } finally {
    $q.loading.hide();
  }
};

// ─── EXPORTAR PDF (Extracto Bancario Estilo Premium) ───
const exportarPDF = async () => {
  try {
    $q.loading.show({ message: 'Generando Extracto PDF...' });
    const data = await transaccionService.obtenerPorMes(filtroExportar.value.anio, filtroExportar.value.mes);
    if (!data?.success || !data.transacciones?.length) {
      $q.notify({ type: 'warning', message: 'No hay movimientos registrados para este periodo.', position: 'top' });
      return;
    }

    let filtrados = data.transacciones;
    if (filtroExportar.value.tipo !== 'todos') {
      filtrados = filtrados.filter(t => t.tipo === filtroExportar.value.tipo);
    }

    if (!filtrados.length) {
      $q.notify({ type: 'warning', message: 'No hay movimientos del tipo seleccionado en este periodo.', position: 'top' });
      return;
    }

    const doc = new jsPDF();
    const nombreMes = mesesOpciones.find(m => m.value === filtroExportar.value.mes)?.label;

    // Header superior
    doc.setFillColor(30, 41, 59); // color #1e293b dark slate
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('💰 FINANZAS', 15, 25);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Periodo: ${nombreMes} ${filtroExportar.value.anio}`, 195, 20, { align: 'right' });
    doc.text('Estado de Cuenta Mensual', 195, 27, { align: 'right' });

    // Resumen del periodo
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont('Helvetica', 'bold');
    doc.text('Resumen del Periodo', 15, 55);

    // Calcular montos del filtro actual
    const totalIn = filtrados.filter(t => t.tipo === 'ingreso').reduce((sum, t) => sum + t.monto, 0);
    const totalOut = filtrados.filter(t => t.tipo === 'gasto').reduce((sum, t) => sum + t.monto, 0);
    const balance = totalIn - totalOut;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Ingresos Totales: $${totalIn.toLocaleString()}`, 15, 65);
    doc.text(`Gastos Totales: $${totalOut.toLocaleString()}`, 15, 72);

    // Balance con color según resultado
    if (balance >= 0) {
      doc.setTextColor(16, 185, 129); // green
    } else {
      doc.setTextColor(239, 68, 68); // red
    }
    doc.setFont('Helvetica', 'bold');
    doc.text(`Balance Neto: $${balance.toLocaleString()}`, 15, 80);

    // Separador
    doc.setDrawColor(226, 232, 240);
    doc.line(15, 87, 195, 87);

    // Tabla de movimientos
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont('Helvetica', 'bold');
    doc.text('Detalle de Movimientos', 15, 96);

    const tableRows = filtrados.map(t => [
      new Date(t.fecha).toLocaleDateString(),
      t.descripcion,
      t.categoria,
      t.tipo === 'ingreso' ? 'Ingreso' : 'Gasto',
      t.tipo === 'ingreso' ? `+$${t.monto.toLocaleString()}` : `-$${t.monto.toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: 102,
      head: [['Fecha', 'Descripción', 'Categoría', 'Tipo', 'Monto']],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] }, // color Indigo
      columnStyles: {
        4: { halign: 'right', fontStyle: 'bold' }
      },
      styles: { fontSize: 9 }
    });

    doc.save(`Extracto_Finanzas_${nombreMes}_${filtroExportar.value.anio}.pdf`);
    modalExportar.value = false;
    $q.notify({ type: 'positive', message: 'Extracto PDF generado y descargado.', position: 'top' });

  } catch (err) {
    console.error(err);
    $q.notify({ type: 'negative', message: 'Error al generar el archivo PDF.', position: 'top' });
  } finally {
    $q.loading.hide();
  }
};

const modalTransaccion = ref(false);
const modoEdicion = ref(false);
const transaccionEditandoId = ref(null);
const nuevaTransaccion = ref({
  tipo: 'gasto',
  descripcion: '',
  categoria: '',
  monto: null,
  fecha: new Date().toISOString().substring(0, 10)
});

const transacciones = ref([]);
const totalIngresos = ref(0);
const totalGastos = ref(0);
const categoriasDisponibles = ref([]);

const columnas = [
  { name: 'fecha', align: 'left', label: 'Fecha', field: 'fecha', format: val => val ? new Date(val).toLocaleDateString() : '', sortable: true },
  { name: 'descripcion', align: 'left', label: 'Descripción', field: 'descripcion', sortable: true },
  { name: 'categoria', align: 'center', label: 'Categoría', field: 'categoria', sortable: true },
  { name: 'monto', align: 'right', label: 'Monto', field: 'monto', sortable: true },
  { name: 'acciones', align: 'center', label: 'Acciones' }
];

const formatMonto = (v) => {
  if (v === undefined || v === null) return '$0';
  return (v < 0 ? '-' : '') + '$' + Math.abs(v).toLocaleString();
};

const cargarTransacciones = async () => {
  try {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = hoy.getMonth() + 1;

    const data = await transaccionService.obtenerPorMes(anio, mes);
    if (data?.success) {
      transacciones.value = data.transacciones || [];
      totalIngresos.value = data.resumenMes.totalIngresos || 0;
      totalGastos.value = data.resumenMes.totalGastos || 0;
    }
  } catch (error) {
    console.error('Error al cargar transacciones:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar el historial de transacciones.',
      position: 'top'
    });
  }
};

// Mapeos de palabras clave a Emojis (idénticos a CategoriasView)
const EMOJI_MAP = [
  { keys: ['comida', 'mercado', 'supermercado', 'alimento'], emoji: '🛒' },
  { keys: ['restaurante', 'comedor', 'cafetería', 'cafe'], emoji: '🍽️' },
  { keys: ['transporte', 'bus', 'taxi', 'metro', 'gasolina'], emoji: '🚌' },
  { keys: ['salud', 'farmacia', 'médico', 'doctor', 'clinica'], emoji: '💊' },
  { keys: ['educación', 'colegio', 'universidad', 'curso'], emoji: '📚' },
  { keys: ['ropa', 'moda', 'vestimenta', 'zapatos'], emoji: '👗' },
  { keys: ['vivienda', 'alquiler', 'arriendo', 'hogar'], emoji: '🏠' },
  { keys: ['tecnología', 'tecno', 'computadora', 'celular'], emoji: '💻' },
  { keys: ['deporte', 'gym', 'gimnasio', 'ejercicio'], emoji: '💪' },
  { keys: ['mascotas', 'mascota', 'perro', 'gato', 'veterinario'], emoji: '🐾' },
  { keys: ['viaje', 'viajes', 'hotel', 'vuelo', 'avion'], emoji: '✈️' },
  { keys: ['servicios', 'servicio', 'agua', 'luz', 'internet'], emoji: '🧾' },
  { keys: ['entretenimiento', 'ocio', 'cine', 'juego'], emoji: '🎬' },
  { keys: ['suscripción', 'suscripciones', 'streaming', 'netflix'], emoji: '📱' },
  { keys: ['salario', 'nómina', 'nomina', 'sueldo'], emoji: '💼' },
  { keys: ['freelance', 'proyecto', 'trabajo independiente'], emoji: '🧑‍💻' },
  { keys: ['inversión', 'inversiones', 'ahorro', 'bolsa'], emoji: '📈' },
  { keys: ['venta', 'ventas', 'comercio'], emoji: '🏷️' },
  { keys: ['bonificación', 'bono', 'prima', 'extra'], emoji: '⭐' },
  { keys: ['regalo', 'obsequio'], emoji: '🎁' },
  { keys: ['seguro', 'poliza', 'póliza'], emoji: '🛡️' },
  { keys: ['deuda', 'préstamo', 'prestamo', 'crédito'], emoji: '💳' },
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

// Guardar categorías crudas para poder revisar su icono
const categoriasOriginales = ref([]);

const resolverEmojiPorNombre = (nombre) => {
  if (!nombre) return '🏷️';
  // Buscar en las categorías cargadas de la base de datos primero
  const encontrada = categoriasOriginales.value.find(c => c.nombre === nombre);
  if (encontrada && encontrada.icono) {
    if (ICON_NAME_MAP[encontrada.icono]) return ICON_NAME_MAP[encontrada.icono];
    const codePoint = encontrada.icono.codePointAt(0);
    if (codePoint && codePoint > 127) return encontrada.icono;
  }
  // Mapear por nombre si no se encontró
  const lower = nombre.toLowerCase();
  for (const entry of EMOJI_MAP) {
    if (entry.keys.some(k => lower.includes(k))) return entry.emoji;
  }
  return nuevaTransaccion.value.tipo === 'ingreso' ? '💰' : '💸';
};

const cargarCategorias = async (tipo) => {
  try {
    const data = await categoriaService.obtener(tipo);
    if (data?.success) {
      categoriasOriginales.value = data.categorias || [];
      categoriasDisponibles.value = data.categorias.map(c => c.nombre) || [];
    }
  } catch (error) {
    console.error('Error al cargar categorías:', error);
  }
};

const abrirModal = () => {
  modoEdicion.value = false;
  transaccionEditandoId.value = null;
  nuevaTransaccion.value = {
    tipo: 'gasto',
    descripcion: '',
    categoria: '',
    monto: null,
    fecha: new Date().toISOString().substring(0, 10)
  };
  modalTransaccion.value = true;
};

const abrirEditar = (transaccion) => {
  modoEdicion.value = true;
  transaccionEditandoId.value = transaccion._id;
  nuevaTransaccion.value = {
    tipo: transaccion.tipo,
    descripcion: transaccion.descripcion,
    categoria: transaccion.categoria,
    monto: transaccion.monto,
    fecha: new Date(transaccion.fecha).toISOString().substring(0, 10)
  };
  cargarCategorias(transaccion.tipo);
  modalTransaccion.value = true;
};

// Cargar categorías al cambiar el tipo
watch(() => nuevaTransaccion.value.tipo, (nuevoTipo) => {
  cargarCategorias(nuevoTipo);
  nuevaTransaccion.value.categoria = '';
});

// Autocompletar la descripción si está vacía al seleccionar una categoría
watch(() => nuevaTransaccion.value.categoria, (nuevaCat) => {
  if (nuevaCat && !nuevaTransaccion.value.descripcion) {
    nuevaTransaccion.value.descripcion = nuevaCat;
  }
});

const submitTransaccion = async () => {
  const valid = await formTransaccion.value?.validate();
  if (!valid) return;
  await guardarTransaccion();
};

const guardarTransaccion = async () => {
  try {
    $q.loading.show({ message: modoEdicion.value ? 'Actualizando movimiento...' : 'Registrando movimiento...' });

    // Ajustar la fecha para evitar corrimiento por diferencia de huso horario
    let fechaFinal = nuevaTransaccion.value.fecha;
    if (fechaFinal) {
      // Forzar que sea el mediodía en la fecha local del usuario para no cambiar de día
      const parts = fechaFinal.split('-');
      if (parts.length === 3) {
        fechaFinal = new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 12, 0, 0)).toISOString();
      }
    }

    const res = modoEdicion.value
      ? await transaccionService.editar(transaccionEditandoId.value, { ...nuevaTransaccion.value, fecha: fechaFinal })
      : await transaccionService.crear({ ...nuevaTransaccion.value, fecha: fechaFinal });

    if (res?.success) {
      modalTransaccion.value = false;
      $q.notify({
        type: 'positive',
        message: modoEdicion.value ? 'Transacción actualizada con éxito.' : 'Transacción registrada con éxito.',
        position: 'top'
      });
      await cargarTransacciones();
    }
  } catch (error) {
    console.error('Error al registrar transacción:', error);
    $q.notify({
      type: 'negative',
      message: error.response?.data?.msg || 'Error al guardar la transacción.',
      position: 'top'
    });
  } finally {
    $q.loading.hide();
  }
};

const confirmarEliminar = (id) => {
  $q.dialog({
    title: 'Eliminar Movimiento',
    message: '¿Está seguro de que desea eliminar permanentemente este movimiento?',
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
      $q.loading.show({ message: 'Eliminando movimiento...' });
      const res = await transaccionService.eliminar(id);
      if (res?.success) {
        $q.notify({
          type: 'positive',
          message: 'Movimiento eliminado correctamente.',
          position: 'top'
        });
        await cargarTransacciones();
      }
    } catch (error) {
      console.error('Error al eliminar transacción:', error);
      $q.notify({
        type: 'negative',
        message: 'Error al intentar eliminar la transacción.',
        position: 'top'
      });
    } finally {
      $q.loading.hide();
    }
  });
};

onMounted(() => {
  cargarTransacciones();
  cargarCategorias(nuevaTransaccion.value.tipo);
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
</style>