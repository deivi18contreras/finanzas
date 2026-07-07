<template>
  <q-card :class="['shadow-hover text-white card-premium', colorClass]">
    <q-card-section class="row justify-between items-center q-pa-lg">
      <div>
        <div class="text-subtitle2 text-uppercase text-weight-bolder tracking-wider opacity-80">
          {{ titulo }}
        </div>
        <div class="text-h3 text-weight-bold q-mt-sm font-heading">
          {{ formatMonto(monto) }}
        </div>
      </div>
      <q-avatar size="56px" class="bg-white-10">
        <q-icon :name="icono" size="32px" color="white" />
      </q-avatar>
    </q-card-section>
  </q-card>
</template>

<script setup>
defineProps({
  titulo: {
    type: String,
    required: true
  },
  monto: {
    type: Number,
    required: true,
    default: 0
  },
  icono: {
    type: String,
    required: true
  },
  colorClass: {
    type: String,
    default: 'bg-gradient-primary'
  }
});

const formatMonto = (v) => {
  if (v === undefined || v === null) return '$0';
  return (v < 0 ? '-' : '') + '$' + Math.abs(v).toLocaleString();
};
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
.opacity-80 {
  opacity: 0.8;
}
</style>
