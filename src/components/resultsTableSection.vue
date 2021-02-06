<template>
  <article class="window" id="resultsTable">
    <header>
      <button
          class="btn-icon btn-transparent expand"
          @click="$emit('swipe-to', 0)">
        <span class="fas fa-angle-right"></span>
      </button>
      <h1>Результаты</h1>
      <button
          class="btn-icon btn-transparent expand"
          @click="$emit('swipe-to', 2)">
        <span class="fas fa-angle-left"></span>
      </button>
    </header>
    <main class="scrollable-wrapper">

    </main>
    <footer>
      <button class="btn btn-green btn-shadow play-again">
        Играть ещё раз
      </button>
    </footer>
  </article>
</template>

<script>
export default {
  name: "resultsTableSection"
};
</script>
