import Vue from "vue"

import * as config from "./config.js"
import view from "./view.vue"
import router from "./router.js"
import {VERSION, HASH} from "./version.js"

Vue.component("version", {
	functional: true,
	render: h => h("span", VERSION)
})

let vue = new Vue({
	router,
	el: "#app",
	render: h => h(view)
})

if (config.DEBUG) {
	window.VERSION = VERSION;
	window.HASH = HASH;
}
