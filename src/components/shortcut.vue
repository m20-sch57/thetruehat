<template>
  <div id="test"></div>
</template>

<script>
import preparationPage from "cmp/shortcuts/preparationPage.js";
import resultsPage from "cmp/shortcuts/resultsPage.js";
import wordCollectionPage from "cmp/shortcuts/wordCollectionPage.js";

const comps = {
  preparationPage,
  resultsPage,
  wordCollectionPage
};

export default {
  mounted: function () {
    comps[this.$route.params.option]();
  }
};
</script>
