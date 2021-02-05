<template>
  <component :is='currentPageComponent'/>
</template>

<script>
import preparationPage from "cmp/preparationPage.vue";
import joinPage from "cmp/joinPage.vue";
import playPage from "cmp/playPage.vue";
import resultsPage from "cmp/resultsPage.vue";

import store from "src/store.js";

const room = store.state.room;

export default {
  name: "gamePage",
  components: {preparationPage, joinPage, playPage, resultsPage},
  computed: {
    currentPageComponent: function () {
      if (room.connection === "offline") {
        return "joinPage";
      } else if (room.connection === "connection") {
        return "joinPage";
      } else if (room.connection === "online") {
        if (room.state === "wait") {
          return "preparationPage";
        } else if (room.state === "play") {
          return "playPage";
        } else if (room.state === "end") {
          return "resultsPage";
        }
      }
      return "";
    }
  },
  beforeRouteEnter: function (to, from, next) {
    next(vm => {
      if (vm.$store.state.room.connection === "online") {
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
