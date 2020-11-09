import Vue from "vue"

import * as config from "./config.js"
import view from "./view.vue"
import router from "./router.js"
import store from "./store.js"
import app from "./app.js"
import {VERSION, HASH} from "./version.js"

Vue.component("version", {
	functional: true,
	render: h => h("span", VERSION)
})

let vue = new Vue({
	router,
	store,
	el: "#app",
	render: h => h(view)
})

app.debug = config.DEBUG;

if (config.DEBUG) {
	window.VERSION = VERSION;
	window.HASH = HASH;
}
