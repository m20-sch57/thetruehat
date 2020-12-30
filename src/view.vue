<template>
  <body>
    <navbar
        :currentPage="$route.meta.nav"
        @show-rules="showRules = true"
        @show-feedback="showFeedback = true"
    />
    <rules
        v-show="showRules"
        @close="showRules = false"
    />
    <feedback
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
import rules from "cmp/rulesPopup.vue";
import feedback from "cmp/feedbackPopup.vue";

export default {
  components: {navbar, rules, feedback},
  data: function () {
    return {
      showRules: false,
      showFeedback: false
    };
  }
};
</script>
