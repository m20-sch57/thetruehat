<template>
  <div>
    <h2>Пары</h2>
    <div
        v-for="(pair, i) of pairs"
        @click="destroyPair(pair[0], pair[1])"
        :key="i">
      <span>{{pair[0]}}</span><br>
      <span>{{pair[1]}}</span>
    </div>
    <h2>Игроки</h2>
    <div
        v-for="(username, i) of lonePlayers"
        @click="selectUsername(username)"
        :key="i + 2 * pairs.length">
      <span :class="{selected: selectedUsername === username}">
        {{username}}
      </span>
    </div>
    <button @click="endStage()">
      Готово
    </button>
  </div>
</template>

<script>
import {removeByPredicat} from "src/tools";
import app from "src/app.js";

import {mapState, mapGetters} from "vuex";

export default {
  name: "pairMatchingPage",

  data: function () {
    return {
      localPairs: this.$store.state.room.pairs,
      players: this.$store.state.room.players,
      selectedUsername: null
    };
  },

  computed: {
    ...mapState({
      serverPairs: state => state.room.pairs
    }),
    ...mapGetters(["isHost"]),
    pairs: function () {
      if (this.isHost) return this.localPairs;
      return this.serverPairs;
    },
    lonePlayers: function () {
      return this.players.map(user => user.username).filter(username =>
        !(this.pairs.map(pair => pair[0]).concat(this.pairs.map(pair => pair[1])))
          .includes(username));
    }
  },

  methods: {
    constructPair: function (username1, username2) {
      if (!this.isHost) return;
      if (!this.lonePlayers.includes(username1)) {
        console.error(`${username1} is already in pair.`);
        return;
      }
      if (!this.lonePlayers.includes(username2)) {
        console.error(`${username2} is already in pair.`);
        return;
      }
      this.localPairs.push([username1, username2]);
      app.constructPair(username1, username2);
    },

    destroyPair: function (username1, username2) {
      if (!this.isHost) return;
      if (!removeByPredicat(this.localPairs, pair => (
        pair[0] === username1 && pair[1] === username2
      ))) {
        console.error(`${username1} and ${username2} aren't a pair`);
        return;
      }
      app.destroyPair(username1, username2);
    },

    selectUsername(username) {
      if (!this.isHost) return;
      if (this.selectedUsername === null) {
        this.selectedUsername = username;
      } else if (this.selectedUsername === username) {
        this.selectedUsername = null;
      } else {
        this.constructPair(this.selectedUsername, username);
        this.selectedUsername = null;
      }
    },

    endStage: function () {
      app.endStage();
    }
  }
};
</script>

<style>
  .selected {
    background: blue;
  }
</style>
