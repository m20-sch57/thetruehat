<template>
  <article id="playTurn">
    <turn-title @swipe-to="$emit('swipe-to', $event)"/>
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
                <h3 class="action">объясняет</h3>
              </div>
            </div>
            <div class="middle">
              <timer
                  :key="roundId"
                  v-show="substate === 'explanation' || substate === 'explanationDelay'"/>
              <img
                  src="img/long-arrow-right.png"
                  alt="right-arrow"
                  v-show="substate !== 'explanation' && substate !== 'explanationDelay'"
              />
            </div>
            <div class="player listener">
              <div class="player-icon">
                <span class="fas fa-headphones-alt"></span>
              </div>
              <div class="player-main">
                <h2 class="name">{{ listener }}</h2>
                <h3 class="action">отгадывает</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <footer
        :class="{hidden: myRole !== 'observer' && substate !== 'wait'}"
        id="observationScreenFooter">
      <button
          class="btn btn-green btn-shadow ready"
          v-show="myRole === 'speaker' && substate ==='wait'"
          :disabled="ready"
          @click="getReady">
        Я готов объяснять
      </button>
      <button
          class="btn btn-blue btn-shadow ready"
          v-show="myRole === 'listener' && substate ==='wait'"
          :disabled="ready"
          @click="getReady">
        Я готов отгадывать
      </button>
      <h3
          class="your-status"
          v-show="myRole === 'observer' && timetableInfo.turnsCount > 0">
        Ты {{ timetableInfo.myNextRole === "speaker" ? "объясняешь" : "отгадываешь" }} через
        {{ timetableInfo.turnsCount }} хода
      </h3>
      <h3
          class="your-status"
          v-show="myRole === 'observer' && timetableInfo.turnsCount === 0">
        Ты {{ timetableInfo.myNextRole === "speaker" ? "объясняешь" : "отгадываешь" }} на следующем ходу
      </h3>
    </footer>
  </article>
</template>

<script>
import timer from "cmp/turnTimer.vue";
import turnTitle from "cmp/playTurnSectionTitle.vue";

import {mapGetters, mapState} from "vuex";
import app from "src/app.js";

export default {
  name: "observationScreen",

  components: {timer, turnTitle},

  data: function () {
    return {
      ready: false
    };
  },

  computed: {
    ...mapState({
      substate: state => state.room.substate,
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
