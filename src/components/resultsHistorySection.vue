<template>
  <article
      class="window"
      :class="{
        topShadow: !maxTopScroll,
        bottomShadow: !maxBottomScroll
      }"
      id="resultsHistory">
    <header>
      <h1>
        <ru>История игры</ru>
        <en>Game history</en>
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
        <div class="turns">
          <div class="past-turns">
            <turns-history/>
          </div>
        </div>
      </div>
    </main>
  </article>
</template>

<script>
import turnsHistory from "cmp/turnsHistory.vue";
import {scrollTop, scrollBottom} from "src/tools";

export default {
  name: "resultsHistorySection",
  components: {turnsHistory},
  data: function () {
    return {
      maxTopScroll: true,
      maxBottomScroll: true
    };
  },
  directives: {scrollTop, scrollBottom}
};
</script>
