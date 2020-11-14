import Vue from "vue"
import VueRouter from "vue-router"

import mainPage from "cmp/mainPage.vue"
import joinPage from "cmp/joinPage.vue"
import gamePage from "cmp/gamePage.vue"
import preparationPage from "cmp/preparationPage.vue"

Vue.use(VueRouter);

export default new VueRouter({
	routes: [
		{path: "/", component: mainPage},
		{path: "/feedback", component: mainPage},
		{path: "/rules", component: mainPage},
		{path: "/join", component: joinPage},
		{path: "/game", component: gamePage}
	]
})
