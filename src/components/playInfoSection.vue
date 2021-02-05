<template>
  <article
      :class="{
        topShadow: !maxTopScroll,
        bottomShadow: !maxBottomScroll
      }"
      id="playInfo">
    <header>
      <h1>{{ $store.state.room.key }}</h1>
      <button
          class="btn-icon btn-transparent close"
          @click="$emit('hide-menu')">
        <span class="fas fa-times"></span>
      </button>
    </header>
    <main class="scrollable-wrapper">
      <div
          class="scrollable"
          v-scroll-top="maxTopScroll"
          v-scroll-bottom="maxBottomScroll">
        <turns-timeline/>
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
          v-if="$store.state.room.settings.termCondition === 'rounds'">
        <h1>{{ $store.state.room.roundsLeft }}</h1>
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
import {scrollTop, scrollBottom} from "src/tools";

import turnsTimeline from "cmp/turnsTimeline.vue";

export default {
  name: "playInfoSection",

  components: {turnsTimeline},

  data: function () {
    return {
      maxTopScroll: true,
      maxBottomScroll: true
    };
  },

  methods: {
    endGame: function () {
      app.finish();
    },
    leaveGame: function () {
      app.leaveRoom();
    }
  },

  directives: {scrollTop, scrollBottom}
};
</script>
