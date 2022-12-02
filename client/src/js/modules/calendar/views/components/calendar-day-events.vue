<template>
  <div :id="`${date}_${month}_${year}`" class="tw-p-2 tw-w-full">
    <div class="tw-ml-2 tw-py-2 tw-border-b tw-border-content-cal-hl1-background" v-for="(visitHour, visitHourIndex) in visitDataKeys" :key="visitHourIndex">
      <p>{{ visitHour }}</p>
      <div v-for="(session, sessionIndex) in visitsByTime[visitHour]" :key="sessionIndex" class="tw-ml-1" :class="[Number(session['ACTIVE']) === 1 ? 'tw-bg-content-active' : '']">
        <p class="tw-ml-1">{{ session['BEAMLINENAME'] }}: <router-link  :to="`/dc/visit/${session['VISIT']}`" class="tw-no-underline tw-text-content-page-color">{{ session['VISIT'] }}</router-link> <span> ({{ session['LEN'] }})</span></p>
        <p class="tw-ml-2">- {{ session['BEAMLINEOPERATOR'] }}</p>
        <p class="tw-ml-1" v-if="session['SESSIONTYPE']">[{{ session['SESSIONTYPE'] }}]</p>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'calendar-day-events',
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
    },
    isToday: {
      type: Boolean,
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
          const visitHour = curr['STISO'].hour

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
  },
  watch: {
    visitsData: {
      deep: true,
      immediate: true,
      handler: 'groupVisitsByTime'
    }
  },
  computed: {
    visitDataKeys() {
      return Object.keys(this.visitsByTime).sort()
    }
  }
}
</script>
<style></style>