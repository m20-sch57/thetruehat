<template>
  <body>
    <navbar
        :currentPage="$route.meta.nav"
        @show-rules="showRules = true"
        @show-feedback="showFeedback = true"
    />
    <rules-popup
        v-show="showRules"
        @close="showRules = false"
    />
    <feedback-popup
        v-show="showFeedback"
        @close="showFeedback = false"
    />
    <router-view
        @show-feedback="showFeedback = true"
        @show-rules="showRules = true"
    />
  </body>
</template>

<script>
import navbar from "cmp/navbar.vue";
import rulesPopup from "cmp/rulesPopup.vue";
import feedbackPopup from "cmp/feedbackPopup.vue";

export default {
  components: {navbar, rulesPopup, feedbackPopup},
  data: function () {
    return {
      showRules: false,
      showFeedback: false
    };
  }
};
</script>
