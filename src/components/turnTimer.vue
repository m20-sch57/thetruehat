<template>
  <h2
      v-if="explanationTimer === 'delay'"
      :style="{
        'animation-duration': `${settings.delayTime}ms`,
        'animation-delay': `${animationDelay}ms`
      }"
      class="delay-timer">
    {{ delayTimeSec }}
  </h2>
  <h2
      v-else-if="explanationTimer === 'explanation'"
      class="explanation-timer">
    {{ explanationTime }}
  </h2>
  <h2
      v-else-if="explanationTimer === 'aftermath'"
      class="aftermath-timer">
    {{ aftermathTime }}
  </h2>
</template>

<script>
import {sound, countdownSound, startSound, final1Sound, final2Sound} from "src/tools";
import {animate, minSec, secMsec} from "src/tools";
import {timeSync} from "src/tools";
import {mapState} from "vuex";

export default {
  name: "turnTimer",

  data: function () {
    return {
      delayTimeSec: 0,
      aftermathTimeMsec: 0,
      explanationTimeSec: 0,
      animationDelay: 0
    };
  },

  computed: {
    ...mapState({
      stage: state => state.room.stage,
      explanationStartTime: state => state.room.startTime,
      settings: state => state.room.settings,
      roundId: state => state.room.roundId,
      explanationTimer: state => state.room.explanationTimer
    }),
    delayStartTime: function () {
      return this.explanationStartTime - this.settings.delayTime;
    },
    aftermathStartTime: function () {
      return this.explanationStartTime + this.settings.explanationTime;
    },
    explanationTime: function () {
      return minSec(this.explanationTimeSec);
    },
    aftermathTime: function () {
      if (this.aftermathTimeMsec !== 0) return secMsec(this.aftermathTimeMsec);
      return "время истекло";
    }
  },

  methods: {
    playSounds: function () {
      const roundId = this.$store.state.room.roundId;
      const stopCondition = () => roundId !== this.$store.state.room.roundId;
      const aftermathEndTime = this.aftermathStartTime + this.settings.aftermathTime;
      sound.playSound(startSound, this.explanationStartTime, stopCondition);
      sound.playSound(final1Sound, this.aftermathStartTime, stopCondition);
      sound.playSound(final2Sound, aftermathEndTime, stopCondition);
      for (let i = 1; i <= Math.floor(this.settings.delayTime / 1000); i++) {
        sound.playSound(countdownSound, this.explanationStartTime - 1000 * i, stopCondition);
      }
    },
    animateTimers: async function () {
      const roundId = this.$store.state.room.roundId;
      this.animationDelay = this.delayStartTime - timeSync.getTime();
      await this.animateDelayTimer(this.delayStartTime, roundId);
      await this.animateExplanationTimer(this.explanationStartTime, roundId);
      await this.animateAftermathTimer(this.aftermathStartTime, roundId);
    },
    animateDelayTimer: async function (startTime, roundId) {
      await animate({
        startTime,
        duration: this.settings.delayTime,
        draw: (progress) => {
          this.delayTimeSec = Math.ceil((1 - progress) * this.settings.delayTime / 1000);
        },
        stopCondition: () => {
          return roundId !== this.$store.state.room.roundId;
        }
      });
    },
    animateExplanationTimer: async function (startTime, roundId) {
      await animate({
        startTime,
        duration: this.settings.explanationTime,
        draw: (progress) => {
          this.explanationTimeSec =
              Math.ceil((1 - progress) * this.settings.explanationTime / 1000);
        },
        stopCondition: () => {
          return roundId !== this.$store.state.room.roundId;
        }
      });
      this.explanationTimeSec = 0;
    },
    animateAftermathTimer: async function (startTime, roundId) {
      this.aftermathTimeMsec = Math.ceil(this.settings.aftermathTime / 100);
      await animate({
        startTime,
        duration: this.settings.aftermathTime,
        draw: (progress) => {
          this.aftermathTimeMsec =
              Math.ceil((1 - progress) * this.settings.aftermathTime / 100);
        },
        stopCondition: () => {
          return roundId !== this.$store.state.room.roundId;
        }
      });
      this.aftermathTimeMsec = 0;
    }
  },

  created: function () {
    this.$watch(() => (this.stage === "play_explanation"),
      function (val) {
        if (val) {
          this.playSounds();
          this.animateTimers();
        }
      },
      {immediate: true}
    );
  },

};
</script>
