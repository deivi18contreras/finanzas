import { getData, postData, deleteData, putData } from "./apiService.js";

export const ahorroService = {
  async obtener() {
    return await getData("/ahorros");
  },

  async crear(datos) {
    return await postData("/ahorros", datos);
  },

  async aportar(id, monto) {
    return await postData(`/ahorros/${id}/aportar`, { monto });
  },

  async retirar(id, monto) {
    return await postData(`/ahorros/${id}/retirar`, { monto });
  },

  async editar(id, datos) {
    return await putData(`/ahorros/${id}`, datos);
  },

  async eliminar(id) {
    return await deleteData(`/ahorros/${id}`);
  }
};
