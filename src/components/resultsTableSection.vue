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
      <h1>
        <ru>Результаты</ru>
        <en>Results</en>
      </h1>
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
                <ru>Игрок</ru>
                <en>Player</en>
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
            <tr
                v-for="({username, scoreExplained, scoreGuessed}, i) in results"
                :key="i">
              <td>
                <span v-if="scoreExplained + scoreGuessed === maxScore" class="fas fa-trophy gold"></span>
                {{username}}
              </td>
              <td>{{scoreExplained + scoreGuessed}}</td>
              <td :class="{max: scoreExplained === maxExplainedScore}">
                <span v-if="scoreExplained === maxExplainedScore" class="fas fa-fire"></span>
                {{scoreExplained}}
              </td>
              <td :class="{max: scoreGuessed === maxGuessedScore}">
                <span v-if="scoreGuessed === maxGuessedScore" class="fas fa-fire"></span>
                {{scoreGuessed}}
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
    <footer>
      <button class="btn btn-green btn-shadow play-again">
        <ru>Играть ещё раз</ru>
        <en>Play again</en>
      </button>
    </footer>
  </article>
</template>

<script>
import {scrollTop, scrollBottom} from "src/tools";
import {mapState} from "vuex";

export default {
  name: "resultsTableSection",
  data: function () {
    return {
      maxTopScroll: true,
      maxBottomScroll: true,

      maxScore: Math.max(...this.$store.state.room.results.map(r => r.scoreGuessed + r.scoreExplained)),
      maxGuessedScore: Math.max(...this.$store.state.room.results.map(r => r.scoreGuessed)),
      maxExplainedScore: Math.max(...this.$store.state.room.results.map(r => r.scoreExplained)),
    };
  },

  computed: {
    ...mapState({
      results: state => state.room.results
    })
  },

  directives: {scrollTop, scrollBottom}
};
</script>
