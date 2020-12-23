<template>
  <body>
  <navbar
      currentPage="game"
      @show-rules="showRules = true"
      @show-feedback="showFeedback = true"
  />
  <rules
      v-show="showRules"
      @close="showRules = false"
  />
  <feedback
      v-show="showFeedback"
      @close="showFeedback = false"
  />
  <div class="page" id="preparation">
    <article class="left" :class="{collapsed: !isShownMeeting}">
      <header>
        <h1>{{ $store.state.room.key }}</h1>
        <button
            class="btn-icon expand"
            @click="toggleShownWindow()">
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
            class="btn btn-green"
            @click="startGame()"
            :disabled="!canStart">
          Начать игру
        </button>
      </footer>
    </article>
    <article class="right" :class="{collapsed: !isShownOptions}">
      <header>
        <h1>Параметры игры</h1>
        <button
            class="btn-icon expand"
            @click="toggleShownWindow()">
          <span class="fas fa-angle-down"></span>
        </button>
      </header>
      <main>
        <div class="scrollable">
          <div class="layer">
            <h3 class="label w-100">Играть</h3>
            <label class="field w-300">
              <select class="select btn-bordered btn-transparent">
                <option>Пока не кончатся слова</option>
                <option>Заданное число кругов</option>
              </select>
            </label>
          </div>
          <div class="layer">
            <h3 class="label w-100">Слова</h3>
            <label class="field w-300">
              <select class="select btn-bordered btn-transparent">
                <option>Русские, 14141 слово</option>
                <option>Английские, 1525 слов</option>
                <option>Простые русские, 4627</option>
                <option>Средние русские, 4506</option>
                <option>Сложные русские, 4599</option>
                <option>Загрузить</option>
                <option>От каждого игрока</option>
              </select>
            </label>
          </div>
          <div class="layer">
            <h3 class="label w-300">Число слов в шляпе</h3>
            <label class="field w-300">
              <input class="input">
            </label>
          </div>
          <div class="layer">
            <h3 class="label w-300">Количество кругов</h3>
            <label class="field w-300">
              <input class="input">
            </label>
          </div>
          <div class="layer">
            <h3 class="label w-300">Формат времени (сек)</h3>
            <label class="field w-300">
              <input class="input w-70">
              <span>+</span>
              <input class="input w-70">
              <span>+</span>
              <input class="input w-70">
            </label>
          </div>
          <div class="layer-detached">
            <div class="checkbox">
              <input
                  type="checkbox"
                  id="strictModeCheckbox">
              <label for="strictModeCheckbox">
                <span class="fas fa-check"></span>
              </label>
              <label for="strictModeCheckbox">
                Строгий режим
              </label>
            </div>
          </div>
        </div>
      </main>
      <footer>
        <button
            class="btn btn-blue">
          Сохранить
        </button>
      </footer>
    </article>
  </div>
  </body>
</template>

<script>
import navbar from "cmp/navbar.vue";
import rules from "cmp/rulesPopup.vue";
import feedback from "cmp/feedbackPopup.vue";

import app from "src/app.js";

export default {
  components: {navbar, rules, feedback},
  data: function () {
    return {
      showRules: false,
      showFeedback: false,
      isShownOptions: false,
      isShownMeeting: true
    };
  },
  computed: {
    canStart: function () {
      return this.$store.getters.onlinePlayers.length >= 2;
    },
  },
  methods: {
    copyKey: function () {
      navigator.clipboard.writeText(this.$store.state.room.key);
    },
    copyLink: function () {
      navigator.clipboard.writeText(decodeURIComponent(window.location));
    },
    toggleShownWindow: function () {
      this.isShownOptions = !this.isShownOptions;
      this.isShownMeeting = !this.isShownMeeting;
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
