/**
 * Composable centralizado para íconos de categoría.
 * Fase 4.3 — Reemplaza el mapa duplicado que existía solo en Dashboard.vue
 * Importar en cualquier componente: const { getCategoryIcon } = useCategoryIcon()
 */
export function useCategoryIcon() {
  const categoryIcons = {
    // Servicios públicos
    'Agua': '💧',
    'Gas': '🔥',
    'Luz': '⚡',
    'Internet': '🌐',
    // Alimentación
    'D1 / Ara': '🛒',
    'Supermercado': '🏪',
    'Plaza de Mercado': '🍎',
    'Restaurante': '🍔',
    // Salud y bienestar
    'Gym / Deporte': '🏋️',
    'Voleyvol': '🏐',
    'Farmacia': '💊',
    'Médico': '🏥',
    // Transporte
    'Taxi / Uber': '🚕',
    'Gasolina': '⛽',
    'Bus / Metro': '🚌',
    // Vivienda y más
    'Arriendo / Vivienda': '🏠',
    'Suscripciones': '📺',
    'Regalos': '🎁',
    // Ingresos
    'Ahorro': '🏦',
    'Salario': '💼',
    'Otros': '💸'
  };

  const getCategoryIcon = (category) => categoryIcons[category] || '💸';

  return { getCategoryIcon };
}
