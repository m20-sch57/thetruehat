<template>
  <div>
    <div
        v-for="(turn, i) of turnsHistory"
        @click="turn.collapsed = !turn.collapsed"
        class="turn-layer"
        :class="{collapsed: turn.collapsed}"
        :key="i">
      <div class="turn-top">
        <div class="turn-pair">
          <h4 class="speaker">{{ turn.speaker }}</h4>
          <img src="img/long-arrow-right.png" alt="right-arrow">
          <h4 class="listener">{{ turn.listener }}</h4>
        </div>
        <div class="turn-words-cnt">{{ turn.score }}</div>
        <img src="img/arrow-down.svg" class="arrow-down" alt="arrow-down">
      </div>
      <div class="turn-bottom">
        <div
            v-for="(word, j) of turn.words"
            :key="j"
            class="word"
            :class="[word.status]">
          {{ word.word || "???" }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapState} from "vuex";

export default {
  computed: {
    ...mapState({
      turnsHistory: state => state.room.turnsHistory
    })
  }
};
</script>
