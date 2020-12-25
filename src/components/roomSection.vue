<template>
  <article id="room">
    <header>
      <h1>{{ $store.state.room.key }}</h1>
      <button
          class="btn-icon expand"
          @click="$emit('toggle-shown-window')">
        <span class="fas fa-angle-down"></span>
      </button>
    </header>
    <main>
      <div class="scrollable">
        <div class="room-actions">
          <button
              class="btn btn-transparent"
              @click="copyKey()">
            <span class="fas fa-clipboard"></span>
            Ключ
          </button>
          <button
              class="btn btn-transparent"
              @click="copyLink()">
            <span class="fas fa-link"></span>
            Ссылка
          </button>
          <button
              class="btn btn-transparent leave-room"
              @click="leaveRoom()">
            <span class="fas fa-sign-out-alt"></span>
            Выйти
          </button>
        </div>
      </div>
    </main>
    <footer>
      <button
          v-show="isHost"
          class="btn btn-green"
          @click="startGame()"
          :disabled="!canStart">
        Начать игру
      </button>
      <h4 v-show="!isHost">
        Хост не начал игру
      </h4>
    </footer>
  </article>
</template>

<script>
import app from "src/app.js";
import store from "src/store.js";

export default {
  computed: {
    canStart: function () {
      return this.$store.getters.onlinePlayers.length >= 2;
    },
    isHost: function () {
      return store.getters.isHost;
    }
  },
  methods: {
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
