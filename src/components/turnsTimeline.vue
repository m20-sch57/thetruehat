<template>
  <div class="turns">
    <div class="next-turn">
      <h3>Следующий ход</h3>
      <div class="turn-layer">
        <div class="turn-top">
          <div class="turn-pair" v-if="nextTurn">
            <h4 class="speaker">{{ nextTurn.speaker }}</h4>
            <img src="img/long-arrow-right.png" alt="right-arrow">
            <h4 class="listener">{{ nextTurn.listener }}</h4>
          </div>
          <div v-else>
            конец игры
          </div>
        </div>
      </div>
    </div>
    <div class="current-turn">
      <h3>Этот ход</h3>
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
    <div class="previous-turns">
      <h3>Предыдущие ходы</h3>
      <turns-history/>
    </div>
  </div>
</template>

<script>
import store from "src/store.js";

import turnsHistory from "cmp/turnsHistory.vue";

const room = store.state.room;

export default {
  name: "turnsTimeline",
  components: {turnsHistory},
  computed: {
    nextTurn: function () {
      return room.timetable[1];
    },
    currentTurn: function () {
      return {
        speaker: room.speaker,
        listener: room.listener
      };
    }
  },
};
</script>
