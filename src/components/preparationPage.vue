<template>
  <swiper class="page" id="preparation" :options="swiperOptions">
    <swiper-slide>
      <preparation-room-section @swipe-to="swiper().slideTo(1-$event)"/>
    </swiper-slide>
    <swiper-slide>
      <preparation-settings-section @swipe-to="swiper().slideTo(1-$event)"/>
    </swiper-slide>
  </swiper>
</template>

<script>
import {SWIPER_OPTIONS} from "src/config.js";

import preparationRoomSection from "cmp/preparationRoomSection.vue";
import preparationSettingsSection from "cmp/preparationSettingsSection.vue";

import {Swiper, SwiperSlide} from "vue-awesome-swiper";
import "swiper/swiper-bundle.css";

export default {
  name: "preparationPage",
  components: {preparationRoomSection, preparationSettingsSection, Swiper, SwiperSlide},
  data: function () {
    return {
      swiperOptions: {
        ...SWIPER_OPTIONS,
        slidesPerView: 1,
        virtualTranslate: true,
        initialSlide: 1,
        breakpoints: {
          800: {
            allowTouchMove: false,
            slidesPerView: 2,
          }
        },
        on: {
          setTranslate(swiper, translate) {
            swiper.slides[1].style.transform =
                `translate3D(${translate - swiper.slides[0].offsetWidth}px, 0px, 0px)`;
          },
          setTransition(swiper, transition) {
            swiper.slides[1].style.transitionDuration = `${transition}ms`;
          },
          resize(swiper) {
            swiper.slides[1].style.transform =
                `translate3D(${swiper.translate - swiper.slides[0].offsetWidth}px, 0px, 0px)`;
            swiper.slides[1].style.transitionDuration = `${swiper.transition}ms`;
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
