<template>
  <div class="popup" id="feedback">
    <article>
      <header>
        <h1>Обратная связь</h1>
        <button
            class="btn-icon btn-transparent"
            @click="$emit('close')">
          <span class="fas fa-times"></span>
        </button>
      </header>
      <main>
        <label>
          <textarea
              class="textarea"
              placeholder="Напишите свой отзыв здесь"
              v-model="feedbackMessage">
          </textarea>
        </label>
        <div class="checkbox">
          <input
              type="checkbox"
              id="feedbackCheckbox"
              v-model="collectBrowserData">
          <label for="feedbackCheckbox">
            <span class="fas fa-check"></span>
          </label>
          <label for="feedbackCheckbox">Отправить полную информацию</label>
        </div>
      </main>
      <footer>
        <button
            class="btn btn-shadow btn-blue"
            @click="sendFeedback()">
          Отправить
        </button>
      </footer>
    </article>
  </div>
</template>

<script>

import * as api from "src/api.js"

export default {
  data: function () {
    return {
      collectBrowserData: false,
      feedbackMessage: ""
    }
  },
  methods: {
    sendFeedback: function () {
      let result = api.sendFeedback(this.feedbackMessage, this.collectBrowserData);
    }
  }
}
</script>
