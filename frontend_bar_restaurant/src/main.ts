import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Prime Vue Configuration - class
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.min.css'

// Syle main - Personalizado
import './assets/styles/main.css'
import './assets/styles/custom.css'
import './assets/styles/forms-light.css'
import './assets/styles/form-styles.css'
import './assets/styles/dialogs.css'

// Import Bootstrap CSS and JS
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Import Font Awesome
import '@fortawesome/fontawesome-free/css/all.min.css'
// Asegurar registro JS de iconos (fallback si el CSS no pinta correctamente)
import '@fortawesome/fontawesome-free/js/all.js'

// Import Bootstrap Icons
import 'bootstrap-icons/font/bootstrap-icons.css'

// Import Animate.css
import 'animate.css'

// Import custom global styles
import './assets/styles/custom.css'
import { ToastService } from 'primevue'

const app = createApp(App)

// Pinia
const pinia = createPinia()
app.use(pinia)

// Router
app.use(router)

// Toast Service
app.use(ToastService);

// Prime Vue Configuration - instance (antes de montar)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: 'p',
      darkModeSelector: 'system',
      cssLayer: false,
    },
  },
})

app.mount('#app')
