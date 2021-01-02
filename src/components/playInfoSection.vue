<template>
  <article id="playInfo">
    <header>
      <h1>ЖУБЫРОЩАКЕК</h1>
      <button
          class="btn-icon right"
          @click="$emit('swipe-to-turn')">
        <span class="fas fa-times"></span>
      </button>
    </header>
    <main class="scrollable-wrapper">
      <div class="scrollable">
        <div class="turns">
          <div class="next-turn">
            <h3>Следующий ход</h3>
            <div class="turn-layer">
              <div class="turn-top">
                <div class="turn-pair">
                  <h4 class="speaker">Вася</h4>
                  <img src="img/long-arrow-right.png" alt="right-arrow">
                  <h4 class="listener">Петя</h4>
                </div>
              </div>
            </div>
          </div>
          <div class="current-turn">
            <h3>Этот ход</h3>
            <div class="turn-layer">
              <div class="turn-top">
                <div class="turn-pair">
                  <h4 class="speaker">Глеб</h4>
                  <img src="img/long-arrow-right.png" alt="right-arrow">
                  <h4 class="listener">Саша</h4>
                </div>
              </div>
            </div>
          </div>
          <div class="previous-turns">
            <h3>Предыдущие ходы</h3>
            <div class="turn-layer">
              <div class="turn-top">
                <div class="turn-pair">
                  <h4 class="speaker">OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO</h4>
                  <img src="img/long-arrow-right.png" alt="right-arrow">
                  <h4 class="listener">Саша</h4>
                </div>
                <div class="turn-words-cnt">17</div>
                <img src="img/arrow-down.svg" class="arrow-down" alt="arrow-down">
              </div>
              <div class="turn-bottom">
                Something
              </div>
            </div>
            <div class="turn-layer collapsed">
              <div class="turn-top">
                <div class="turn-pair">
                  <h4 class="speaker">Глеб</h4>
                  <img src="img/long-arrow-right.png" alt="right-arrow">
                  <h4 class="listener">Саша</h4>
                </div>
                <div class="turn-words-cnt">2</div>
                <img src="img/arrow-down.svg" class="arrow-down" alt="arrow-down">
              </div>
              <div class="turn-bottom">
                Something
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <footer>
      <div class="remaining">
        <h1>57</h1>
        <h4>слов</h4>
      </div>
      <button class="btn btn-transparent">
        <span class="fas fa-flag-checkered"></span>
        Закончить
      </button>
      <button class="btn btn-transparent">
        <span class="fas fa-sign-out-alt"></span>
        Выйти
      </button>
    </footer>
  </article>
</template>

<script>
export default {}
</script>
