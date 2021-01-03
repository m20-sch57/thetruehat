<template>
  <swiper class="page" id="play" :options="swiperOptions">
    <swiper-slide class="first-slide">
      <play-info-section @swipe-to="swiper().slideTo($event)"/>
    </swiper-slide>
    <swiper-slide class="second-slide">
      <play-turn-section @swipe-to="swiper().slideTo($event)"/>
    </swiper-slide>
  </swiper>
</template>

<script>
import playInfoSection from "cmp/playInfoSection.vue";
import playTurnSection from "cmp/playTurnSection.vue";

import {Swiper, SwiperSlide} from "vue-awesome-swiper";
import "swiper/swiper-bundle.css";

export default {
  name: "playPage",
  components: {playInfoSection, playTurnSection, Swiper, SwiperSlide},
  data: function () {
    return {
      swiperOptions: {
        slidesPerView: "auto",
        breakpoints: {
          800: {
            followFinger: false
          }
        }
      }
    };
  },
  methods: {
    swiper: function () {
      return document.getElementById("play").swiper;
    }
  }
};
</script>
