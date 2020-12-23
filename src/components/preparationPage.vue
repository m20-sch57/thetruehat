<template>
  <body>
  <navbar
      currentPage="game"
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
  <div
      class="page"
      id="preparation">
    <roomSection
        @toggle-shown-window="toggleShownWindow()"
        :class="{collapsed: !isShownRoomSection}"/>
    <settingsSection
        @toggle-shown-window="toggleShownWindow()"
        :class="{collapsed: !isShownSettingsSection}"/>
  </div>
  </body>
</template>

<script>
import navbar from "cmp/navbar.vue";
import rules from "cmp/rulesPopup.vue";
import feedback from "cmp/feedbackPopup.vue";
import roomSection from "cmp/roomSection.vue";
import settingsSection from "cmp/settingsSection.vue";

export default {
  components: {navbar, rules, feedback, roomSection, settingsSection},
  data: function () {
    return {
      showRules: false,
      showFeedback: false,
      isShownSettingsSection: false,
      isShownRoomSection: true
    };
  },
  methods: {
    toggleShownWindow: function () {
      console.log("lol");
      this.isShownSettingsSection = !this.isShownSettingsSection;
      this.isShownRoomSection = !this.isShownRoomSection;
    }
  }
};
</script>
