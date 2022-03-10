<template>
  <div :id="`${date}_${month}_${year}`">
    <div class="sm:tw-hidden tw-mb-2">{{ day }} {{ date }} {{ month }}</div>
    <div class="tw-ml-2" v-for="(visitHour, visitHourIndex) in visitDataKeys" :key="visitHourIndex">
      <p>{{ visitHour }}</p>
      <div v-for="(session, sessionIndex) in visitsData[visitHour]" :key="sessionIndex" class="tw-ml-1">
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
      type: Object,
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
  computed: {
    visitDataKeys() {
      return Object.keys(this.visitsData).sort()
    }
  }
}
</script>
<style></style>