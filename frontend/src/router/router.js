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
            }
        ]
    }

];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const autenticado = authStore.estaAutenticado;

    if (to.meta.requiereAuth && !autenticado) {
        next({ name: 'Login' });
    } else if (!to.meta.requiereAuth && autenticado && (to.name === 'Login' || to.name === 'Register')) {
        next({ name: 'Dashboard' });
    } else {
        next();
    }
});

export default router;