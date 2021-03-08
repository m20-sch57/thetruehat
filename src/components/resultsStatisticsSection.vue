<template>
  <article
      class="window"
      :class="{
        topShadow: !maxTopScroll,
        bottomShadow: !maxBottomScroll
      }"
      id="resultsStatistics">
    <header>
      <h1>
        <ru>Статистика</ru>
        <en>Statistics</en>
      </h1>
      <button
          class="btn-icon btn-transparent close"
          @click="$emit('swipe-to', 1)">
        <span class="fas fa-times"></span>
      </button>
    </header>
    <main class="scrollable-wrapper">
      <div
          class="scrollable custom-scroll"
          v-scroll-top="maxTopScroll"
          v-scroll-bottom="maxBottomScroll">
        <div class="statistics">
          <h3 class="not-ready">
            <ru>Статистика пока не готова</ru>
            <en>Statistics is not ready yet</en>
          </h3>
        </div>
      </div>
    </main>
  </article>
</template>

<script>
import {scrollTop, scrollBottom} from "src/tools";

export default {
  name: "resultsStatisticsSection",
  data: function () {
    return {
      maxTopScroll: true,
      maxBottomScroll: true
    };
  },
  directives: {scrollTop, scrollBottom}
};
</script>
