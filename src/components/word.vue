<template>
  <span :style="{fontSize: fontSize + 'px'}">
    {{ word }}
  </span>
</template>

<script>
import {mapState} from "vuex";

const defaultFontSize = 40;

export default {
  name: "word",
  props: {
    maxWordWidth: {
      required: true
    },
    maxFontSize: {
      required: true
    }
  },
  data: function () {
    return {
      fontSize: defaultFontSize,
      wordContainer: null
    };
  },
  computed: {
    ...mapState({
      word: state => state.room.word
    })
  },
  methods: {
    sizeWord: function (word, maxWordWidth) {
      if (!word) return;
      const wordContainer = document.createElement("span");
      wordContainer.style.visibility = "hidden";
      wordContainer.style.position = "absolute";
      wordContainer.style.fontSize = `${defaultFontSize}px`;
      wordContainer.innerHTML = word;
      document.body.appendChild(wordContainer);
      const wordWidth = wordContainer.getBoundingClientRect().width;
      this.fontSize = Math.min(this.maxFontSize, defaultFontSize / wordWidth * maxWordWidth);
      document.body.removeChild(wordContainer);
    }
  },
  mounted: function () {
    this.sizeWord(this.word);
  },
  watch: {
    word: function (word) {
      this.sizeWord(word, this.maxWordWidth);
    },
    maxWordWidth: function (maxWordWidth) {
      this.sizeWord(this.word, maxWordWidth);
    }
  }
};
</script>
