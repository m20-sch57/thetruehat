<template>
  <body>
  <navbar
      currentPage="game"
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
  <swiper class="page" id="preparation" :options="swiperOptions">
    <swiper-slide>
      <roomSection @swipe-to-settings="swiper().slideTo(1)"/>
    </swiper-slide>
    <swiper-slide>
      <settingsSection @swipe-to-room="swiper().slideTo(0)"/>
    </swiper-slide>
  </swiper>
  </body>
</template>

<script>
import navbar from "cmp/navbar.vue";
import rules from "cmp/rulesPopup.vue";
import feedback from "cmp/feedbackPopup.vue";
import roomSection from "cmp/roomSection.vue";
import settingsSection from "cmp/settingsSection.vue";

import {Swiper, SwiperSlide} from "vue-awesome-swiper";
import "swiper/swiper-bundle.css";

export default {
  components: {navbar, rules, feedback, roomSection, settingsSection, Swiper, SwiperSlide},
  data: function () {
    return {
      showRules: false,
      showFeedback: false,
      swiperOptions: {
        slidesPerView: 1,
        breakpoints: {
          800: {
            followFinger: false,
            slidesPerView: 2,
          }
        }
      }
    };
  },
  methods: {
    swiper: function () {
      return document.getElementById("preparation").swiper;
    }
  }
};
</script>
