import { getData, postData, deleteData, putData } from "./apiService.js";

export const categoriaService = {
  async obtener(tipo) {
    return await getData("/categoria", { tipo });
  },

  async crear(datos) {
    return await postData("/categoria", datos);
  },

  async editar(categoriaId, datos) {
    return await putData(`/categoria/${categoriaId}`, datos);
  },

  async eliminar(categoriaId) {
    return await deleteData(`/categoria/${categoriaId}`);
  }
};
