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
        Подготовка
      </span>
      <span v-if="stage === 'play_explanation' && myRole === 'observer'">
        Идёт объяснение</span>
      <span v-if="myRole === 'speaker' && stage !== 'play_edit'">
        Ты объясняешь
      </span>
      <span v-if="myRole === 'listener' && stage !== 'play_edit'">
        Ты отгадываешь
      </span>
      <span v-if="stage === 'play_edit'">
        Редактирование
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
      stage: state => state.room.stage
    }),
    ...mapGetters(["myRole",])
  },
  methods: {
    toggleSound: function () {
      sound.toggleMute();
      this.muted = !this.muted;
    }
  }
};
</script>
