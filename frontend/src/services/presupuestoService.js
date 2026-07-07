import { getData, postData, deleteData } from "./apiService.js";

export const presupuestoService = {
  async obtenerProgreso(mes, anio) {
    return await getData("/presupuesto/progreso", { mes, anio });
  },

  async guardar(datos) {
    return await postData("/presupuesto", datos);
  },

  async eliminar(presupuestoId) {
    return await deleteData(`/presupuesto/${presupuestoId}`);
  }
};
