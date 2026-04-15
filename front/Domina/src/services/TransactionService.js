import { getData, postData, putData, deleteData } from './apiService';

const ENDPOINT = '/transactions';

export const TransactionService = {
  // Obtener historial con filtros (paginación, fechas, categoría, tipo)
  getAll: (params) => getData(ENDPOINT, params),

  // Resumen (Balance, Ingresos, Gastos)
  getSummary: () => getData(`${ENDPOINT}/summary`),

  // Gastos por categoría (acepta startDate/endDate)
  getStats: (params) => getData(`${ENDPOINT}/stats/categories`, params),

  // Evolución mensual (ahora incluye income y expense)
  getEvolution: () => getData(`${ENDPOINT}/stats/evolution`),

  // Fase 4.2 — Insight mensual (comparativa mes actual vs anterior)
  getInsights: () => getData(`${ENDPOINT}/stats/insights`),

  // Crear nuevo movimiento
  create: (data) => postData(ENDPOINT, data),

  // Editar movimiento
  update: (id, data) => putData(`${ENDPOINT}/${id}`, data),

  // Eliminar movimiento
  delete: (id) => deleteData(`${ENDPOINT}/${id}`)
};