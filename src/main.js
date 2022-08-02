import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import '../dist/style.css'

import { createApp } from 'vue'
import App from './App.vue'

import {DataTable} from "../lib/main.js";

createApp(App).component('DataTable', DataTable).mount('#app')
