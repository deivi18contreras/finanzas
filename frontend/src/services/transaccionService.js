import { getData, postData, deleteData } from "./apiService.js";

export const transaccionService = {
  async crear(datos) {
    return await postData("/transaction", datos);
  },

  async obtenerPorMes(anio, mes) {
    return await getData("/transaction/historial", { anio, mes });
  },

  async eliminar(id) {
    return await deleteData(`/transaction/${id}`);
  }
};
