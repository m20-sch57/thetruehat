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
            class="btn btn-shadow btn-green"
            @click="$router.push('/game')">
          <ru>Играть</ru>
          <en>Play</en>
        </button>
        <button
            v-show="true"
            class="btn btn-shadow btn-yellow"
            @click="$emit('show-rules')">
          <ru>Правила</ru>
          <en>Rules</en>
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
