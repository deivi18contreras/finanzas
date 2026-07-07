import axiosInstance from "../plugins/axios.js";

export const ocrService = {
  async escanear(archivo) {
    const formData = new FormData();
    formData.append("imagenFactura", archivo);
    const response = await axiosInstance.post("/ocr/escaner", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return response.data;
  }
};
