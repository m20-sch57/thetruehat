<template>
  <article>
    <header>
      <h1>
        <ru>Набор слов</ru>
        <en draft>Word collection</en>
      </h1>
    </header>
    <main>
      <p>
        <ru>
          Введите слова в поле ниже. Одно слово - одна строчка. Если одно и тоже слово введут несколько человек, в шляпе оно встретится ровно один раз.
        </ru>
        <en draft> Please, put your words here.</en>
      </p>
      <textarea v-model="wordsSourceText"></textarea>
    </main>
    <footer>
      <button
          v-show="!ready"
          @click="wordsReady">
        <ru>Готово</ru>
        <en draft>Ready</en>
      </button>
      <button
          disabled
          v-show="ready">
        <ru>Ждём остальных</ru>
        <en draft>Waiting</en>
      </button>
    </footer>
  </article>
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
