import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { authService } from "../services/authService.js"

export const useAuthStore = defineStore("auth", () => {
    const token = ref(localStorage.getItem('auth_token') || "")
    const usuario = ref(null)
    const cargando = ref(false)

    const estaAutenticado = computed(() => !!token.value)
    
    const inicialesUsuario = computed(() => {
        if (!usuario.value || !usuario.value.nombre) return 'U'
        return usuario.value.nombre.split(' ').map(n => n[0]).join('').toUpperCase()
    })

    const iniciarSesion = async (email, password) => {
        cargando.value = true
        try {
            const data = await authService.login(email, password)
            if (data.success) {
                token.value = data.token
                usuario.value = data.usuario
            }
            return data
        } catch (error) {
            limpiarSesion()
            throw error
        } finally {
            cargando.value = false
        }
    }

    const registrarUsuario = async ({nombre, email, password}) => {
        cargando.value = true
        try {
            return await authService.registrar(nombre, email, password)
        } catch (error) {
            throw error
        } finally {
            cargando.value = false
        }
    }

    const cerrarSesion = () => {
        authService.logout()
        limpiarSesion()
    }

    const limpiarSesion = () => {
        usuario.value = null
        token.value = ""
    }

    return {
        token,
        usuario,
        cargando,
        estaAutenticado,
        inicialesUsuario,
        iniciarSesion,
        registrarUsuario,
        cerrarSesion
    }
},
{
    persist: true 
})