import Vue from "vue"
import VueRouter from "vue-router"

import mainPage from "_/pages/main.vue"
import joinPage from "_/pages/join.vue"
import helpPage from "_/pages/help.vue"
import feedbackPage from "_/pages/feedback.vue"
import gamePage from "_/pages/game.vue"
import gameSettings from "_/pages/settings.vue"
import resultsPage from "_/pages/results.vue"
import notFoundPage from "_/pages/notFound.vue"

Vue.use(VueRouter);

export default new VueRouter({
	routes: [
		{path: "/", component: mainPage},
		{path: "/join", component: joinPage},
		{path: "/help/:option", component: helpPage},
		{path: "/feedback", component: feedbackPage},
		{path: "/game", component: gamePage},
		{path: "/game/settings", component: gameSettings},
		{path: "/results", component: resultsPage},
		{path: "/:k([A-Za-zА-Яа-я]+)", component: joinPage},
		{path: "*", component: notFoundPage}
	]
})
