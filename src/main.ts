import "./assets/main.css";
import 'virtual:uno.css'

import './request';

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import i18n from "./i18n";
import ArcoVue from "@arco-design/web-vue";
import ArcoVueIcon from '@arco-design/web-vue/es/icon';
import "@arco-design/web-vue/dist/arco.css";

import Dialog from "./LeaferEditor/layouts/components/dialog";

const app = createApp(App);
app.use(i18n);
app.use(router);
app.use(ArcoVue);
app.use(ArcoVueIcon);
app.use(Dialog);

app.config.errorHandler = (err, vm, info) => {
    console.error("Global Error:", err, vm, "; \n", "Component Info:", info);
};

app.mount("#app");
