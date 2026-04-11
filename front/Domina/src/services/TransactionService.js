import { getData, postData, putData, deleteData } from './apiService';

const ENDPOINT = '/transactions';

export const TransactionService = {
  // Obtener historial con filtros (paginación, fechas)
  getAll: (params) => getData(ENDPOINT, params),

  // Obtener el resumen (Balance, Ingresos, Gastos)
  getSummary: () => getData(`${ENDPOINT}/summary`),

  // Obtener reportes por categoría para gráficas
  getStats: (params) => getData(`${ENDPOINT}/stats/categories`, params),

  // Obtener evolución mensual para gráfica de líneas
  getEvolution: () => getData(`${ENDPOINT}/stats/evolution`),

  // Crear nuevo movimiento
  create: (data) => postData(ENDPOINT, data),

  // Editar movimiento
  update: (id, data) => putData(`${ENDPOINT}/${id}`, data),

  // Eliminar movimiento
  delete: (id) => deleteData(`${ENDPOINT}/${id}`)
};