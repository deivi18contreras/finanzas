import { getData, postData, putData, deleteData } from "./apiService.js";

export const gastoFijoService = {
  async obtener() {
    return await getData("/gastos-fijos");
  },

  async crear(datos) {
    return await postData("/gastos-fijos", datos);
  },

  async editar(id, datos) {
    return await putData(`/gastos-fijos/${id}`, datos);
  },

  async eliminar(id) {
    return await deleteData(`/gastos-fijos/${id}`);
  },

  async registrarTodosEsteMes() {
    return await postData("/gastos-fijos/registrar-mes", {});
  }
};