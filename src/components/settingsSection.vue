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
                v-model="settings.dictionaryId">
              <option :value="0">Русские, 14141 слово</option>
              <option :value="1">Английские, 1525 слов</option>
              <option :value="2">Простые русские, 4627</option>
              <option :value="3">Средние русские, 4506</option>
              <option :value="4">Сложные русские, 4599</option>
              <option :value="5">Загрузить</option>
              <option :value="6">От каждого игрока</option>
            </select>
          </label>
        </div>
        <div class="layer" v-show="settings.termCondition === 'words'">
          <h3 class="label w-300">Число слов в шляпе</h3>
          <label class="field w-300">
            <input class="input" v-model.number="settings.wordNumber">
          </label>
        </div>
        <div class="layer" v-show="settings.termCondition === 'turns'">
          <h3 class="label w-300">Количество кругов</h3>
          <label class="field w-300">
            <input class="input" v-model.number="settings.turnNumber">
          </label>
        </div>
        <div class="layer">
          <h3 class="label w-300">Формат времени (сек)</h3>
          <label class="field w-300">
            <input
                class="input always-center w-70"
                v-model.number="settings.delayTime">
            <span>+</span>
            <input
                class="input always-center w-70"
                v-model.number="settings.explanationTime">
            <span>+</span>
            <input
                class="input always-center w-70"
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

export default {
  data: function () {
    return {
      settings: {
        ...store.state.room.settings,
        delayTime: store.state.room.settings.delayTime / 1000,
        explanationTime: store.state.room.settings.explanationTime / 1000,
        aftermathTime: store.state.room.settings.aftermathTime / 1000
      }
    };
  },
  computed: {
    serverSettings: function () {
      return store.state.room.settings;
    }
  },
  methods: {
    applySettings() {
      app.applySettings({
        ...this.settings,
        delayTime: this.settings.delayTime * 1000,
        explanationTime: this.settings.explanationTime * 1000,
        aftermathTime: this.settings.aftermathTime * 1000
      });
    },
  },
  watch: {
    serverSettings: function () {
      this.settings = {...store.state.room.settings,
        delayTime: store.state.room.settings.delayTime / 1000,
        explanationTime: store.state.room.settings.explanationTime / 1000,
        aftermathTime: store.state.room.settings.aftermathTime / 1000};
    }
  }
};
</script>
