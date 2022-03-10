<template>
  <div
    class="tw-p-2 tw-h-32 tw-overflow-hidden hover:tw-overflow-visible hover:tw-h-auto hover:tw-relative"
    @mouseenter="onHover(`day-${date}-${month}-${year}`, true)"
    @mouseleave="onHover(`day-${date}-${month}-${year}`, false)"
  >
    <div class="tw-flex tw-flex-col sm:tw-justify-start tw-justify-center">
      <p class="sm:tw-hidden tw-block">{{ day }}</p>
      <div
        :class="{
          'tw-bg-content-filter-background': Object.keys(visitsByTime).length > 0,
          'sm:tw-bg-transparent': true
      }">
        <p class="tw-p-4 sm:tw-p-1">{{ date }}</p>
      </div>
    </div>
    <calendar-day-events
      :ref="`day-${date}-${month}-${year}`"
      class="tw-hidden sm:tw-block tw-py-2"
      :visits-data="visitsByTime"
      :year="year"
      :date="date"
      :day="day"
      :month="month"/>
  </div>
</template>
<script>
import CalendarDayEvents from 'modules/calendar/views/components/calendar-day-events.vue';

export default {
  name: 'calendar-day',
  components: {
    'calendar-day-events': CalendarDayEvents
  },
  props: {
    date: {
      type: Number,
      required: true
    },
    visitsData: {
      type: Array,
      required: true
    },
    day: {
      type: String,
      required: true
    },
    month: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      visitsByTime: {}
    }
  },
  mounted() {
    this.groupVisitsByTime()
  },
  methods: {
    groupVisitsByTime() {
      if (this.visitsData) {
        this.visitsByTime = this.visitsData.reduce((acc, curr) => {
          const visitHour = new Date(curr['STISO']).getUTCHours()

          const hourString = String(visitHour).length > 1 ? `${visitHour}:00` : `0${visitHour}:00`

          if (acc[hourString]) {
            acc[hourString].push(curr)
          } else {
            acc[hourString] = [curr]
          }

          return acc
        }, {})
      }
    },
    onHover(ref, addHover) {
      const hoveredRef = this.$refs[ref].$el

      if (addHover) {
        hoveredRef.classList.add('tw-bg-content-cal-hl1-background', 'tw-h-auto', 'tw-absolute')

      } else {
        hoveredRef.classList.remove('tw-bg-content-cal-hl1-background', 'tw-h-auto', 'tw-absolute')
      }
    }
  },
  watch: {
    visitsData: {
      deep: true,
      immediate: true,
      handler: 'groupVisitsByTime'
    }
  }
}
</script>
<style></style>