import {createApp} from 'vue';
import 'ant-design-vue/dist/reset.css';
import '@/styles/main.css';
import {createPinia} from "pinia";

import Antd from 'ant-design-vue';
import App from './App.vue';
import { router } from './routers';


const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(Antd);
app.use(router);


app.mount('#app');