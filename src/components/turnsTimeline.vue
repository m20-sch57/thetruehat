<template>
  <div class="turns">
    <div class="next-turn" v-if="nextTurn">
      <h3>
        <ru>Следующий ход</ru>
        <en>Next turn</en>
      </h3>
      <div class="turn-layer">
        <div class="turn-top">
          <div class="turn-pair">
            <h4 class="speaker">{{ nextTurn.speaker }}</h4>
            <img src="img/long-arrow-right.png" alt="right-arrow">
            <h4 class="listener">{{ nextTurn.listener }}</h4>
          </div>
        </div>
      </div>
    </div>
    <div class="current-turn">
      <h3>
        <ru>Этот ход</ru>
        <en>Current turn</en>
      </h3>
      <div class="turn-layer">
        <div class="turn-top">
          <div class="turn-pair">
            <h4 class="speaker">{{ currentTurn.speaker }}</h4>
            <img src="img/long-arrow-right.png" alt="right-arrow">
            <h4 class="listener">{{ currentTurn.listener }}</h4>
          </div>
        </div>
      </div>
    </div>
    <div class="past-turns">
      <h3>
        <ru>Прошедшие ходы</ru>
        <en>Past turns</en>
      </h3>
      <turns-history/>
    </div>
  </div>
</template>

<script>
import turnsHistory from "cmp/turnsHistory.vue";

export default {
  name: "turnsTimeline",
  components: {turnsHistory},
  computed: {
    nextTurn: function () {
      return this.$store.state.room.timetable[1];
    },
    currentTurn: function () {
      return {
        speaker: this.$store.state.room.speaker,
        listener: this.$store.state.room.listener
      };
    }
  },
};
</script>
