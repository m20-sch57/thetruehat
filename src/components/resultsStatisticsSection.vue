<template>
  <article class="window" id="resultsStatistics">
    <header>
      <h1>Статистика</h1>
      <button
          class="btn-icon btn-transparent close"
          @click="$emit('swipe-to', 1)">
        <span class="fas fa-times"></span>
      </button>
    </header>
    <main>

    </main>
  </article>
</template>

<script>
export default {
  name: "resultsStatisticsSection"
};
</script>
