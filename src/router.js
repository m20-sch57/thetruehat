import Vue from "vue"
import VueRouter from "vue-router"

import mainPage from "cmp/mainPage.vue"
import newsPage from "cmp/newsPage.vue"
import faqPage from "cmp/faqPage.vue"
import aboutPage from "cmp/aboutPage.vue"
import joinPage from "cmp/joinPage.vue"
import gamePage from "cmp/gamePage.vue"
import rulesPopup from "cmp/rulesPopup.vue"
import feedbackPopup from "cmp/feedbackPopup.vue"

Vue.use(VueRouter);

export default new VueRouter({
    routes: [
        {path: "/", component: mainPage},
        {path: "/news", component: newsPage},
        {path: "/faq", component: faqPage},
        {path: "/about", component: aboutPage},
        {path: "/rules", component: rulesPopup},
        {path: "/feedback", component: feedbackPopup},
        {path: "/join", component: joinPage},
        {path: "/game", component: gamePage}
    ]
})
