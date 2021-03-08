<template>
  <article class="window" id="playTurn">
    <slot/>
    <main class="scrollable-wrapper">
      <div class="scrollable">
        <div id="observationScreen">
          <div class="turn-pair">
            <div class="player speaker">
              <div class="player-icon">
                <span class="fas fa-microphone-alt"></span>
              </div>
              <div class="player-main">
                <h2 class="name">{{ speaker }}</h2>
                <h3 class="action">
                  <ru>объясняет</ru>
                  <en>explains</en>
                </h3>
              </div>
            </div>
            <div class="middle">
              <timer
                  :key="roundId"
                  v-show="stage === 'play_explanation'"/>
              <img
                  src="img/long-arrow-right.png"
                  alt="right-arrow"
                  v-show="stage !== 'play_explanation'"
              />
            </div>
            <div class="player listener">
              <div class="player-icon">
                <span class="fas fa-headphones-alt"></span>
              </div>
              <div class="player-main">
                <h2 class="name">{{ listener }}</h2>
                <h3 class="action">
                  <ru>отгадывает</ru>
                  <en>guesses</en>
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <footer
        :class="{hidden: myRole !== 'observer' && stage !== 'play_wait'}"
        id="observationScreenFooter">
      <button
          class="btn btn-green btn-shadow ready"
          v-show="myRole === 'speaker' && stage ==='play_wait'"
          :disabled="ready"
          @click="getReady">
        <ru>Я готов объяснять</ru>
        <en>I am ready to explain</en>
      </button>
      <button
          class="btn btn-blue btn-shadow ready"
          v-show="myRole === 'listener' && stage ==='play_wait'"
          :disabled="ready"
          @click="getReady">
        <ru>Я готов отгадывать</ru>
        <en>I am ready to guess</en>
      </button>
      <h3
          class="your-status"
          v-show="myRole === 'observer' && timetableInfo.turnsCount > 0">
        <ru>
          Ты {{ timetableInfo.myNextRole === "speaker" ? "объясняешь" : "отгадываешь" }} через
          {{ timetableInfo.turnsCount }} хода
        </ru>
        <en>
          You {{ timetableInfo.myNextRole === "speaker" ? "explain" : "guess" }} in
          {{ timetableInfo.turnsCount }} turns
        </en>
      </h3>
      <h3
          class="your-status"
          v-show="myRole === 'observer' && timetableInfo.turnsCount === 0">
        <ru>
          Ты {{ timetableInfo.myNextRole === "speaker" ? "объясняешь" : "отгадываешь" }}
          на <span class="full">следующем</span><span class="short">след.</span> ходу
        </ru>
        <en>
          You {{ timetableInfo.myNextRole === "speaker" ? "explain" : "guess" }}
          on the <span class="full">next</span><span class="short">next</span> turn
        </en>
      </h3>
    </footer>
  </article>
</template>

<script>
import timer from "cmp/turnTimer.vue";

import {mapGetters, mapState} from "vuex";
import app from "src/app.js";

export default {
  name: "observationScreen",
  components: {timer},
  data: function () {
    return {
      ready: false
    };
  },
  computed: {
    ...mapState({
      stage: state => state.room.stage,
      speaker: state => state.room.speaker,
      listener: state => state.room.listener,
      roundId: state => state.room.roundId,
    }),
    ...mapGetters(["myRole", "timetableInfo"])
  },
  methods: {
    getReady: function () {
      app.getReady();
      this.ready = true;
    }
  },
  watch: {
    roundId: function () {
      this.ready = false;
    }
  }
};
</script>
