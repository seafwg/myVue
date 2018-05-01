import Vue from 'vue'
import App from './app.vue'
import VueRouter from "vue-router"
import './assets/styles/global.styl'
import createRouter from './router/router'
import createStore from './store/store.js'
import Vuex from "vuex";
// const root = document.createElement('div')
// document.body.appendChild(root)

Vue.use(VueRouter);
Vue.use(Vuex);

const router = createRouter();
const store = createStore();

new Vue({
  router,//注入router
  store,//注入store
  render: (h) => h(App)
}).$mount("#root");
