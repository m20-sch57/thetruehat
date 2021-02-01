<template>
  <component :is="currentScreen" @swipe-to="$emit('swipe-to', $event)"/>
</template>

<script>
import explanationScreen from "cmp/explanationScreen.vue";
import observationScreen from "cmp/observationScreen.vue";
import editScreen from "cmp/editScreen.vue";

import {mapGetters, mapState} from "vuex";

export default {
  name: "playTurnSection",

  components: {explanationScreen, observationScreen, editScreen},

  computed: {
    ...mapState({
      substate: state => state.room.substate,
      explanationTimer: state => state.room.explanationTimer
    }),
    ...mapGetters(["myRole"]),
    currentScreen: function () {
      if (this.substate === "wait" || this.myRole !== "speaker") {
        return "observation-screen";
      }
      if (this.substate === "explanation" && this.explanationTimer === "delay") {
        return "observation-screen";
      }
      if (this.substate === "explanation" && !this.explanationTimer !== "delay") {
        return "explanation-screen";
      }
      if (this.substate === "edit") {
        return "edit-screen";
      }
      return "";
    }
  }
};
</script>
