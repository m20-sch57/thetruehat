<template>
  <component :is="testComponent"/>
</template>

<script>
import playPage from "cmp/playPage.vue";
import preparationPage from "cmp/preparationPage.vue";

import {App, default as app} from "src/app.js";
import {getFreeKey} from "src/api.js";

function createUser() {
  return new App({
    commit: () => {
    }
  });
}

export default {
  components: {playPage, preparationPage},
  computed: {
    testComponent: function () {
      return this[this.$route.params.option + "Component"];
    },
    playPageComponent: function () {
      if (this.$store.state.room.connection === "online" &&
          this.$store.state.room.state === "play") {
        return "playPage";
      }
      return "";
    },
    preparationPageComponent: function () {
      if (this.$store.state.room.connection === "online" &&
          this.$store.state.room.state === "wait") {
        return "preparationPage";
      }
      return "";
    }
  },

  created: async function () {
    if (this.$route.params.option === "playPage") {
      let key = await getFreeKey();
      let app2 = createUser();
      app.joinRoom({username: "Федро", key});
      app2.joinRoom({username: "Бедро", key});
      app.startGame();
    }

    if (this.$route.params.option === "preparationPage") {
      let key = await getFreeKey();
      app.joinRoom({username: "user-1", key});
      createUser().joinRoom({username: "user-2", key});
      createUser().joinRoom({username: "user-3", key});
      createUser().joinRoom({username: "user-4", key});
    }
  }
};
</script>
