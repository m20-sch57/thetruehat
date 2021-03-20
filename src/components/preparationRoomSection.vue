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
          <ru>Ключ</ru>
          <en>Key</en>
        </button>
        <button
            class="btn btn-transparent"
            @click="copyLink()">
          <span class="fas fa-link"></span>
          <ru>Ссылка</ru>
          <en>Link</en>
        </button>
        <button
            class="btn btn-transparent leave-room"
            @click="leaveRoom()">
          <span class="fas fa-sign-out-alt"></span>
          <ru>Выйти</ru>
          <en>Leave</en>
        </button>
      </div>
      <div class="scrollable-wrapper">
        <div class="scrollable custom-scroll">
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
        <ru>Начать игру</ru>
        <en>Start the game</en>
      </button>
      <h4 v-show="!isHost">
        <ru>Хост не начал игру</ru>
        <en>Host has not started the game</en>
      </h4>
    </footer>
  </article>
</template>

<script>
import app from "src/app.js";

export default {
  name: "preparationRoomSection",
  computed: {
    canStart: function () {
      return this.$store.getters.onlinePlayers.length >= 2;
    },
    isHost: function () {
      return this.$store.getters.isHost;
    }
  },
  methods: {
    usernamePreview: function (username) {
      return username + (username !== this.$store.state.room.username ? "" : this.$t({
        ru: " (я)",
        en: " (you)"
      }));
    },
    copyKey: function () {
      navigator.clipboard.writeText(this.$store.state.room.key);
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
