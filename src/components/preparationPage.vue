<template>
  <swiper class="page" id="preparation" :options="swiperOptions">
    <swiper-slide>
      <roomSection @swipe-to-settings="swiper().slideTo(1)"/>
    </swiper-slide>
    <swiper-slide>
      <settingsSection @swipe-to-room="swiper().slideTo(0)"/>
    </swiper-slide>
  </swiper>
</template>

<script>
import roomSection from "cmp/roomSection.vue";
import settingsSection from "cmp/settingsSection.vue";

import {Swiper, SwiperSlide} from "vue-awesome-swiper";
import "swiper/swiper-bundle.css";

export default {
  components: {roomSection, settingsSection, Swiper, SwiperSlide},
  data: function () {
    return {
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
