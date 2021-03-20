<template>
  <div id="test"></div>
</template>

<script>
import preparationPageTest from "cmp/shortcuts/preparationPage.js";
import resultsPageTest from "cmp/shortcuts/resultsPage.js";

const comps = {
  preparationPage: preparationPageTest,
  resultsPage: resultsPageTest
};

export default {
  mounted: function () {
    comps[this.$route.params.option]();
  }
};
</script>
