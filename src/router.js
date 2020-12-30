import Vue from "vue";
import VueRouter from "vue-router";
import mainPage from "cmp/mainPage.vue";
import newsPage from "cmp/newsPage.vue";
import faqPage from "cmp/faqPage.vue";
import aboutPage from "cmp/aboutPage.vue";
import gamePage from "cmp/gamePage.vue";

import playPage from "cmp/playPage.vue"; // Remove then

Vue.use(VueRouter);

export default new VueRouter({
    routes: [
        {path: "/",         component: mainPage,   meta: {nav: "main"}},
        {path: "/news",     component: newsPage,   meta: {nav: "news"}},
        {path: "/faq",      component: faqPage,    meta: {nav: "faq"}},
        {path: "/about",    component: aboutPage,  meta: {nav: "about"}},
        {path: "/rules",    component: mainPage,   meta: {nav: "main"}},
        {path: "/feedback", component: mainPage,   meta: {nav: "main"}},
        {path: "/game",     component: gamePage,   meta: {nav: "game"}},
        {path: "/test",     component: playPage}
    ]
});
