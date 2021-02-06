<template>
  <article
      class="window"
      :class="{
        topShadow: !maxTopScroll,
        bottomShadow: !maxBottomScroll
      }"
      id="playTurn">
    <slot/>
    <main class="scrollable-wrapper">
      <div
          class="scrollable custom-scroll"
          v-scroll-top="maxTopScroll"
          v-scroll-bottom="maxBottomScroll">
        <div id="editScreen">
          <div
              v-for="({word, wordState}, i) of editWords"
              class="word-row"
              :key="i">
            <h3 class="word">{{ word }}</h3>
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
import app from "src/app.js";
import {scrollTop, scrollBottom} from "src/tools";

export default {
  name: "editScreen",

  data: function () {
    return {
      editWords: this.$store.state.room.editWords,
      maxTopScroll: true,
      maxBottomScroll: true
    };
  },

  methods: {
    setWordState: function (i, state) {
      this.editWords[i].wordState = state;
    },
    acceptEditedWords: function () {
      app.editWords(this.editWords);
    }
  },

  directives: {scrollTop, scrollBottom}
};
</script>
