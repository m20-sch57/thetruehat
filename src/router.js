import Vue from "vue"
import VueRouter from "vue-router"

import mainPage from "_/mainPage.vue"
import joinPage from "_/joinPage.vue"
import gamePage from "_/gamePage.vue"
import preparationPage from "_/preparationPage.vue"

Vue.use(VueRouter);

export default new VueRouter({
	routes: [
		{path: "/", component: mainPage},
		{path: "/join", component: joinPage},
		{path: "/game", component: gamePage}
	]
})
