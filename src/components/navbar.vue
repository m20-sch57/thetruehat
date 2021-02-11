<template>
  <nav class="nav" id="navbar">
    <button
        class="link nav-brand"
        @click="goToMainPage()"
        :disabled="currentPage === 'main'">
      <img src="img/hat.png" alt="hat">
      <div class="nav-brand-stack">
        <h3>The True Hat</h3>
        <h4>
          <version/>
        </h4>
      </div>
    </button>
    <div class="nav-links" @click.stop>
      <button
          class="btn-icon btn-transparent nav-expand"
          @click="isMenuCollapsed = !isMenuCollapsed">
        <span class="fas fa-ellipsis-h"></span>
      </button>
      <div class="nav-collapsible" :class="{'collapsed': isMenuCollapsed}">
        <div class="nav-links-center">
          <button
              class="btn-nav nav-link"
              :class="{active: currentPage === 'game'}"
              @click="goToPage('/game')"
              :disabled="currentPage === 'game'">
            <ru>Игра</ru>
            <en>Game</en>
          </button>
          <button
              class="btn-nav nav-link"
              :class="{active: currentPage === 'news'}"
              @click="goToPage('/news')"
              :disabled="currentPage === 'news'">
            <ru>Новости</ru>
            <en>News</en>
          </button>
          <button
              class="btn-nav nav-link"
              :class="{active: currentPage === 'faq'}"
              @click="goToPage('/faq')"
              :disabled="currentPage === 'faq'">
            <ru>FAQ</ru>
            <en>FAQ</en>
          </button>
          <button
              class="btn-nav nav-link"
              :class="{active: currentPage === 'about'}"
              @click="goToPage('/about')"
              :disabled="currentPage === 'about'">
            <ru>О нас</ru>
            <en>About us</en>
          </button>
        </div>
        <div class="nav-links-right">
          <button class="link nav-rules" @click="$emit('show-rules')">
            <span class="fas fa-book-open"></span>
          </button>
          <button class="link nav-feedback" @click="$emit('show-feedback')">
            <span class="fas fa-comments"></span>
          </button>
          <label>
            <select class="select btn-transparent" v-model="currentLocale">
              <option value="ru">RU</option>
              <option value="en">EN</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import app from "src/app.js";

export default {
  name: "navbar",
  props: {
    currentPage: String
  },
  data: function () {
    return {
      isMenuCollapsed: true,
      currentLocale: this.$language.current
    };
  },
  methods: {
    goToMainPage: function () {
      if (this.$store.state.room.connection === "online") {
        app.leaveRoom();
      }
      this.$router.push("/");
    },
    goToPage: function (page) {
      this.$router.push(page);
      this.isMenuCollapsed = true;
    }
  },
  created() {
    document.addEventListener("click", () => {
      this.isMenuCollapsed = true;
    });
  },
  watch: {
    currentLocale: function (locale) {
      this.$setLocale(locale);
    }
  }
};
</script>
