<template>
  <div>
    <div
        v-for="(turn, i) of turnsHistory"
        @click="turn.collapsed = !turn.collapsed"
        class="turn-layer"
        :class="{collapsed: turn.collapsed}"
        :key="i">
      <div class="turn-top">
        <div class="turn-pair">
          <h4 class="speaker">{{ turn.speaker }}</h4>
          <img src="img/long-arrow-right.png" alt="right-arrow">
          <h4 class="listener">{{ turn.listener }}</h4>
        </div>
        <div class="turn-words-cnt">{{ turn.score }}</div>
        <img src="img/arrow-down.svg" class="arrow-down" alt="arrow-down">
      </div>
      <div class="turn-bottom">
        <div
            v-for="(word, j) of turn.words"
            :key="j"
            class="word"
            :class="[word.status]">
          {{ word.word || "???" }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const turnsHistory = [
  {
    speaker: "Гений",
    listener: "Евгений",
    score: 4,
    words: [
      {
        word: "турок",
        status: "explained"
      },
      {
        word: "шерсть",
        status: "explained"
      },
      {
        word: "синхрофазотрон",
        status: "explained"
      },
      {
        word: "пятилетка",
        status: "explained"
      }, {
        status: "not-explained"
      }
    ],
    collapsed: true
  },
  {
    speaker: "Саня",
    listener: "Петя",
    score: 1,
    words: [
      {
        word: "безобразие",
        status: "explained"
      },
      {
        status: "not-explained"
      },
      {
        word: "синхрофазотрон",
        status: "mistake"
      }
    ],
    collapsed: true
  },
  {
    speaker: "Гелб",
    listener: "Федро",
    score: 2,
    words: [
      {
        word: "фасоль",
        status: "explained"
      },
      {
        word: "слив",
        status: "explained"
      },
      {
        word: "синхрофазотрон",
        status: "mistake"
      }
    ],
    collapsed: true
  }
];

for (let i = 0; i < 15; i++) {
  turnsHistory.push({
    speaker: "Гелб",
    listener: "Федро",
    score: 2,
    words: [],
    collapsed: true
  });
}

export default {
  data: function () {
    return {
      turnsHistory,
    };
  },
};
</script>
