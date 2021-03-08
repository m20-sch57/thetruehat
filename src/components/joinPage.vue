<template>
  <div class="page" id="join">
    <article class="window">
      <header>
        <h1>
          <ru>Вход в игру</ru>
          <en>Enter the game</en>
        </h1>
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
                  })">
            </label>
          </div>
          <div class="game-key-status">
            <div class="room-info no-key" v-show="validationStatus.key === 'empty'">
              <button
                  @click="pasteKey()"
                  class="btn btn-transparent">
                <span class="fas fa-clipboard"></span>
                <ru>Вставить</ru>
                <en>Paste</en>
              </button>
              <button
                  @click="generateKey()"
                  class="btn btn-transparent">
                <span class="fas fa-dice"></span>
                <ru>Сгенерировать</ru>
                <en>Generate</en>
              </button>
            </div>
            <div class="room-info checking" v-show="validationStatus.key === 'checking'">
              <div class="lds-ellipsis">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
              <h5>
                <ru>Проверка</ru>
                <en>Checking</en>
              </h5>
            </div>
            <div class="room-info not-created" v-show="validationStatus.key === 'not-created'">
              <h5>
                <ru>Игра не началась</ru>
                <en>Game not started</en>
              </h5>
              <button class="select btn-transparent">{{ playersList.length }}
                <ru>{{ $p(playersList.length, "игрок", "игрока", "игроков") }}</ru>
                <en>{{ $p(playersList.length, "player", "players") }}</en>
              </button>
            </div>
            <div class="room-info created" v-show="validationStatus.key === 'created'">
              <h5>
                <ru>Игра уже идёт</ru>
                <en>Game started</en>
              </h5>
              <button class="select btn-transparent">{{ playersList.length }}
                <ru>{{ $p(playersList.length, "игрок", "игрока", "игроков") }}</ru>
                <en>{{ $p(playersList.length, "player", "players") }}</en>
              </button>
            </div>
            <div class="room-info invalid" v-show="validationStatus.key === 'invalid'">
              <h5><span class="fas fa-times"></span>
                <ru>Некорректный ключ</ru>
                <en>Invalid key</en>
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
                  })">
            </label>
          </div>
          <div class="your-name-status">
            <div
                class="name-info no-name"
                v-show="validationStatus.username === 'empty'">
              <h5>
                <ru>Имя нужно, чтобы игроки могли вас опознать</ru>
                <en>Name is required for you to be identifiable</en>
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
              <h5>
                <ru>Проверка</ru>
                <en>Checking</en>
              </h5>
            </div>
            <div
                class="name-info accepted"
                v-show="validationStatus.username === 'accepted'">
              <h5>
                <span class="fas fa-check"></span>
                <ru>Нормально</ru>
                <en>Looks good</en>
              </h5>
            </div>
            <div
                class="name-info not-in-list"
                v-show="validationStatus.username === 'not-in-list'">
              <h5>
                <span class="fas fa-times"></span>
                <ru>Не найдено в списке игроков</ru>
                <en>Not found in the players list</en>
              </h5>
            </div>
            <div
                class="name-info not-in-list"
                v-show="validationStatus.username === 'name-occupied'">
              <h5>
                <span class="fas fa-times"></span>
                <ru>Имя уже занято другим игроком</ru>
                <en>This name is already taken</en>
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
          <ru>Поехали!</ru>
          <en>Let's go!</en>
        </button>
      </footer>
    </article>
  </div>
</template>

<script>
import * as api from "src/api.js";
import app from "src/app.js";
import {VALIDATION_TIMEOUT} from "src/config.js";
import debounce from "lodash/debounce";

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
