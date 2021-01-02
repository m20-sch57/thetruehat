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
          @click="collapseMenu = !collapseMenu">
        <span class="fas fa-ellipsis-h"></span>
      </button>
      <div class="nav-collapsible" :class="{'collapsed': !collapseMenu}">
        <div class="nav-links-center">
          <button
              class="nav-link"
              :class="{active: currentPage === 'game'}"
              @click="$router.push('/game')"
              :disabled="currentPage === 'game'">
            <span v-translate:ru>Игра</span>
            <span v-translate:en>Game</span>
          </button>
          <button
              class="nav-link"
              :class="{active: currentPage === 'news'}"
              @click="$router.push('/news')"
              :disabled="currentPage === 'news'">
            <span v-translate:ru>Новости</span>
            <span v-translate:en>News</span>
          </button>
          <button
              class="nav-link"
              :class="{active: currentPage === 'faq'}"
              @click="$router.push('/faq')"
              :disabled="currentPage === 'faq'">
            <span v-translate:ru>FAQ</span>
            <span v-translate:en>FAQ</span>
          </button>
          <button
              class="nav-link"
              :class="{active: currentPage === 'about'}"
              @click="$router.push('/about')"
              :disabled="currentPage === 'about'">
              <span v-translate:ru>О нас</span>
              <span v-translate:en>About us</span>
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
      collapseMenu: false,
      currentLocale: this.$language.current
    };
  },
  methods: {
    goToMainPage: function () {
      if (this.$store.state.room.connection === "online") {
        app.leaveRoom();
      }
      this.$router.push("/");
    }
  },
  created() {
    document.addEventListener("click", () => {
      this.collapseMenu = false;
    });
  },
  watch: {
    currentLocale: function (locale) {
      this.$setLocale(locale);
    }
  }
};
</script>
