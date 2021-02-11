<template>
  <div class="popup-wrapper" id="feedback">
    <article class="popup-window">
      <header>
        <ru tag="h1">Обратная связь</ru>
        <en tag="h1">Feedback</en>
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
            <ru>Отправить полную информацию</ru>
            <en>Send additional information</en>
          </label>
        </div>
      </main>
      <footer>
        <button
            class="btn btn-shadow btn-blue"
            @click="sendFeedback()">
          <ru>Отправить</ru>
          <en>Send</en>
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
