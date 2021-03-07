<template>
  <article
      class="window"
      :class="{
        topShadow: !maxTopScroll,
        bottomShadow: !maxBottomScroll
      }"
      id="resultsTable">
    <header>
      <button
          class="btn-icon btn-transparent expand"
          @click="$emit('swipe-to', 0)">
        <span class="fas fa-history"></span>
      </button>
      <h1>Результаты</h1>
      <button
          class="btn-icon btn-transparent expand"
          @click="$emit('swipe-to', 2)">
        <span class="fas fa-chart-pie"></span>
      </button>
    </header>
    <main class="scrollable-wrapper">
      <div
          class="scrollable custom-scroll"
          v-scroll-top="maxTopScroll"
          v-scroll-bottom="maxBottomScroll">
        <div class="results">
          <table class="results-table">
            <thead>
            <tr>
              <th>
                Игрок
              </th>
              <th>
                Σ
              </th>
              <th>
                <span class="fas fa-microphone-alt"></span>
              </th>
              <th>
                <span class="fas fa-headphones-alt"></span>
              </th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td>
                <span class="fas fa-trophy gold"></span>
                Someone with a very long spacious name
              </td>
              <td>30</td>
              <td class="max"><span class="fas fa-fire"></span>14</td>
              <td>16</td>
            </tr>
            <tr>
              <td>
                Someonewithalongsinglewordname
              </td>
              <td>29</td>
              <td>12</td>
              <td class="max"><span class="fas fa-fire"></span>17</td>
            </tr>
            <tr>
              <td>Федро Сливерский</td>
              <td>17</td>
              <td>8</td>
              <td>9</td>
            </tr>
            <tr>
              <td>Бедро №1</td>
              <td>15</td>
              <td>9</td>
              <td>6</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
    <footer>
      <button class="btn btn-green btn-shadow play-again">
        Играть ещё раз
      </button>
    </footer>
  </article>
</template>

<script>
import {scrollTop, scrollBottom} from "src/tools";

export default {
  name: "resultsTableSection",
  data: function () {
    return {
      maxTopScroll: true,
      maxBottomScroll: true
    };
  },
  directives: {scrollTop, scrollBottom}
};
</script>
