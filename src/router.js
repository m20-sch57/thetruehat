import Vue from "vue"
import VueRouter from "vue-router"

import mainPage from "_/pages/main.vue"

Vue.use(VueRouter);

export default new VueRouter({
	routes: [
		{path: "/", component: mainPage},
	]
})
