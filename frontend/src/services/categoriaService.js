import { getData, postData, deleteData } from "./apiService.js";

export const categoriaService = {
  async obtener(tipo) {
    return await getData("/categoria", { tipo });
  },

  async crear(datos) {
    return await postData("/categoria", datos);
  },

  async eliminar(categoriaId) {
    return await deleteData(`/categoria/${categoriaId}`);
  }
};
