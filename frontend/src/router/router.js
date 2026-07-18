import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../store/auth.js';

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/LoginView.vue'),
        meta: { requiereAuth: false }
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('../views/Register.vue'),
        meta: { requiereAuth: false }
    },
    {
        path: '/forgot-password',
        name: 'ForgotPassword',
        component: () => import('../views/ForgotPassword.vue'),
        meta: { requiereAuth: false }
    },
    {
        path: '/reset-password/:token',
        name: 'ResetPassword',
        component: () => import('../views/ResetPassword.vue'),
        meta: { requiereAuth: false }
    },
    {
        path: '/mantenimiento',
        name: 'Mantenimiento',
        component: () => import('../views/MantenimientoView.vue'),
        meta: { requiereAuth: false }
    },
    {
        path: '/',
        component: () => import('../layouts/MainLayout.vue'),
        meta: { requiereAuth: true },
        children: [
            {
                path: '',
                name: 'Dashboard',
                component: () => import('../views/Dashboard.vue')
            },
            {
                path: 'transacciones',
                name: 'Transacciones',
                component: () => import('../views/TransaccionesView.vue')
            },
            {
                path: 'deudas',
                name: 'Deudas',
                component: () => import('../views/DeudasView.vue')
            },
            {
                path: 'categorias',
                name: 'Categorias',
                component: () => import('../views/CategoriasView.vue')
            },
            {
                path: 'presupuestos',
                name: 'Presupuestos',
                component: () => import('../views/PresupuestoView.vue')
            },
            {
                path: 'gastos-fijos',
                name: 'GastosFijos',
                component: () => import('../views/GastosFijosView.vue')
            },
            {
                path: 'ahorros',
                name: 'Ahorros',
                component: () => import('../views/AhorrosView.vue')
            }
        ]
    }

];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

router.beforeEach((to, from) => {
    const authStore = useAuthStore();
    const autenticado = authStore.estaAutenticado;

    if (to.meta.requiereAuth && !autenticado) {
        return { name: 'Login' };
    } else if (!to.meta.requiereAuth && autenticado && ['Login', 'Register', 'ForgotPassword', 'ResetPassword'].includes(to.name)) {
        return { name: 'Dashboard' };
    }
});

export default router;