import Vue from "vue"

import * as config from "./config.js"
import view from "./view.vue"
import router from "./router.js"
import store from "./store.js"
import app from "./app.js"

import {userWarning, timeSync} from "./lib"

let vue = new Vue({
	router,
	store,
	el: "#app",
	render: h => h(view)
})

Vue.directive("validate", {
	bind: function(el, binding) {
		el.oninput = function() {
			let caretPosition = el.selectionStart;
			let validated = binding.value(el.value, caretPosition);
			console.log(validated.value, validated.newCaretPosition)
			el.value = validated.value;
			el.selectionStart = validated.newCaretPosition;
			el.selectionEnd = validated.newCaretPosition;
		}
	}
})

timeSync.maintainDelta(config.TIME_SYNC_DELTA);
timeSync.debug = config.DEBUG;
app.debug = config.DEBUG;

if (config.DEBUG) {
	window.vue = vue;
	window.app = app;
	window.router = router;
	window.store = store;
}

if (config.ENV == config.PROD) {
	userWarning();
}
