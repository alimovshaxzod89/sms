import {createApp} from 'vue';
import 'ant-design-vue/dist/reset.css';
import '@/styles/main.css';
import {createPinia} from "pinia";

// import i18nFactory from '@/utils/i18n';
import Antd from 'ant-design-vue';
import App from './App.vue';
import { router } from './routers';
import utc from 'dayjs/plugin/utc';
import dayjs from "dayjs";
import 'dayjs/locale/uz-latn';

dayjs.locale('uz-latn');
dayjs.extend(utc);

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.use(Antd);

// const i18n = i18nFactory();
// app.use(i18n);
app.use(router);



app.mount('#app');