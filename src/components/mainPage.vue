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
          Играть
        </button>
        <button
            class="btn btn-bordered btn-shadow btn-yellow"
            @click="$emit('show-rules')">
          Правила
        </button>
      </main>
    </article>
  </div>
</template>

<script>
export default {
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
