<template>
  <q-page class="q-pa-lg bg-grey-1">

    <div class="row justify-between items-center q-mb-xl">
      <div>
        <h4 class="text-h4 text-weight-bold q-my-none text-slate-800 font-heading">Movimientos</h4>
        <p class="text-subtitle2 text-grey-6 q-my-none">Registra y administra todos tus ingresos y egresos diarios.</p>
      </div>
      <div class="q-gutter-sm">
        <q-btn
          color="white"
          text-color="slate-800"
          icon="download"
          label="Exportar"
          class="text-weight-bold q-px-md shadow-1"
          no-caps
          unelevated
          @click="abrirExportar"
        />
        <q-btn
          color="black"
          icon="add"
          label="Nuevo Movimiento"
          class="btn-dark text-weight-bold q-px-md"
          no-caps
          unelevated
          @click="abrirModal"
        />
      </div>
    </div>

    <!-- Selector de Período -->
    <div class="row q-gutter-sm q-mb-lg items-center">
      <q-select
        outlined
        dense
        v-model="mesSeleccionado"
        :options="mesesOpciones"
        emit-value
        map-options
        label="Mes"
        style="min-width: 150px;"
        color="primary"
        bg-color="white"
        @update:model-value="cargarTransacciones"
      />
      <q-select
        outlined
        dense
        v-model="anioSeleccionado"
        :options="aniosOpciones"
        emit-value
        map-options
        label="Año"
        style="min-width: 110px;"
        color="primary"
        bg-color="white"
        @update:model-value="cargarTransacciones"
      />
      <q-chip color="primary" text-color="white" icon="calendar_month" dense>
        {{ mesesOpciones.find(m => m.value === mesSeleccionado)?.label }} {{ anioSeleccionado }}
      </q-chip>
    </div>

    <!-- Resumen del mes en curso con Estilo Pastel del Mockup -->
    <div class="row q-col-gutter-lg q-mb-xl">
      <!-- Tarjeta 1: Ingresos (Verde Pastel) -->
      <div class="col-12 col-sm-6">
        <q-card class="shadow-1 card-resumen card-resumen-cobrar" style="border-radius: 16px;">
          <q-card-section class="row items-center q-pa-lg">
            <div class="icon-box icon-box-cobrar q-mr-md">
              <q-icon name="o_arrow_upward" size="28px" color="green-5" />
            </div>
            <div>
              <div class="text-subtitle2 text-grey-7 text-weight-bold">Total Ingresos</div>
              <div class="text-h3 text-weight-bolder text-slate-900 q-my-xs">{{ formatMonto(totalIngresos) }}</div>
              <div class="text-caption text-grey-8 text-weight-medium">Entradas registradas este mes</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Tarjeta 2: Gastos (Rojo/Rosa Pastel) -->
      <div class="col-12 col-sm-6">
        <q-card class="shadow-1 card-resumen card-resumen-pagar" style="border-radius: 16px;">
          <q-card-section class="row items-center q-pa-lg">
            <div class="icon-box icon-box-pagar q-mr-md">
              <q-icon name="o_arrow_downward" size="28px" color="red-5" />
            </div>
            <div>
              <div class="text-subtitle2 text-grey-7 text-weight-bold">Total Gastos</div>
              <div class="text-h3 text-weight-bolder text-slate-900 q-my-xs">{{ formatMonto(totalGastos) }}</div>
              <div class="text-caption text-grey-8 text-weight-medium">Salidas registradas este mes</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Tabla de Movimientos -->
    <div class="q-mb-xl">
      <div class="row items-center justify-between q-mb-md">
        <div>
          <div class="row items-center">
            <span class="dot-indicator bg-slate-700 q-mr-sm"></span>
            <span class="text-h6 text-weight-bold text-slate-900 font-heading">Historial de Transacciones</span>
          </div>
          <span class="text-caption text-grey-6 block q-ml-sm">Tus registros financieros de este periodo</span>
        </div>
        <div class="row q-gutter-sm items-center">
          <q-input
            v-model="buscarTransaccion"
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
        </div>
      </div>

      <q-card class="shadow-1 table-card" style="border-radius: 12px;">
        <q-card-section class="q-pa-none">
          <q-table
            flat
            :rows="transaccionesFiltradas"
            :columns="columnas"
            row-key="_id"
            :pagination="{ rowsPerPage: 10 }"
            class="table-premium-mock table-movimientos"
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
                  <span class="q-mr-xs">{{ resolverEmoji(props.value) }}</span>
                  {{ props.value }}
                </q-chip>
              </q-td>
            </template>

            <template v-slot:body-cell-monto="props">
              <q-td :props="props" :class="props.row.tipo === 'ingreso' ? 'text-positive text-weight-bolder text-subtitle2 font-heading' : 'text-negative text-weight-bolder text-subtitle2 font-heading'">
                {{ props.row.tipo === 'ingreso' ? '+' : '-' }} ${{ props.value.toLocaleString() }}
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
        </q-card-section>
      </q-card>
    </div>

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
                {{ modoEdicion ? '✏️ Editar Movimiento' : (nuevaTransaccion.tipo === 'ingreso' ? '💰 Registrar Ingreso' : '💸 Registrar Gasto') }}
              </div>
              <div class="modal-subtitle">Completa los datos del movimiento</div>
            </div>
            <q-space />
            <q-btn icon="close" flat round dense color="white" class="modal-close-btn" v-close-popup />
          </div>
        </div>

        <!-- Cuerpo del formulario -->
        <div class="modal-body">
          <q-form ref="formTransaccion" @submit.prevent="submitTransaccion" class="q-gutter-y-sm">

            <!-- Pill toggle tipo -->
            <div>
              <div class="text-caption text-grey-6 text-weight-bold q-mb-xs" style="letter-spacing:0.05em">TIPO DE MOVIMIENTO</div>
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

            <q-select filled v-model="nuevaTransaccion.categoria" :options="categoriasDisponibles"
              emit-value map-options
              label="Categoría"
              :color="nuevaTransaccion.tipo === 'ingreso' ? 'positive' : 'negative'" lazy-rules
              :rules="[val => val && val.length > 0 || 'La categoría es obligatoria']"
              popup-content-class="select-popup-premium">
            </q-select>

            <q-input filled v-model.number="nuevaTransaccion.monto" type="number" label="Monto ($)"
              :color="nuevaTransaccion.tipo === 'ingreso' ? 'positive' : 'negative'" lazy-rules
              :rules="[val => val && val > 0 || 'Ingresa un monto válido']">
              <template v-slot:prepend>
                <span class="text-weight-bold text-grey-6">$</span>
              </template>
            </q-input>

            <q-input filled v-model="nuevaTransaccion.fecha" type="date" label="Fecha" stack-label
              :color="nuevaTransaccion.tipo === 'ingreso' ? 'positive' : 'negative'" />

          </q-form>
        </div>

        <div class="modal-action-bar">
          <q-btn label="Cancelar" flat no-caps class="btn-cancel" v-close-popup />
          <q-btn
            :label="modoEdicion ? 'Actualizar' : 'Guardar Movimiento'"
            no-caps
            class="btn-confirm text-white"
            :style="nuevaTransaccion.tipo === 'ingreso'
              ? 'background: linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : 'background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)'"
            @click="submitTransaccion"
          />
        </div>

      </q-card>
    </q-dialog>

    <!-- Modal Exportar a PDF / Excel -->
    <q-dialog v-model="modalExportar" persistent>
      <q-card class="modal-sheet-desktop" style="border-radius:20px">
        <div class="modal-header bg-gradient-primary">
          <div class="row items-center">
            <div>
              <div class="modal-title">📦 Exportar Movimientos</div>
              <div class="modal-subtitle">Genera reportes de tus finanzas</div>
            </div>
            <q-space />
            <q-btn icon="close" flat round dense color="white" v-close-popup />
          </div>
        </div>

        <div class="modal-body q-gutter-y-md">
          <div>
            <div class="text-caption text-grey-6 text-weight-bold q-mb-xs">SELECCIONA EL MES</div>
            <q-select filled v-model="filtroExportar.mes" :options="mesesDisponibles" option-value="value"
              option-label="label" emit-value map-options color="primary" />
          </div>
          <div>
            <div class="text-caption text-grey-6 text-weight-bold q-mb-xs">SELECCIONA EL AÑO</div>
            <q-select filled v-model="filtroExportar.anio" :options="[2024, 2025, 2026, 2027]" color="primary" />
          </div>
        </div>

        <div class="modal-action-bar">
          <q-btn label="Cancelar" flat no-caps class="btn-cancel" v-close-popup />
          <q-btn label="Exportar Excel" no-caps class="btn-confirm text-white" color="green-8"
            @click="exportarExcel" />
          <q-btn label="Generar PDF" no-caps class="btn-confirm text-white" color="red-8" @click="exportarPDF" />
        </div>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { transaccionService } from '../services/transaccionService.js';
import { categoriaService } from '../services/categoriaService.js';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const $q = useQuasar();
const formTransaccion = ref(null);
const buscarTransaccion = ref('');

const modalExportar = ref(false);
const filtroExportar = ref({
  mes: new Date().getMonth() + 1,
  anio: new Date().getFullYear()
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

const anioActual = new Date().getFullYear();
const aniosOpciones = Array.from({ length: 5 }, (_, i) => ({ label: String(anioActual - i), value: anioActual - i }));
const mesSeleccionado = ref(new Date().getMonth() + 1);
const anioSeleccionado = ref(anioActual);

// Alias para compatibilidad con el modal de exportar
const mesesDisponibles = mesesOpciones;

const abrirExportar = () => {
  modalExportar.value = true;
};

const exportarExcel = () => {
  try {
    const filtrados = transacciones.value.filter(t => {
      const f = new Date(t.fecha);
      return (f.getMonth() + 1) === filtroExportar.value.mes && f.getFullYear() === filtroExportar.value.anio;
    });

    if (filtrados.length === 0) {
      $q.notify({ type: 'warning', message: 'No hay movimientos en este periodo para exportar.', position: 'top' });
      return;
    }

    const data = filtrados.map(t => ({
      Fecha: new Date(t.fecha).toLocaleDateString(),
      Descripción: t.descripcion,
      Categoría: t.categoria,
      Tipo: t.tipo === 'ingreso' ? 'Ingreso' : 'Gasto',
      Monto: t.monto
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Movimientos");

    const nombreMes = mesesDisponibles.find(m => m.value === filtroExportar.value.mes).label;
    XLSX.writeFile(wb, `Reporte_Finanzas_${nombreMes}_${filtroExportar.value.anio}.xlsx`);
    modalExportar.value = false;
    $q.notify({ type: 'positive', message: 'Archivo de Excel generado y descargado.', position: 'top' });
  } catch (error) {
    console.error(error);
    $q.notify({ type: 'negative', message: 'Error al exportar a Excel.', position: 'top' });
  }
};

const exportarPDF = () => {
  try {
    $q.loading.show({ message: 'Generando PDF...' });

    const filtrados = transacciones.value.filter(t => {
      const f = new Date(t.fecha);
      return (f.getMonth() + 1) === filtroExportar.value.mes && f.getFullYear() === filtroExportar.value.anio;
    });

    if (filtrados.length === 0) {
      $q.notify({ type: 'warning', message: 'No hay movimientos en este periodo para exportar.', position: 'top' });
      return;
    }

    const doc = new jsPDF();
    const nombreMes = mesesDisponibles.find(m => m.value === filtroExportar.value.mes).label;

    // Header del PDF
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 220, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('Helvetica', 'bold');
    doc.text('EXTRACTO DE FINANZAS', 15, 20);

    doc.setFontSize(12);
    doc.setFont('Helvetica', 'normal');
    doc.text(`Periodo: ${nombreMes} / ${filtroExportar.value.anio}`, 15, 30);

    // Resumen Financiero
    const ingresos = filtrados.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0);
    const egresos = filtrados.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0);
    const balance = ingresos - egresos;

    doc.setTextColor(100, 116, 139); // slate-500
    doc.text('RESUMEN DEL PERIODO', 15, 52);

    doc.setTextColor(30, 41, 59); // slate-800
    doc.text(`Total Ingresos: $${ingresos.toLocaleString()}`, 15, 62);
    doc.text(`Total Egresos: $${egresos.toLocaleString()}`, 15, 70);

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
      headStyles: { fillColor: [15, 23, 42] }, // color slate
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

import { formatMonto } from '../utils/formatters.js';
import { useCategoryEmoji } from '../composables/useCategoryEmoji.js';

const { resolverEmoji } = useCategoryEmoji();

// Filtrado del buscador reactivo
const transaccionesFiltradas = computed(() => {
  const query = buscarTransaccion.value.toLowerCase().trim();
  if (!query) return transacciones.value;
  return transacciones.value.filter(t =>
    t.descripcion.toLowerCase().includes(query) || t.categoria.toLowerCase().includes(query)
  );
});

const cargarTransacciones = async () => {
  try {
    const res = await transaccionService.obtenerPorMes(anioSeleccionado.value, mesSeleccionado.value);
    if (res?.success) {
      transacciones.value = res.transacciones || [];
      totalIngresos.value = res.resumenMes?.totalIngresos || 0;
      totalGastos.value = res.resumenMes?.totalGastos || 0;
    }
  } catch (error) {
    console.error('Error al cargar transacciones:', error);
  }
};

const cargarCategorias = async (tipo) => {
  try {
    const res = await categoriaService.obtener(tipo);
    if (res?.success) {
      categoriasDisponibles.value = res.categorias.map(c => ({
        label: `${resolverEmoji(c.nombre, c.icono)} ${c.nombre}`,
        value: c.nombre
      }));
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
    fecha: transaccion.fecha ? transaccion.fecha.substring(0, 10) : new Date().toISOString().substring(0, 10)
  };
  modalTransaccion.value = true;
};

watch(() => nuevaTransaccion.value.tipo, (nuevoTipo) => {
  cargarCategorias(nuevoTipo);
  nuevaTransaccion.value.categoria = '';
});

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

    let fechaFinal = nuevaTransaccion.value.fecha;
    if (fechaFinal) {
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
    cancel: { color: 'grey-7', flat: true },
    ok: { color: 'negative', label: 'Eliminar' },
    persistent: true
  }).onOk(async () => {
    try {
      $q.loading.show({ message: 'Eliminando movimiento...' });
      const res = await transaccionService.eliminar(id);
      if (res?.success) {
        $q.notify({ type: 'positive', message: 'Movimiento eliminado correctamente.', position: 'top' });
        await cargarTransacciones();
      }
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Error al intentar eliminar la transacción.', position: 'top' });
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
  background: linear-gradient(135deg, #fff5f5 0%, #ffe3e3 100%) !important; /* Rojo/Gastos pastel */
}
.card-resumen-cobrar { 
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%) !important; /* Verde/Ingresos pastel */
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
.table-movimientos :deep(thead tr) {
  background: linear-gradient(135deg, #0f172a 0%, #0284c7 100%) !important; /* Slate a Celeste */
}
.table-movimientos :deep(thead th) {
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