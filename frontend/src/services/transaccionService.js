import { getData, postData, deleteData,putData } from "./apiService.js";

export const transaccionService = {
  async crear(datos) {
    return await postData("/transaction", datos);
  },

  async obtenerPorMes(anio, mes) {
    return await getData("/transaction/historial", { anio, mes });
  },

  async editar(id, datos) {
    return await putData(`/transaction/${id}`, datos);
},

async eliminar(id) {
    return await deleteData(`/transaction/${id}`);
}
};
