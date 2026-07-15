import { ref } from 'vue';

// Mapa de palabras clave a Emojis
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

// Mapa de Material Icons a Emojis
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

export function useCategoryEmoji() {
  /**
   * Resuelve el emoji correspondiente basado en el nombre y el icono de la categoría
   * @param {String} nombre - Nombre de la categoría
   * @param {String} [icono] - Icono opcional de la categoría
   * @returns {String} Emoji resuelto
   */
  const resolverEmoji = (nombre, icono) => {
    if (!nombre) return '🏷️';
    
    // 1. Intentar resolver por el icono de material designado
    if (icono && ICON_NAME_MAP[icono]) {
      return ICON_NAME_MAP[icono];
    }
    
    // 2. Si el icono ya es un emoji (carácter Unicode especial)
    if (icono) {
      const codePoint = icono.codePointAt(0);
      if (codePoint && codePoint > 127) return icono;
    }
    
    // 3. Buscar coincidencias de palabras clave en el nombre
    const lower = nombre.toLowerCase();
    for (const entry of EMOJI_MAP) {
      if (entry.keys.some(k => lower.includes(k))) {
        return entry.emoji;
      }
    }
    
    return '💸'; // Emoji por defecto para gastos sin coincidencia
  };

  return {
    resolverEmoji,
    EMOJI_MAP,
    ICON_NAME_MAP
  };
}
