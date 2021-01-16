<template>
  <article id="playTurn">
    <turn-title @swipe-to="$emit('swipe-to', $event)"/>
    <main class="scrollable-wrapper">
      <div class="scrollable">
        <div class="explaining">
          <div class="word-timer">
            <h1 class="word" id="word-container">
              <word :max-word-width="maxWordWidth" :max-font-size="50"/>
            </h1>
            <timer :key="roundId"/>
          </div>
        </div>
      </div>
    </main>
    <footer>
      <div class="speaker-actions">
        <button
            class="btn btn-blue btn-shadow not-guessed"
            @click="notExplainedAction">
          Не угадал
        </button>
        <button
            class="btn btn-green btn-shadow guessed"
            @click="explainedAction">
          Угадал
        </button>
        <button
            class="btn btn-red btn-shadow mistake"
            @click="mistakeAction">
          Ошибка
        </button>
      </div>
    </footer>
  </article>
</template>

<script>
import timer from "cmp/turnTimer.vue";
import turnTitle from "cmp/playTurnSectionTitle.vue";
import word from "cmp/word.vue";

import {mapState} from "vuex";
import app from "src/app.js";
import {throttle} from "src/tools";
import {GAME_BUTTON_COOLDOWN_TIME} from "src/config.js";

export default {
  name: "explanationScreen",

  components: {timer, turnTitle, word},

  data: function () {
    return {
      maxWordWidth: 0
    };
  },

  computed: {
    ...mapState({
      roundId: state => state.room.roundId
    })
  },

  methods: {
    explainedAction: throttle(() => app.explained(), GAME_BUTTON_COOLDOWN_TIME),
    notExplainedAction: throttle(() => app.notExplained(), GAME_BUTTON_COOLDOWN_TIME),
    mistakeAction: throttle(() => app.mistake(), GAME_BUTTON_COOLDOWN_TIME),
  },

  mounted: function () {
    const wordContainer = document.getElementById("word-container");
    this.maxWordWidth = wordContainer.getBoundingClientRect().width;
    window.onresize = () => {
      this.maxWordWidth = wordContainer.getBoundingClientRect().width;
    };
  }
};
</script>
