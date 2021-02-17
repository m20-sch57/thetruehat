<template>
  <article class="window" id="playTurn">
    <slot/>
    <main class="scrollable-wrapper">
      <div class="scrollable">
        <div id="explanationScreen">
          <div class="word-timer">
            <h1 class="word" id="word-container">
              <word :max-word-width="maxWordWidth" :max-font-size="50"/>
            </h1>
            <timer :key="roundId"/>
          </div>
        </div>
      </div>
    </main>
    <footer id="explanationScreenFooter">
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
import word from "cmp/word.vue";

import {mapState} from "vuex";
import app from "src/app.js";
import throttle from "lodash/throttle";
import {GAME_BUTTON_COOLDOWN_TIME} from "src/config.js";

export default {
  name: "explanationScreen",
  components: {timer, word},
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
    explainedAction: throttle(() => app.explained(), GAME_BUTTON_COOLDOWN_TIME, {trailing: false}),
    notExplainedAction: throttle(() => app.notExplained(), GAME_BUTTON_COOLDOWN_TIME, {trailing: false}),
    mistakeAction: throttle(() => app.mistake(), GAME_BUTTON_COOLDOWN_TIME, {trailing: false}),
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
