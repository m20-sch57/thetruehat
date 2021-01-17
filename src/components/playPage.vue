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
        initialSlide: 1,
        breakpoints: {
          800: {
            followFinger: false
          }
        },
        on: {
          setTranslate(swiper, translate) {
            swiper.slides[1].style.transform =
                `translate3D(${(-translate - swiper.slides[0].offsetWidth) *
                (document.body.clientWidth < 800 ? 1 : 0)}px, 0px, 0px)`;
          },
          setTransition(swiper, transition) {
            swiper.slides[1].style.transitionDuration = `${transition}ms`;
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
