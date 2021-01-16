<template>
  <header>
    <button
        class="btn-icon left"
        @click="$emit('swipe-to', 0)">
      <span class="fas fa-angle-right"></span>
    </button>
    <h1>
      <span v-if="substate === 'wait' && myRole === 'observer'">
        Подготовка
      </span>
      <span v-if="substate === 'explanation' && myRole === 'observer'">
        Идёт объяснение</span>
      <span v-if="myRole === 'speaker' && substate !== 'edit'">
        Ты объясняешь
      </span>
      <span v-if="myRole === 'listener' && substate !== 'edit'">
        Ты отгадываешь
      </span>
      <span v-if="substate === 'edit'">
        Редактирование
      </span>
    </h1>
    <button class="btn-icon">
      <span
          v-show="!muted"
          @click="toggleSound"
          class="fas fa-volume-up">
      </span>
      <span
          v-show="muted"
          @click="toggleSound"
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

  data: function () {
    return {
      muted: sound.isMuted
    };
  },

  computed: {
    ...mapState({
      substate: state => state.room.substate
    }),
    ...mapGetters(["myRole"])
  },

  methods: {
    toggleSound: function () {
      sound.toggleMute();
      this.muted = !this.muted;
    }
  }
};
</script>
