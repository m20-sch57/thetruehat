<template>
  <swiper class="page" id="preparation" :options="swiperOptions">
    <swiper-slide>
      <preparation-room-section @swipe-to="swiper().slideTo($event)"/>
    </swiper-slide>
    <swiper-slide>
      <preparation-settings-section @swipe-to="swiper().slideTo($event)"/>
    </swiper-slide>
  </swiper>
</template>

<script>
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
