<template>
  <div class="page" id="wordCollection">
    <article class="window">
      <header>
        <h1>
          <ru>Набор слов</ru>
          <en>Word collection</en>
        </h1>
      </header>
      <main>
        <label>
          <textarea
              class="textarea"
              :placeholder="$t({
                  ru: 'Введите слова в это поле, одно слово - одна строчка',
                  en: 'Put your words here, one per line'
              })"
              v-model="wordsSourceText"
              :disabled="ready">
          </textarea>
        </label>
      </main>
      <footer>
        <button
            class="btn btn-shadow btn-green"
            @click="wordsReady"
            v-show="!ready">
          <ru>Готово</ru>
          <en>Ready</en>
        </button>
        <h4 v-show="ready">
          <ru>Ждём остальных</ru>
          <en>Waiting for others</en>
        </h4>
      </footer>
    </article>
  </div>
</template>

<script>
import app from "src/app.js";

export default {
  data: function () {
    return {
      wordsSourceText: "",
      ready: false
    };
  },

  methods: {
    wordsReady: function () {
      let wordSeparator = "\n";
      let words = this.wordsSourceText.split(wordSeparator).map(x => x.trim()).filter(x => x !== "");
      app.wordsReady(words);
      this.ready = true;
    }
  }
};
</script>
