<template>
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
          <span v-translate:ru> Играть </span>
          <span v-translate:en> Play </span>
        </button>
        <button v-show="true"
            class="btn btn-bordered btn-shadow btn-yellow"
            @click="$emit('show-rules')">
          <span v-translate:ru> Правила </span>
          <span v-translate:en> Rules </span>
        </button>
      </main>
    </article>
  </div>
</template>

<script>
export default {
  name: "mainPage",
  beforeRouteEnter: function (to, from, next) {
    next(vm => {
      if (vm.$route.path === "/feedback") {
        vm.$emit("show-feedback");
      }
      if (vm.$route.path === "/rules") {
        vm.$emit("show-rules");
      }
    });
  },
};
</script>
