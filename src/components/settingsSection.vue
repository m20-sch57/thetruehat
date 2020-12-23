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
            <input class="input always-center w-70">
            <span>+</span>
            <input class="input always-center w-70">
            <span>+</span>
            <input class="input always-center w-70">
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
</template>
