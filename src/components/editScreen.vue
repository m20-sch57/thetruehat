<template>
  <article id="playTurn">
    <turn-title/>
    <main class="scrollable-wrapper">

    </main>
    <footer id="editScreenFooter">
      <button
          class="btn btn-green btn-shadow ready"
          @click="acceptEditedWords">
        Безобразие, подтвердите повторную отправку формы.
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
