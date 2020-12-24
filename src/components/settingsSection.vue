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
          <h3 class="label w-100">Играть</h3>
          <label class="field w-300">
            <select
                class="select btn-bordered btn-transparent"
                v-model="settings.termCondition">
              <option :value="'words'">Пока не кончатся слова</option>
              <option :value="'turns'">Заданное число кругов</option>
            </select>
          </label>
        </div>
        <div class="layer">
          <h3 class="label w-100">Слова</h3>
          <label class="field w-300">
            <select
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
          <h3 class="label w-250">Загрузить словарь</h3>
          <div class="file field w-300">
            <input type="file" id="selectDictionary">
            <label for="selectDictionary" class="btn btn-blue">
              Выбрать
            </label>
            <label for="selectDictionary">
              Файл не выбран
            </label>
          </div>
        </div>
        <div
            class="layer"
            v-show="settings.termCondition === 'words' &&
              settings.wordsetSource[0] !== 'playerWords'">
          <h3 class="label w-250">Число слов в шляпе</h3>
          <label class="field w-300 w-70-mobile">
            <input class="input" v-model.number="settings.wordNumber">
          </label>
        </div>
        <div class="layer" v-show="settings.termCondition === 'turns'">
          <h3 class="label w-250">Количество кругов</h3>
          <label class="field w-300 w-70-mobile">
            <input class="input" v-model.number="settings.turnsNumber">
          </label>
        </div>
        <div class="layer">
          <h3 class="label w-300">Формат времени (сек)</h3>
          <label class="field w-300">
            <input
                class="input w-70"
                v-model.number="settings.delayTime">
            <span>+</span>
            <input
                class="input w-70"
                v-model.number="settings.explanationTime">
            <span>+</span>
            <input
                class="input w-70"
                v-model.number="settings.aftermathTime">
          </label>
        </div>
        <div class="layer-detached">
          <div class="checkbox">
            <input
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
          @click="applySettings()"
          class="btn btn-blue">
        Сохранить
      </button>
    </footer>
  </article>
</template>

<script>
import app from "src/app.js";
import store from "src/store.js";

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
    }
  },
  methods: {
    applySettings() {
      app.applySettings(this.storeFromLocalSettings());
    },

    // Есть два представления для настроек.
    // store - то, как настройки хранятмся
    // в данный момеент на сервере.
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
