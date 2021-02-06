<template>
  <swiper class="page" id="results" :options="swiperOptions">
    <swiper-slide>
      <results-history-section @swipe-to="swiper().slideTo($event)"/>
    </swiper-slide>
    <swiper-slide>
      <results-table-section @swipe-to="swiper().slideTo($event)"/>
    </swiper-slide>
    <swiper-slide>
      <results-statistics-section @swipe-to="swiper().slideTo($event)"/>
    </swiper-slide>
  </swiper>
</template>

<script>
import resultsHistorySection from "cmp/resultsHistorySection.vue";
import resultsTableSection from "cmp/resultsTableSection.vue";
import resultsStatisticsSection from "cmp/resultsStatisticsSection.vue";

import {Swiper, SwiperSlide} from "vue-awesome-swiper";
import "swiper/swiper-bundle.css";

export default {
  name: "resultsPage",
  components: {resultsHistorySection, resultsTableSection, resultsStatisticsSection,
    Swiper, SwiperSlide},
  data: function () {
    return {
      swiperOptions: {
        slidesPerView: 1,
        initialSlide: 1,
        // virtualTranslate: true,
        breakpoints: {
          1250: {
            allowTouchMove: false,
            slidesPerView: 3,
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
