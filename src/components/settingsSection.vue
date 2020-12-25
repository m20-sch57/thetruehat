<template>
  <article id="settings">
    <header>
      <h1>Параметры игры</h1>
      <button
          class="btn-icon expand"
          @click="$emit('toggle-shown-window')">
        <span class="fas fa-angle-down"></span>
      </button>
    </header>
    <main>
      <div class="scrollable">
        <div class="layer">
          <h4 class="label w-80">Играть</h4>
          <label class="field w-300 w-350-desktop">
            <select
                :disabled="!editModeOn"
                class="select btn-bordered btn-transparent"
                v-model="settings.termCondition">
              <option :value="'words'">Пока не кончатся слова</option>
              <option :value="'turns'">Заданное число кругов</option>
            </select>
          </label>
        </div>
        <div class="layer">
          <h4 class="label w-80">Слова</h4>
          <label class="field w-300 w-350-desktop">
            <select
                :disabled="!editModeOn"
                class="select btn-bordered btn-transparent"
                v-model="settings.wordsetSource">
              <option :value="['serverDictionary', 0]">Русские, 14141 слово</option>
              <option :value="['serverDictionary', 1]">Английские, 1525 слов</option>
              <option :value="['serverDictionary', 2]">Простые русские, 4627</option>
              <option :value="['serverDictionary', 3]">Средние русские, 4506</option>
              <option :value="['serverDictionary', 4]">Сложные русские, 4599</option>
              <option :value="['hostDictionary']">Загрузить</option>
              <option :value="['playerWords']">От каждого игрока</option>
            </select>
          </label>
        </div>
        <div class="layer" v-show="settings.wordsetSource[0] === 'hostDictionary'">
          <h4 class="label w-250">Загрузить словарь</h4>
          <div class="file field w-300 w-350-desktop">
            <input
                type="file"
                id="uploadDictionary"
                :disabled="!editModeOn"
                @change="event => updateHostDictionary(event.target)">
            <label for="uploadDictionary" class="btn btn-blue">
              Выбрать
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
          <h4 class="label w-250">Число слов в шляпе</h4>
          <label class="field w-300 w-350-desktop w-70-mobile">
            <input
                class="input"
                :disabled="!editModeOn"
                v-model.number="settings.wordNumber">
          </label>
        </div>
        <div class="layer" v-show="settings.termCondition === 'turns'">
          <h4 class="label w-250">Количество кругов</h4>
          <label class="field w-300 w-350-desktop w-70-mobile">
            <input
                class="input"
                :disabled="!editModeOn"
                v-model.number="settings.turnsNumber">
          </label>
        </div>
        <div class="layer">
          <h4 class="label w-250">Формат времени (сек)</h4>
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
        <div class="layer-detached">
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
              Строгий режим
            </label>
          </div>
        </div>
      </div>
    </main>
    <footer>
      <button
          v-show="editModeOn"
          @click="applySettings()"
          class="btn btn-blue">
        Сохранить
      </button>
      <h4 v-show="!editModeOn">
        Хост может изменять настройки
      </h4>
    </footer>
  </article>
</template>

<script>
import app from "src/app.js";
import store from "src/store.js";
import {DICTIONARY_MAX_SIZE} from "src/config.js";

const room = store.state.room;

export default {
  data: function () {
    return {
      settings: {}
    };
  },

  computed: {
    serverSettings: function () {
      return room.settings;
    },
    dictionaryFilePreview: function () {
      if (this.settings.dictionaryFileInfo === undefined) {
        return "Файл не загружен";
      } else {
        return `${this.settings.dictionaryFileInfo.wordNumber} слов, ${
          this.settings.dictionaryFileInfo.filename}`;
      }
    },
    editModeOn: function () {
      return store.getters.isHost;
    }
  },

  methods: {
    applySettings() {
      app.applySettings(this.storeFromLocalSettings());
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
              wordNumber:  this.settings.wordset.length
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
      let res = {};

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
        res.wordNumber = room.settings.wordNumber;
      }
      if (room.settings.termCondition === "turns") {
        res.turnsNumber = room.settings.turnsNumber;
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
        res.wordNumber = this.settings.wordNumber;
      }
      if (res.termCondition === "turns") {
        res.turnsNumber = this.settings.turnsNumber;
      }
      if (res.wordsetType === "hostDictionary") {
        res.dictionaryFileInfo = this.settings.dictionaryFileInfo;
        res.wordset = this.settings.wordset;
      }
      return res;
    }
  },

  created: function() {
    this.settings = this.localFromStoreSettings();
  },

  watch: {
    serverSettings: function () {
      this.settings = this.localFromStoreSettings();
    }
  }
};
</script>
