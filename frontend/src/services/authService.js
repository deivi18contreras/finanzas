import { postData } from "./apiService.js";

export const authService = {
    async registrar(nombre, email, password) {
        return await postData('/auth/register', {nombre, email, password})
    },

    async login(email, password){
        return await postData('/auth/login', {email, password})
    },

    async solicitarRecuperacion(email) {
        return await postData('/auth/forgot-password', { email })
    },

    async restablecerPassword(token, password) {
        return await postData(`/auth/reset-password/${token}`, { password })
    },

    logout(){
        localStorage.removeItem('auth_token')
    }
};