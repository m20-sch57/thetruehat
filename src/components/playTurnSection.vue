<template>
  <component :is="currentScreen">
    <turn-title
        :isMenuHidden="isMenuHidden"
        @show-menu="$emit('show-menu')"/>
  </component>
</template>

<script>
import explanationScreen from "cmp/explanationScreen.vue";
import observationScreen from "cmp/observationScreen.vue";
import editScreen from "cmp/editScreen.vue";
import turnTitle from "cmp/playTurnSectionTitle.vue";

import {mapGetters, mapState} from "vuex";

export default {
  name: "playTurnSection",
  components: {explanationScreen, observationScreen, editScreen, turnTitle},
  props: {
    isMenuHidden: Boolean
  },
  computed: {
    ...mapState({
      stage: state => state.room.stage,
      explanationTimer: state => state.room.explanationTimer
    }),
    ...mapGetters(["myRole"]),
    currentScreen: function () {
      if (this.stage === "play_wait" || this.myRole !== "speaker") {
        return "observation-screen";
      }
      if (this.stage === "play_explanation" && this.explanationTimer === "delay") {
        return "observation-screen";
      }
      if (this.stage === "play_explanation" && !this.explanationTimer !== "delay") {
        return "explanation-screen";
      }
      if (this.stage === "play_edit") {
        return "edit-screen";
      }
      return "";
    }
  }
};
</script>
