<template>
  <article class="window" id="preparationSettings">
    <header>
      <h1>
        <ru>Параметры игры</ru>
        <en draft>Game settings</en>
      </h1>
      <button
          class="btn-icon btn-transparent close"
          @click="$emit('swipe-to', 0)">
        <span class="fas fa-times"></span>
      </button>
    </header>
    <main class="scrollable-wrapper">
      <div class="scrollable custom-scroll">
        <div class="layer">
          <h4 class="label w-80">
            <ru>Играть</ru>
            <en draft>Play</en>
          </h4>
          <label class="field w-300 w-350-desktop">
            <select
                :disabled="!editModeOn"
                class="select btn-bordered btn-transparent"
                v-model="settings.termCondition">
              <option :value="'words'">
                <ru>Пока не кончатся слова</ru>
                <en draft>Until the words run out</en>
              </option>
              <option :value="'rounds'">
                <ru>Заданное число кругов</ru>
                <en draft>Fixed number of rounds</en>
              </option>
            </select>
          </label>
        </div>
        <div class="layer">
          <h4 class="label w-80">
            <ru>Слова</ru>
            <en draft>Words</en>
          </h4>
          <label class="field w-300 w-350-desktop">
            <select
                :disabled="!editModeOn"
                class="select btn-bordered btn-transparent"
                v-model="settings.wordsetSource">
              <option :value="['serverDictionary', 0]">
                <ru>Русские, 14141 слово</ru>
                <en draft>Russian, 14141 words</en>
              </option>
              <option :value="['serverDictionary', 4]">
                <ru>Английские, 1525 слов</ru>
                <en draft>English, 1525 words</en>
              </option>
              <option :value="['serverDictionary', 1]">
                <ru>Простые русские, 4627</ru>
                <en draft>Simple russian, 4627</en>
              </option>
              <option :value="['serverDictionary', 2]">
                <ru>Средние русские, 4506</ru>
                <en draft>Middle russian, 4506</en>
              </option>
              <option :value="['serverDictionary', 3]">
                <ru>Сложные русские, 4599</ru>
                <en draft>Hard russian, 4599</en>
              </option>
              <option :value="['hostDictionary']">
                <ru>Загрузить</ru>
                <en draft>Load dictionary</en>
              </option>
              <option :value="['playerWords']">
                <ru>От каждого игрока</ru>
                <en draft>From each player</en>
              </option>
            </select>
          </label>
        </div>
        <div class="layer" v-show="settings.wordsetSource[0] === 'hostDictionary'">
          <h4 class="label w-250">
            <ru>Загрузить словарь</ru>
            <en draft>Load dictionary</en>
          </h4>
          <div class="file field w-300 w-350-desktop">
            <input
                type="file"
                id="uploadDictionary"
                :disabled="!editModeOn"
                @change="event => updateHostDictionary(event.target)">
            <label for="uploadDictionary" class="btn btn-blue">
              <ru>Выбрать</ru>
              <en draft>Choose</en>
            </label>
            <label for="uploadDictionary">
              {{ dictionaryFilePreview }}
            </label>
          </div>
        </div>
        <div
            class="layer"
            v-show="settings.termCondition === 'words' &&
              settings.wordsetSource[0] !== 'playerWords'">
          <h4 class="label w-250">
            <ru>Число слов в шляпе</ru>
            <en draft>The number of words</en>
          </h4>
          <label class="field w-300 w-350-desktop w-70-mobile">
            <input
                class="input"
                :disabled="!editModeOn"
                v-model.number="settings.wordsNumber">
          </label>
        </div>
        <div class="layer" v-show="settings.termCondition === 'rounds'">
          <h4 class="label w-250">
            <ru>Количество кругов</ru>
            <en draft>The number of laps</en>
          </h4>
          <label class="field w-300 w-350-desktop w-70-mobile">
            <input
                class="input"
                :disabled="!editModeOn"
                v-model.number="settings.roundsNumber">
          </label>
        </div>
        <div class="layer">
          <h4 class="label w-250">
            <ru>Формат времени (сек)</ru>
            <en draft>Time format (sec)</en>
          </h4>
          <label class="field w-300 w-350-desktop">
            <input
                class="input w-70"
                :disabled="!editModeOn"
                v-model.number="settings.delayTime">
            <span>+</span>
            <input
                class="input w-70"
                :disabled="!editModeOn"
                v-model.number="settings.explanationTime">
            <span>+</span>
            <input
                class="input w-70"
                :disabled="!editModeOn"
                v-model.number="settings.aftermathTime">
          </label>
        </div>
        <div class="layer detached">
          <div class="checkbox">
            <input
                :disabled="!editModeOn"
                v-model="settings.strictMode"
                type="checkbox"
                id="strictModeCheckbox">
            <label for="strictModeCheckbox">
              <span class="fas fa-check"></span>
            </label>
            <label for="strictModeCheckbox">
              <ru>Строгий режим</ru>
              <en draft>Strict mode</en>
            </label>
          </div>
        </div>
      </div>
    </main>
    <footer>
      <button
          v-show="editModeOn"
          @click="applySettings()"
          class="btn btn-blue"
          :disabled="!isSettingsChanged">
        <ru>Сохранить</ru>
        <en draft>Save</en>
      </button>
      <h4 v-show="!editModeOn">
        <ru>Хост может изменять настройки</ru>
        <en draft>Host can change settings</en>
      </h4>
    </footer>
  </article>
</template>

<script>
import app from "src/app.js";
import store from "src/store.js";
import {DICTIONARY_MAX_SIZE, DEFAULT_GAME_SETTINGS} from "src/config.js";

const room = store.state.room;

export default {
  name: "preparationSettingsSection",

  data: function () {
    return {
      settings: {},
      isSettingsChanged: false
    };
  },

  computed: {
    serverSettings: function () {
      return room.settings;
    },
    dictionaryFilePreview: function () {
      if (this.settings.dictionaryFileInfo === undefined) {
        return this.$t({
          ru: "Файл не загружен",
          en: "File isn't loaded"
        });
      } else {
        const wordsNumber = this.settings.dictionaryFileInfo.wordsNumber;
        const filename = this.settings.dictionaryFileInfo.filename;
        return `${wordsNumber} ${this.$tp(wordsNumber, {
          ru: ["слово", "слова", "слов"],
          en: ["word", "words"]
        })}, ${filename}`;
      }
    },
    editModeOn: function () {
      return store.getters.isHost;
    }
  },

  methods: {
    applySettings() {
      app.applySettings(this.storeFromLocalSettings());
      this.$emit("swipe-to", 0);
    },

    updateHostDictionary(el) {
      if (el.files.length) {
        let file = el.files[0];

        if (file.type !== "" && file.type !== "text/plain") {
          // TODO: Показать ошибку
          return false;
        }
        if (file.size > DICTIONARY_MAX_SIZE) {
          // TODO: Показать ошибку
          return false;
        }

        let reader = new FileReader();
        reader.readAsText(file, "UTF-8");

        reader.onload = (evt) => {
          let lines = evt.target.result.split("\n").map(x => x.trim());
          this.settings.wordset = [...new Set(lines.filter(x => x !== ""))];

          // Необходимо пересдать объект настроек для реактивности.
          this.settings = {
            ...this.settings,
            dictionaryFileInfo: {
              filename: file.name,
              wordsNumber: this.settings.wordset.length
            }
          };
        };

        reader.onerror = () => {
          // TODO: Показать ошибку
        };
      }
    },

    // Есть два представления для настроек.
    // store - то, как настройки хранятся
    // в данный момент на сервере.
    // local - то, как настройки хранятся
    // в формах, в которые их ввёл пользователь.
    // Следующие две функции преобразуют настройки
    // из одного представления в другое.
    localFromStoreSettings() {
      let res = DEFAULT_GAME_SETTINGS;

      // На сервере время хранится в миллисекундах
      // В форме для пользователя его нужно вводить в секундах
      res.delayTime = room.settings.delayTime / 1000;
      res.explanationTime = room.settings.explanationTime / 1000;
      res.aftermathTime = room.settings.aftermathTime / 1000;

      res.strictMode = room.settings.strictMode;
      res.termCondition = room.settings.termCondition;

      // В данном случае wordsetSource это пара из wordsetType и доп. опций.
      // Если wordset набирается из словаря с сервера, то необходимо
      // в качестве этой доп. опции указать id словаря.
      // Во всех остальных случаях доп. опции отсутсвуют, поэтому
      // второй элемент пары опускается.
      // Это используется для возможности в одном поле выбора <select>
      // указывать как специфичные источники слов, так и конкретные словари
      // с сервера.
      res.wordsetSource = [room.settings.wordsetType];
      if (room.settings.wordsetType === "serverDictionary") {
        res.wordsetSource.push(room.settings.dictionaryId);
      }
      if (room.settings.termCondition === "words" &&
          room.settings.wordsetType !== "playerWords") {
        res.wordsNumber = room.settings.wordsNumber;
      }
      if (room.settings.termCondition === "rounds") {
        res.roundsNumber = room.settings.roundsNumber;
      }
      if (room.settings.wordsetType === "hostDictionary") {
        res.dictionaryFileInfo = room.settings.dictionaryFileInfo;
      }
      return res;
    },
    storeFromLocalSettings() {
      let res = {};

      // На сервере время хранится в миллисекундах
      // В форме для пользователя его нужно вводить в секундах
      res.delayTime = this.settings.delayTime * 1000;
      res.explanationTime = this.settings.explanationTime * 1000;
      res.aftermathTime = this.settings.aftermathTime * 1000;

      res.strictMode = this.settings.strictMode;
      res.termCondition = this.settings.termCondition;
      res.wordsetType = this.settings.wordsetSource[0];
      if (res.wordsetType === "serverDictionary") {
        res.dictionaryId = this.settings.wordsetSource[1];
      }
      if (res.termCondition === "words" &&
          res.wordsetType !== "playerWords") {
        res.wordsNumber = this.settings.wordsNumber;
      }
      if (res.termCondition === "rounds") {
        res.turnsNumber = this.settings.roundsNumber;
      }
      if (res.wordsetType === "hostDictionary") {
        res.dictionaryFileInfo = this.settings.dictionaryFileInfo;
        res.wordset = this.settings.wordset;
      }
      return res;
    },
    useStoreSettings: function () {
      this.settings = this.localFromStoreSettings();
      // Использую здесь Vue.nextTick поскольку иначе watcher, который следит
      // следит за настройками изменит поле isSettingsChanged обратно на true
      this.$nextTick(() => {
        this.isSettingsChanged = false;
      });
    }
  },

  created: function () {
    this.useStoreSettings();
  },

  watch: {
    serverSettings: function () {
      this.useStoreSettings();
    },
    settings: {
      handler: function () {
        this.isSettingsChanged = true;
      },
      deep: true
    }
  }
};
</script>
