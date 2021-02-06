<template>
  <article class="window" id="preparationRoom">
    <header>
      <h1>{{ $store.state.room.key }}</h1>
      <button
          class="btn-icon btn-transparent expand"
          @click="$emit('swipe-to', 1)">
        <span class="fas fa-cog"></span>
      </button>
    </header>
    <main>
      <div class="room-actions">
        <button
            class="btn btn-transparent"
            @click="copyKey()">
          <span class="fas fa-clipboard"></span>
          <span v-translate:ru>Ключ</span>
          <span v-translate:en>Key</span>
        </button>
        <button
            class="btn btn-transparent"
            @click="copyLink()">
          <span class="fas fa-link"></span>
          <span v-translate:ru>Ссылка</span>
          <span v-translate:en>Link</span>
        </button>
        <button
            class="btn btn-transparent leave-room"
            @click="leaveRoom()">
          <span class="fas fa-sign-out-alt"></span>
          <span v-translate:ru>Выйти</span>
          <span v-translate:en>Exit</span>
        </button>
      </div>
      <div class="scrollable-wrapper">
        <div class="scrollable">
          <div
              class="user-layer"
              v-for="username in $store.getters.onlinePlayers"
              :key="username">
            <img
                v-if="username === $store.state.room.host"
                src="img/hat.png"
                alt="user-icon">
            <img
                v-else
                src="img/user.png"
                alt="user-icon">
            <h3>{{ usernamePreview(username) }}</h3>
          </div>
        </div>
      </div>
    </main>
    <footer>
      <button
          v-show="isHost"
          class="btn btn-green"
          @click="startGame()"
          :disabled="!canStart">
        <span v-translate:ru>Начать игру</span>
        <span v-translate:en>Start game</span>
      </button>
      <h4 v-show="!isHost">
        <span v-translate:ru>Хост не начал игру</span>
        <span v-translate:en.draft>Host did not start the game</span>
      </h4>
    </footer>
  </article>
</template>

<script>
import app from "src/app.js";
import store from "src/store.js";

const room = store.state.room;

export default {
  name: "preparationRoomSection",
  computed: {
    canStart: function () {
      return this.$store.getters.onlinePlayers.length >= 2;
    },
    isHost: function () {
      return store.getters.isHost;
    }
  },
  methods: {
    usernamePreview: function (username) {
      return username + (username !== room.username ? "" : this.$t({
        ru: " (я)",
        en: " (you)"
      }));
    },
    copyKey: function () {
      navigator.clipboard.writeText(room.key);
    },
    copyLink: function () {
      navigator.clipboard.writeText(decodeURIComponent(window.location));
    },
    startGame: function () {
      app.startGame();
    },
    leaveRoom: function () {
      app.leaveRoom();
    }
  }
};
</script>
