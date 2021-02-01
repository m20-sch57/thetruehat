<template>
  <article id="playTurn">
    <turn-title @swipe-to="$emit('swipe-to', $event)"/>
    <main class="scrollable-wrapper">
      <div class="scrollable">
        <div id="editScreen">
          <div
              v-for="({word, wordState}, i) of editWords"
              class="word-row"
              :key="i">
            <h3 class="word">{{word}}</h3>
            <div class="options">
              <button
                  @click="setWordState(i, 'explained')"
                  :class="{active: wordState === 'explained'}"
                  class="btn-nav option guessed">
                Угадал
              </button>
              <button
                  @click="setWordState(i, 'notExplained')"
                  :class="{active: wordState === 'notExplained'}"
                  class="btn-nav option not-guessed">
                Не угадал
              </button>
              <button
                  @click="setWordState(i, 'mistake')"
                  :class="{active: wordState === 'mistake'}"
                  class="btn-nav option mistake">
                Ошибка
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
    <footer id="editScreenFooter">
      <button
          class="btn btn-green btn-shadow confirm"
          @click="acceptEditedWords">
        Подтвердить
      </button>
    </footer>
  </article>
</template>

<script>
import turnTitle from "cmp/playTurnSectionTitle.vue";

import app from "src/app.js";

export default {
  name: "editScreen",

  components: {turnTitle},

  data: function () {
    return {
      editWords: this.$store.state.room.editWords
    };
  },

  methods: {
    setWordState: function (i, state) {
      this.editWords[i].wordState = state;
    },
    acceptEditedWords: function () {
      app.editWords(this.editWords);
    }
  }
};
</script>
