import Vue from "vue";

import * as config from "./config.js";
import view from "cmp/view.vue";
import router from "./router.js";
import store from "./store.js";
import app from "./app.js";
import {VERSION, HASH} from "./version.js";
import {timeSync} from "./tools";

import VueTranslate from "./tools/vue-translate";

Vue.use(VueTranslate, {
    availableLanguages: ["ru", "en"],
    defaultLanguage: "ru",
    plural: {
        ru: n => n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2
        && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2,
        en: n => n === 1 ? 0 : 1
    },
    silent: !config.DEBUG
});

Vue.component("version", {
    functional: true,
    render: h => h("span", VERSION)
});

let vue = new Vue({
    router,
    store,
    el: "#app",
    render: h => h(view)
});

timeSync.maintainDelta(config.TIME_SYNC_DELTA).then();
timeSync.debug = config.DEBUG;
app.debug = config.DEBUG;

if (config.DEBUG) {
    window.vue = vue;
    window.app = app;
    window.VERSION = VERSION;
    window.HASH = HASH;
}
