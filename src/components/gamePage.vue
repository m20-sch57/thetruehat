<template>
  <component v-bind:is='currentPageComponent'/>
</template>

<script>
import preparationPage from "cmp/preparationPage.vue";
import joinPage from "cmp/joinPage.vue";

export default {
  components: {preparationPage, joinPage},
  computed: {
    currentPageComponent: function () {
      if (this.$store.state.room.connection === "offline") {
        return "joinPage";
      } else if (this.$store.state.room.connection === "online") {
        return "preparationPage";
      } else if (this.$store.state.room.connection === "connection") {
        return "joinPage";
      } else {
        return "";
      }
    }
  },
  beforeRouteEnter: function (to, from, next) {
    next(vm => {
      if (vm.$store.state.room.connection !== "online") {
        if (Object.keys(vm.$route.query).length) {
          vm.$router.replace({query: vm.$route.query});
        }
      } else {
        if (Object.keys(vm.$route.query)[0] !== vm.$store.state.room.key) {
          let query = {};
          query[vm.$store.state.room.key] = null;
          vm.$router.replace({query});
        }
      }
    });
  }
};
</script>
