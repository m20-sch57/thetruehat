<template>
  <article id="playInfo">
    <header>
      <h1>{{ $store.state.room.key }}</h1>
      <button
          class="btn-icon right"
          @click="$emit('swipe-to', 1)">
        <span class="fas fa-times"></span>
      </button>
    </header>
    <main class="scrollable-wrapper">
      <div class="scrollable">
        <div class="turns">
          <div class="next-turn">
            <h3>Следующий ход</h3>
            <div class="turn-layer">
              <div class="turn-top">
                <div class="turn-pair">
                  <h4 class="speaker">{{ nextTurn.speaker }}</h4>
                  <img src="img/long-arrow-right.png" alt="right-arrow">
                  <h4 class="listener">{{ nextTurn.listener }}</h4>
                </div>
              </div>
            </div>
          </div>
          <div class="current-turn">
            <h3>Этот ход</h3>
            <div class="turn-layer">
              <div class="turn-top">
                <div class="turn-pair">
                  <h4 class="speaker">{{ currentTurn.speaker }}</h4>
                  <img src="img/long-arrow-right.png" alt="right-arrow">
                  <h4 class="listener">{{ currentTurn.listener }}</h4>
                </div>
              </div>
            </div>
          </div>
          <div class="previous-turns">
            <h3>Предыдущие ходы</h3>
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
                <div class="word explained">безобразие</div>
                <div class="word not-explained">???</div>
                <div class="word mistake">синхрофазотрон</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <footer>
      <div
          class="remaining"
          v-if="$store.state.room.settings.termCondition === 'words'">
        <h1>{{ $store.state.room.wordsLeft }}</h1>
        <h4>слов</h4>
      </div>
      <div
          class="remaining"
          v-if="$store.state.room.settings.termCondition === 'turns'">
        <h1>{{ $store.state.room.turnsLeft }}</h1>
        <h4>кругов</h4>
      </div>
      <button
          v-if="$store.state.room.username === $store.state.room.host"
          class="btn btn-transparent"
          @click="endGame()">
        <span class="fas fa-flag-checkered"></span>
        Закончить
      </button>
      <button
          class="btn btn-transparent"
          @click="leaveGame()">
        <span class="fas fa-sign-out-alt"></span>
        Выйти
      </button>
    </footer>
  </article>
</template>

<script>
import app from "src/app.js";
import store from "src/store.js";

const room = store.state.room;

export default {
  name: "playInfoSection",
  data: function () {
    return {
      turnsHistory: [
        {
          speaker: "Саня",
          listener: "Петя",
          score: 7,
          collapsed: true
        },
        {
          speaker: "Гелб",
          listener: "Федро",
          score: 2,
          collapsed: true
        }
      ]
    };
  },
  computed: {
    nextTurn: function () {
      return {
        speaker: room.timetable[1].speaker,
        listener: room.timetable[1].listener
      };
    },
    currentTurn: function () {
      return {
        speaker: room.speaker,
        listener: room.listener
      };
    }
  },
  methods: {
    endGame: function () {
      app.finish();
    },
    leaveGame: function () {
      app.leaveRoom();
    }
  }
};
</script>
