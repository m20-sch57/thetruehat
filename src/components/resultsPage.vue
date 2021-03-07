<template>
  <swiper class="page" id="results" :options="swiperOptions">
    <swiper-slide class="first-slide">
      <results-history-section @swipe-to="swiper().slideTo($event)"/>
    </swiper-slide>
    <swiper-slide class="second-slide">
      <results-table-section @swipe-to="swiper().slideTo($event)"/>
    </swiper-slide>
    <swiper-slide class="third-slide">
      <results-statistics-section @swipe-to="swiper().slideTo($event)"/>
    </swiper-slide>
  </swiper>
</template>

<script>
import {SWIPER_OPTIONS} from "src/config.js";

import resultsHistorySection from "cmp/resultsHistorySection.vue";
import resultsTableSection from "cmp/resultsTableSection.vue";
import resultsStatisticsSection from "cmp/resultsStatisticsSection.vue";

import {Swiper, SwiperSlide} from "vue-awesome-swiper";
import "swiper/swiper-bundle.css";

export default {
  name: "resultsPage",
  components: {
    resultsHistorySection, resultsTableSection, resultsStatisticsSection,
    Swiper, SwiperSlide
  },
  data: function () {
    return {
      swiperOptions: {
        ...SWIPER_OPTIONS,
        slidesPerView: "auto",
        initialSlide: 1,
        breakpoints: {
          1250: {
            allowTouchMove: false,
          }
        }
      }
    };
  },
  methods: {
    swiper: function () {
      return document.getElementById("results").swiper;
    }
  }
};
</script>
