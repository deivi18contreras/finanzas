/**
 * Formatea un número como moneda local (Ej. 15000 -> $15.000)
 * @param {Number} v - Valor a formatear
 * @returns {String} Valor formateado en moneda
 */
export const formatMonto = (v) => {
  if (v === undefined || v === null || isNaN(v)) return '$0';
  return (v < 0 ? '-' : '') + '$' + Math.abs(v).toLocaleString();
};
