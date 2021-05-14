<template>
  <header>
    <button
        :style="{visibility: isMenuHidden ? 'visible' : 'hidden'}"
        class="btn-icon btn-transparent expand"
        @click="$emit('show-menu')">
      <span class="fas fa-angle-right"></span>
    </button>
    <h1>
      <span v-if="stage === 'play_wait' && myRole === 'observer'">
        <ru>Подготовка</ru>
        <en>Preparing</en>
      </span>
      <span v-if="stage === 'play_explanation' && myRole === 'observer'">
        <ru>Идёт объяснение</ru>
        <en>Explaining</en>
      </span>
      <span v-if="myRole === 'speaker' && (stage === 'play_wait' ||
          explanationTimer === 'delay' || playersCount == 2)">
        <ru>Ты объясняешь</ru>
        <en>You explain</en>
      </span>
      <span v-if="myRole === 'speaker' && stage === 'play_explanation' &&
          explanationTimer !== 'delay' && playersCount > 2">
        <ru>Угадывает</ru>
        <en draft>Guesses</en>
        {{ listener }}
      </span>
      <span v-if="myRole === 'listener' && stage !== 'play_edit'">
        <ru>Ты отгадываешь</ru>
        <en>You guess</en>
      </span>
      <span v-if="stage === 'play_edit'">
        <ru>Редактирование</ru>
        <en>Editing</en>
      </span>
    </h1>
    <button
        class="btn-icon btn-transparent volume"
        @click="toggleSound">
      <span
          v-show="!muted"
          class="fas fa-volume-up">
      </span>
      <span
          v-show="muted"
          class="fas fa-volume-mute">
      </span>
    </button>
  </header>
</template>

<script>
import {sound} from "src/tools";
import {mapGetters, mapState} from "vuex";

export default {
  name: "playTurnSectionTitle",
  props: {
    isMenuHidden: Boolean
  },
  data: function () {
    return {
      muted: sound.isMuted
    };
  },
  computed: {
    ...mapState({
      stage: state => state.room.stage,
      listener: state => state.room.listener,
      explanationTimer: state => state.room.explanationTimer
    }),
    ...mapGetters(["myRole",]),
    playersCount: function() {
      return this.$store.state.room.players.length;
    }
  },
  methods: {
    toggleSound: function () {
      sound.toggleMute();
      this.muted = !this.muted;
    }
  }
};
</script>
