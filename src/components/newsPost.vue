<template>
  <section class="news-post">
    <h2 class="title">
      <slot name="title"/>
    </h2>
    <span class="date">
      {{ dateString }}
    </span>
    <span class="version">
      v{{ version }}
    </span>
    <span class="new" v-show="isNew">
      * Новое
    </span>
    <slot name="content"/>
  </section>
</template>

<script>
import {NEWS_RELEVANCE_TIME} from "src/config.js";

export default {
  name: "newsPost",
  props: {
    date: {
      type: Date,
      required: true
    },
    version: {
      type: String,
      required: true
    },
    id: {
      type: Number,
      required: true
    }
  },
  data: function () {
    return {
      isNew: JSON.parse(localStorage.readNews).indexOf(this.id) === -1 &&
          Date.now() - this.date < NEWS_RELEVANCE_TIME
    };
  },
  computed: {
    dateString: function () {
      if (this.$language.current === "ru") {
        return `${
            ("0" + this.date.getDate()).slice(-2)}.${
            ("0" + (this.date.getMonth() + 1)).slice(-2)}.${
            this.date.getFullYear()}`;
      }
      if (this.$language.current === "en") {
        return `${
            ("0" + this.date.getDate()).slice(-2)}/${
            ("0" + (this.date.getMonth() + 1)).slice(-2)}/${
            this.date.getFullYear()}`;
      }
      return "";
    }
  },
  mounted: function () {
    if (JSON.parse(localStorage.readNews).indexOf(this.id) === -1) {
      let readNews = JSON.parse(localStorage.readNews);
      readNews.push(this.id);
      localStorage.readNews = JSON.stringify(readNews);
    }
  }
};
</script>
