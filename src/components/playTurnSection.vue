<template>
  <article id="playTurn">
    <header>
      <button
          class="btn-icon left"
          @click="$emit('swipe-to', 0)">
        <span class="fas fa-angle-right"></span>
      </button>
      <h1>Идёт объяснение</h1>
      <button class="btn-icon">
        <span class="fas fa-volume-up"></span>
      </button>
    </header>
    <main class="scrollable-wrapper">
      <div class="scrollable">
        <div class="not-explaining">
          <div class="turn-pair">
            <div class="player speaker">
              <div class="player-icon">
                <span class="fas fa-microphone-alt"></span>
              </div>
              <div class="player-main">
                <h2 class="name">Василий</h2>
                <h3 class="action">объясняет</h3>
              </div>
            </div>
            <div class="middle">
              <h2 class="timer" style="display: none">00:17</h2>
              <img src="img/long-arrow-right.png" alt="right-arrow">
            </div>
            <div class="player listener">
              <div class="player-icon">
                <span class="fas fa-headphones-alt"></span>
              </div>
              <div class="player-main">
                <h2 class="name">Пётр</h2>
                <h3 class="action">отгадывает</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <footer>
      <button class="btn btn-green btn-shadow ready" style="">
        Я готов объяснять
      </button>
      <button class="btn btn-blue btn-shadow ready" style="display: none">
        Я готов отгадывать
      </button>
      <h3 class="your-status" style="display: none">Ты объясняешь через 3 хода</h3>
      <h3 class="your-status" style="display: none">Ты отгадываешь через 2 хода</h3>
    </footer>
  </article>
</template>

<script>
export default {
  name: "playTurnSection"
};
</script>
