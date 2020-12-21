import Vue from "vue"

import * as config from "./config.js"
import view from "./view.vue"
import router from "./router.js"
import store from "./store.js"
import app from "./app.js"
import {VERSION, HASH} from "./version.js"
import {timeSync} from "./tools"

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

timeSync.maintainDelta(config.TIME_SYNC_DELTA);
timeSync.debug = config.DEBUG;
app.debug = config.DEBUG;

if (config.DEBUG) {
    window.vue = vue
    window.app = app;
    window.VERSION = VERSION;
    window.HASH = HASH;
}
