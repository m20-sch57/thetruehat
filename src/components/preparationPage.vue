<template>
  <body>
  <navbar
      @show-rules="showRules = true"
      @show-feedback="showFeedback = true"
  />
  <rules
      v-show="showRules"
      @close="showRules = false"
  />
  <feedback
      v-show="showFeedback"
      @close="showFeedback = false"
  />
  <div class="page" id="preparation">
    <article class="left" :class="{collapsed: isShownMeeting}">
      <header>
        <h1>{{ $store.state.room.key }}</h1>
        <button
            class="btn-icon btn-transparent"
            @click="copyLink()">
          <span class="fas fa-clipboard"></span>
        </button>
        <button
            class="btn-icon expand"
            @click="toggleShownWindow()">
          <span class="fas fa-angle-down"></span>
        </button>
      </header>
      <main>

      </main>
      <footer>
        <button
            class="btn btn-green"
            @click="startGame()"
            :disabled="!canStart">
          Начать игру
        </button>
      </footer>
    </article>
    <article class="right" :class="{collapsed: isShownOptions}">
      <header>
        <h1>Параметры игры</h1>
        <button
            class="btn-icon expand"
            @click="toggleShownWindow()">
          <span class="fas fa-angle-down"></span>
        </button>
      </header>
      <main>

      </main>
    </article>
  </div>
  </body>
</template>

<script>
import navbar from "cmp/navbar.vue"
import rules from "cmp/rulesPopup.vue"
import feedback from "cmp/feedbackPopup.vue"

import app from "src/app.js"

export default {
  components: {navbar, rules, feedback},
  data: function () {
    return {
      showRules: false,
      showFeedback: false,
      isShownOptions: false,
      isShownMeeting: true
    }
  },
  computed: {
    canStart: function () {
      return this.$store.getters.onlinePlayers.length >= 2
    },
  },
  methods: {
    copyKey: function () {
      navigator.clipboard.writeText(this.$store.state.room.key);
    },
    copyLink: function () {
      navigator.clipboard.writeText(decodeURIComponent(window.location));
    },
    toggleShownWindow: function () {
      this.isShownOptions = !this.isShownOptions;
      this.isShownMeeting = !this.isShownMeeting;
    },
    startGame: function () {
      app.startGame();
    }
  }
}
</script>
