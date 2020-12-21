<template>
  <body>
  <navbar
      currentPage="main"
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
  <div class="page" id="main">
    <article>
      <header>
        <picture>
          <img src="img/hat.png" alt="hat">
        </picture>
      </header>
      <main>
        <button
            class="btn btn-bordered btn-shadow btn-green"
            @click="$router.push('/game')">
          Играть
        </button>
        <button
            class="btn btn-bordered btn-shadow btn-yellow"
            @click="showRules = true">
          Правила
        </button>
      </main>
    </article>
  </div>
  </body>
</template>

<script>
import navbar from "cmp/navbar.vue"
import rules from "cmp/rulesPopup.vue"
import feedback from "cmp/feedbackPopup.vue"

export default {
  components: {navbar, rules, feedback},
  data: function () {
    return {
      showRules: false,
      showFeedback: false
    }
  },
  beforeRouteEnter: function (to, from, next) {
    next(vm => {
      if (vm.$route.path === "/feedback") {
        vm.showFeedback = true;
      }
      if (vm.$route.path === "/rules") {
        vm.showRules = true;
      }
    })
  },
}
</script>
