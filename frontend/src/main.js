import { createApp } from 'vue'
import router from './router/router.js'
import './style.css'
import App from './App.vue'

/** Pinia */
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

/** Quasar */
import {Dialog, Loading, Notify, Quasar} from 'quasar';
import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/dist/quasar.css'

const app = createApp(App)
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate)

app.use(Quasar,{
    plugins:{
        Notify,
        Dialog,
        Loading
    }
})

app.use(pinia);
app.use(router);
app.mount('#app');
