<template>
  <swiper
      class="page"
      id="play"
      :options="swiperOptions"
      :class="{'hide-menu': isMenuHidden}">
    <swiper-slide class="first-slide">
      <play-info-section
          @show-menu="showMenu"
          @hide-menu="hideMenu"/>
    </swiper-slide>
    <swiper-slide class="second-slide">
      <play-turn-section
        :isMenuHidden="isMenuHidden"
          @show-menu="showMenu"
          @hide-menu="hideMenu"/>
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
      isMenuHidden: true,
      swiperOptions: {
        slidesPerView: "auto",
        initialSlide: 1,
        virtualTranslate: true,
        breakpoints: {
          800: {
            allowTouchMove: false,
          }
        },
        on: {
          setTranslate(swiper, translate) {
            swiper.slides[1].style.transform =
                `translate3D(${-swiper.slides[0].offsetWidth}px, 0px, 0px)`;
            swiper.slides[0].style.transform =
                `translate3D(${translate}px, 0px, 0px)`;
          },
          setTransition(swiper, transition) {
            swiper.slides[0].style.transitionDuration = `${transition}ms`;
          },
          resize(swiper) {
            swiper.slides[1].style.transform =
                `translate3D(${-swiper.slides[0].offsetWidth}px, 0px, 0px)`;
          }
        }
      }
    };
  },
  methods: {
    swiper: function () {
      return document.getElementById("play").swiper;
    },
    showMenu: function () {
      console.log("here");
      this.swiper().slideTo(0);
      this.isMenuHidden = false;
    },
    hideMenu: function () {
      this.swiper().slideTo(1);
      this.isMenuHidden = true;
    }
  }
};
</script>
