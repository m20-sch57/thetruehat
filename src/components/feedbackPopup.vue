<template>
  <div class="popup-wrapper" id="feedback">
    <article class="popup-window">
      <header>
        <h1 v-translate:ru>Обратная связь</h1>
        <h1 v-translate:en>Feedback</h1>
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
              :placeholder="$t({
                ru: 'Напишите свой отзыв здесь',
                en: 'Leave your comment here'
              })"
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
          <label for="feedbackCheckbox">
            <span v-translate:ru>Отправить полную информацию</span>
            <span v-translate:en>Send additional information</span>
          </label>
        </div>
      </main>
      <footer>
        <button
            class="btn btn-shadow btn-blue"
            @click="sendFeedback()">
          <span v-translate:ru>Отправить</span>
          <span v-translate:en>Send</span>
        </button>
      </footer>
    </article>
  </div>
</template>

<script>
import * as api from "src/api.js";

export default {
  name: "feedbackPopup",
  data: function () {
    return {
      collectBrowserData: false,
      feedbackMessage: ""
    };
  },
  methods: {
    sendFeedback: function () {
      api.sendFeedback(this.feedbackMessage, this.collectBrowserData);
    }
  }
};
</script>
