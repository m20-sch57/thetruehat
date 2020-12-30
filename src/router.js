import Vue from "vue";
import VueRouter from "vue-router";
import mainPage from "cmp/mainPage.vue";
import newsPage from "cmp/newsPage.vue";
import faqPage from "cmp/faqPage.vue";
import aboutPage from "cmp/aboutPage.vue";
import gamePage from "cmp/gamePage.vue";

Vue.use(VueRouter);

export default new VueRouter({
    routes: [
        {path: "/",         component: mainPage,   meta: "main"},
        {path: "/news",     component: newsPage,   meta: "news"},
        {path: "/faq",      component: faqPage,    meta: "faq"},
        {path: "/about",    component: aboutPage,  meta: "about"},
        {path: "/rules",    component: mainPage,   meta: "main"},
        {path: "/feedback", component: mainPage,   meta: "main"},
        {path: "/game",     component: gamePage,   meta: "game"}
    ]
});
