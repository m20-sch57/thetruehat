<template>
  <div>
    <h2>Пары</h2>
    <div
        v-for="({username1, username2}, i) of pairs"
        @click="destroyPair(username1, username2)"
        :key="i">
      <span>{{username1}}</span><br>
      <span>{{username2}}</span>
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

export default {
  name: "pairMatchingPage",

  data: function () {
    return {
      pairs: this.$store.state.room.pairs,
      players: this.$store.state.room.players,
      selectedUsername: null
    };
  },

  computed: {
    lonePlayers: function () {
      return this.players.map(user => user.username).filter(username =>
        !(this.pairs.map(pair => pair.username1).concat(this.pairs.map(pair => pair.username2)))
          .includes(username));
    }
  },

  methods: {
    constructPair: function (username1, username2) {
      if (!this.lonePlayers.includes(username1)) {
        console.error(`${username1} is already in pair.`);
        return;
      }
      if (!this.lonePlayers.includes(username2)) {
        console.error(`${username2} is already in pair.`);
        return;
      }
      this.pairs.push({username1, username2});
      app.constructPair(username1, username2);
    },

    destroyPair: function (username1, username2) {
      if (!removeByPredicat(this.pairs, pair => (
        pair.username1 === username1 && pair.username2 === username2
      ))) {
        console.error(`${username1} and ${username2} aren't a pair`);
        return;
      }
      app.destroyPair(username1, username2);
    },

    selectUsername(username) {
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
