import { getData, postData, deleteData } from "./apiService.js";

export const deudaService = {
  async obtener() {
    return await getData("/deudas");
  },

  async crear(datos) {
    return await postData("/deudas", datos);
  },

  async registrarAbono(deudaId, montoAbonado) {
    return await postData(`/deudas/${deudaId}/abono`, { montoAbonado });
  },

  async eliminar(deudaId) {
    return await deleteData(`/deudas/${deudaId}`);
  }
};
