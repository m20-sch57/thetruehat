<template>
  <article id="playTurn">
    <turn-title @swipe-to="$emit('swipe-to', $event)"/>
    <main class="scrollable-wrapper">
      <div class="scrollable">
        <div id="editScreen">
          <div class="word-row">
            <h3 class="word">Синхрофазотрон</h3>
            <div class="options">
              <button class="btn-nav option guessed active">
                Угадал
              </button>
              <button class="btn-nav option not-guessed">
                Не угадал
              </button>
              <button class="btn-nav option mistake">
                Ошибка
              </button>
            </div>
          </div>
          <div class="word-row">
            <h3 class="word">Турок</h3>
            <div class="options">
              <button class="btn-nav option guessed active">
                Угадал
              </button>
              <button class="btn-nav option not-guessed">
                Не угадал
              </button>
              <button class="btn-nav option mistake">
                Ошибка
              </button>
            </div>
          </div>
          <div class="word-row">
            <h3 class="word">Безобразие</h3>
            <div class="options">
              <button class="btn-nav option guessed">
                Угадал
              </button>
              <button class="btn-nav option not-guessed active">
                Не угадал
              </button>
              <button class="btn-nav option mistake">
                Ошибка
              </button>
            </div>
          </div>
          <div class="word-row">
            <h3 class="word">Слив</h3>
            <div class="options">
              <button class="btn-nav option guessed">
                Угадал
              </button>
              <button class="btn-nav option not-guessed">
                Не угадал
              </button>
              <button class="btn-nav option mistake active">
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

import {mapState} from "vuex";
import app from "src/app.js";

export default {
  name: "editScreen",

  components: {turnTitle},

  computed: {
    ...mapState({
      words: state => state.room.editWords,
    })
  },

  methods: {
    acceptEditedWords: function () {
      app.editWords(this.words);
    }
  }
};
</script>
