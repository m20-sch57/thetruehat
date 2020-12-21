<template>
  <nav class="nav" id="navbar">
    <button
        @click="$router.push('/')"
        class="link nav-brand">
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
              @click="$router.push('/game')">
            Игра
          </button>
          <button
              class="nav-link"
              :class="{active: currentPage === 'news'}"
              @click="$router.push('/news')">
            Новости
          </button>
          <button
              class="nav-link"
              :class="{active: currentPage === 'faq'}"
              @click="$router.push('/faq')">
            FAQ
          </button>
          <button
              class="nav-link"
              :class="{active: currentPage === 'about'}"
              @click="$router.push('/about')">
            О нас
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
            <select class="select btn-transparent">
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
export default {
  props: {
    currentPage: String
  },
  data: function () {
    return {
      collapseMenu: false
    }
  },
  created() {
    document.addEventListener("click", () => {
      this.collapseMenu = false;
    });
  }
}
</script>
