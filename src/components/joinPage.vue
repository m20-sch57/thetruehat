<template>
  <div class="page" id="join">
    <article>
      <header>
        <h1 v-translate:ru>Вход в игру</h1>
        <h1 v-translate:en.draft>Enter the game</h1>
      </header>
      <main>
        <section class="game-key">
          <div class="game-key-input">
            <label>
              <input
                  :value="key"
                  @input="key = formatKey($event.target.value)"
                  class="input"
                  :placeholder="$t({
                    ru: 'Ключ игры',
                    en: 'Game key'
                  })"
              >
            </label>
          </div>
          <div class="game-key-status">
            <div class="room-info no-key" v-show="validationStatus.key === 'empty'">
              <button
                  @click="pasteKey()"
                  class="btn btn-transparent">
                <span class="fas fa-clipboard"></span>
                <span v-translate:ru>Вставить</span>
                <span v-translate:en>Paste</span>
              </button>
              <button
                  @click="generateKey()"
                  class="btn btn-transparent">
                <span class="fas fa-dice"></span>
                <span v-translate:ru>Сгенерировать</span>
                <span v-translate:en.draft>Generate</span>
              </button>
            </div>
            <div class="room-info checking" v-show="validationStatus.key === 'checking'">
              <div class="lds-ellipsis">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
              <h5 v-translate:ru>Проверка</h5>
              <h5 v-translate:en.draft>Checking</h5>
            </div>
            <div class="room-info not-created" v-show="validationStatus.key === 'not-created'">
              <h5 v-translate:ru>Игра не началась</h5>
              <h5 v-translate:en.draft>Game not started</h5>
              <button class="select btn-transparent">{{ playersList.length }}
                <span v-translate:ru>{{ $p(playersList.length, "игрок", "игрока", "игроков") }}</span>
                <span v-translate:en>{{ $p(playersList.length, "player", "players") }}</span>
              </button>
            </div>
            <div class="room-info created" v-show="validationStatus.key === 'created'">
              <h5 v-translate:ru>Игра уже идёт</h5>
              <h5 v-translate:en.draft>Game already started</h5>
              <button class="select btn-transparent">{{ playersList.length }}
                <span v-translate:ru>{{ $p(playersList.length, "игрок", "игрока", "игроков") }}</span>
                <span v-translate:en>{{ $p(playersList.length, "player", "players") }}</span>
              </button>
            </div>
            <div class="room-info invalid" v-show="validationStatus.key === 'invalid'">
              <h5><span class="fas fa-times"></span>
                <span v-translate:ru>Некорректный ключ</span>
                <span v-translate:en.draft>Incorrect key</span>
              </h5>
            </div>
          </div>
        </section>
        <section class="your-name">
          <div class="your-name-input">
            <label>
              <input
                  v-model.trim="username"
                  class="input"
                  :placeholder="$t({
                    ru: 'Ваше имя',
                    en: 'Your name'
                  })"
              >
            </label>
          </div>
          <div class="your-name-status">
            <div
                class="name-info no-name"
                v-show="validationStatus.username === 'empty'">
              <h5 v-translate:ru>
                Имя нужно, чтобы игроки могли вас опознать
              </h5>
              <h5 v-translate:en.draft>
                The name is necessary so that the players can identify you
              </h5>
            </div>
            <div
                class="name-info checking"
                v-show="validationStatus.username === 'checking'">
              <div class="lds-ellipsis">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
              <h5 v-translate:ru>Проверка</h5>
              <h5 v-translate:en.draft>Checking</h5>
            </div>
            <div
                class="name-info accepted"
                v-show="validationStatus.username === 'accepted'">
              <h5>
                <span class="fas fa-check"></span>
                <span v-translate:ru>Нормально</span>
                <span v-translate:en.draft>Good</span>
              </h5>
            </div>
            <div
                class="name-info not-in-list"
                v-show="validationStatus.username === 'not-in-list'">
              <h5>
                <span class="fas fa-times"></span>
                <span v-translate:ru>Не найдено в списке игроков</span>
                <span v-translate:en.draft>Not found in players list</span>
              </h5>
            </div>
            <div
                class="name-info not-in-list"
                v-show="validationStatus.username === 'name-occupied'">
              <h5>
                <span class="fas fa-times"></span>
                <span v-translate:ru>Имя уже занято другим игроком</span>
                <span v-translate:en.draft>Name is already taken by another player</span>
              </h5>
            </div>
          </div>
        </section>
      </main>
      <footer>
        <button
            class="btn btn-shadow btn-green"
            @click="joinRoom()"
            :disabled="!validated">
          <span v-translate:ru>Поехали!</span>
          <span v-translate:en.draft>Let's go!</span>
        </button>
      </footer>
    </article>
  </div>
</template>

<script>
import * as api from "src/api.js";
import app from "src/app.js";
import {VALIDATION_TIMEOUT} from "src/config.js";
import {debounce} from "src/tools";

export default {
  name: "joinPage",
  data: function () {
    return {
      username: "",
      key: "",
      playersInfo: {},
      playersList: [],
      validationStatus: {
        username: "empty",
        key: "empty"
      }
    };
  },
  computed: {
    validated: function () {
      return (
        this.validationStatus.username === "accepted" &&
        (this.validationStatus.key === "not-created" ||
            this.validationStatus.key === "created"));
    }
  },
  methods: {
    formatKey: function (key) {
      return key.toUpperCase().trim();
    },
    generateKey: async function () {
      this.key = this.formatKey(await api.getFreeKey());
    },
    pasteKey: async function () {
      this.key = this.formatKey(await navigator.clipboard.readText());
    },
    joinRoom: async function () {
      if (this.validated) {
        app.joinRoom({
          username: this.username,
          key: this.key
        });
      }
    }
  },
  created: function () {
    if (Object.keys(this.$route.query).length &&
        this.key !== Object.keys(this.$route.query)[0]) {
      this.key = this.formatKey(Object.keys(this.$route.query)[0]);
    }

    this.validateKey = key => {
      if (key === "") {
        this.validationStatus.key = "empty";
      } else if (!this.roomInfo.success) {
        this.validationStatus.key = "invalid";
      } else if (this.roomInfo.stage === "wait") {
        this.validationStatus.key = "not-created";
      } else {
        this.validationStatus.key = "created";
      }
      this.validateUsername(this.username);
    };
    this.validateUsername = username => {
      if (username === "") {
        this.validationStatus.username = "empty";
      } else if (!this.roomInfo.success) {
        this.validationStatus.username = "accepted";
      } else if (!(this.roomInfo.stage === "wait" ||
          username in this.roomInfo.playersInfo)) {
        this.validationStatus.username = "not-in-list";
      } else if (username in this.roomInfo.playersInfo &&
          this.roomInfo.playersInfo[username]) {
        this.validationStatus.username = "name-occupied";
      } else {
        this.validationStatus.username = "accepted";
      }
    };
    this.watchKey = debounce(async key => {
      this.roomInfo = await api.getRoomInfo(key);
      this.validateKey(key);
      if (this.roomInfo.success) {
        this.playersInfo = this.roomInfo.playersInfo;
        this.playersList = this.roomInfo.playersList;
      }
    }, VALIDATION_TIMEOUT);
    this.watchUsername = debounce(async username => {
      this.roomInfo = await api.getRoomInfo(this.key);
      this.validateUsername(username);
    }, VALIDATION_TIMEOUT);
  },
  watch: {
    key: function (val) {
      this.validationStatus.key = "checking";
      this.watchKey(val);
      if (Object.keys(this.$route.query)[0] !== this.key) {
        let query = {};
        query[this.key] = null;
        this.$router.replace({query});
      }
    },
    username: function (val) {
      this.validationStatus.username = "checking";
      this.watchUsername(val);
    }
  }
};
</script>
