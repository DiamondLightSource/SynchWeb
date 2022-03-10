<template>
  <div class="content">
    <filter-pills v-if="displayFilters" :filter-data="beamlines" value-field="id" text-field="name" :selected="this.selectedBeamline" @filter-selected="updateSelectedFilter" />
    <h1>Visits for {{ months[currentMonth] }} {{ currentYear }}</h1>

    <div class="tw-w-full tw-flex tw-mb-2">
      <div class="calendar-nav-button" @click="goToPreviousYear"> {{ previousYear}} </div>
      <div class="calendar-nav-button" @click="goToPreviousMonth">{{ previousMonth}}</div>
      <div class="calendar-nav-button" @click="goToNextMonth">{{ nextMonth }}</div>
      <div class="calendar-nav-button" @click="goToNextYear">{{ nextYear }}</div>
    </div>

    <div class="tw-w-full tw-hidden sm:tw-flex">
      <div
        class="tw-flex tw-items-center tw-justify-center tw-font-bold tw-h-8 tw-w-1/7 tw-py-2 tw-px-4 tw-bg-content-filter-background tw-mx-1"
        v-for="(day, dayIndex) in days" :key="dayIndex">
        {{ day }}
      </div>
    </div>

    <div class="tw-w-full tw-flex tw-flex-row sm:tw-flex-col tw-overflow-x-scroll sm:tw-overflow-x-hidden tw-h-auto">
      <div
        v-for="(weekValues, weekKey) in getDatesForDay(startDayOfMonth)"
        :key="weekKey"
        class="tw-w-full tw-flex tw-my-2">
        <div
          v-for="(date, dateIndex) in weekValues"
          :key="dateIndex"
          :class="{
            'tw-bg-content-cal-background': date && currentDate.getUTCDate() !== date,
            'tw-bg-content-cal-header-background': date && currentDate.getUTCDate() === date
          }"
          class="sm:tw-w-1/7  tw-h-32 tw-mx-1">
          <calendar-day
            v-if="date"
            :date="date"
            :day="days[dateIndex]"
            :visits-data="sortedVisitsByDay[date]"
            :month="currentSelectedMonth"
            :year="currentYear"/>
        </div>
      </div>
    </div>
  </div>

</template>
<script>
import { mapGetters } from 'vuex'

import Visits from 'collections/visits'
import Beamlines from 'collections/bls'
import CalendarDay from 'modules/calendar/views/components/calendar-day.vue'
import FilterPills from 'app/components/filter-pills.vue'

export default {
  name: 'calendar-view',
  components: {
    'filter-pills': FilterPills,
    'calendar-day': CalendarDay
  },
  props: {
    bl: {
      type: String,
      default: '',
      required: true
    },
    displayFilters: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      currentDate: new Date(),
      days: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      months: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ],
      currentMonth: new Date().getUTCMonth(),
      currentDay: new Date().getUTCDate(),
      currentYear: new Date().getUTCFullYear(),
      visits: [],
      selectedBeamline: this.bl || 'all',
      beamlines: []
    }
  },
  mounted() {
    this.fetchBeamlinesByType()
    this.fetchVisitsCalendar()
  },
  methods: {
    async fetchBeamlinesByType() {
      const beamlinesCollection = new Beamlines(null, { ty: app.type })
      const beamlines = await this.$store.dispatch('getCollection', beamlinesCollection)

      const beamlinesList = beamlines.toJSON().map((beamline) => ({ id: beamline['BEAMLINE'], name: beamline['BEAMLINE'] }))
      this.beamlines = [{ id: 'all', name: 'All' }, ...beamlinesList]
    },
    async fetchVisitsCalendar() {
      try {
        this.$store.commit('loading', true)
        const currentMonth = this.currentMonth + 1
        const queryParams = {
          year: this.currentYear,
          month: currentMonth < 10 ? `0${currentMonth}` : currentMonth,
          all: 1,
        }

        queryParams.ty = this.proposalType
        if (this.selectedBeamline !== 'all') queryParams.bl = this.selectedBeamline

        const visitsCollection = new Visits(null, {
          queryParams: queryParams,
          state: { pageSize: 9999 }
        })

        const visits = await this.$store.dispatch('getCollection', visitsCollection)

        this.visits = visits.toJSON()

      } catch (error) {
        this.$store.commit('notifications/addNotification', {
          message: 'An error occurred while fetching visits data',
          level: 'error'
        })
      } finally {
        this.$store.commit('loading', false)
      }
    },
    async updateSelectedFilter(beamline) {
      this.selectedBeamline = beamline

      if (this.selectedBeamline !== 'all') {
        await this.$router.push(`/cal/bl/${this.selectedBeamline}`)
      } else {
        await this.$router.push(`/cal`)
      }
    },
    goToPreviousYear() {
      this.currentYear = this.currentYear - 1
    },
    goToPreviousMonth() {
      this.currentMonth = this.currentMonth - 1
    },
    goToNextMonth() {
      this.currentMonth = this.currentMonth + 1
    },
    goToNextYear() {
      this.currentYear = this.currentYear + 1
    },
    getDatesForDay(startDayOfMonth) {
      const start = startDayOfMonth < 1 ? 0 : startDayOfMonth - 1
      let currentWeek = 1
      return Array(this.daysInMonth).fill('').reduce((acc, curr, index) => {
        const date = index + 1

        if (index === 0) {
          acc[currentWeek] = Array(start).fill('')
          acc[currentWeek].push(date)

          return acc
        }

        if (!acc[currentWeek]) {
          acc[currentWeek] = []
        }

        const currentWeekDays = acc[currentWeek].length

        if (currentWeekDays < 7) {
          acc[currentWeek].push(date)
        } else {
          currentWeek += 1
          acc[currentWeek] = []
          acc[currentWeek].push(date)
        }

        if (index === this.daysInMonth - 1 && acc[currentWeek].length < 7) {
          const remaining = 7 - acc[currentWeek].length

          acc[currentWeek] = acc[currentWeek].concat(Array(remaining).fill(''))
        }

        return acc
      }, {})
    },
  },
  computed: {
    ...mapGetters({
      proposalType: ['proposal/currentProposalType']
    }),
    currentSelectedMonth() {
      return this.months[this.currentMonth]
    },
    previousMonth() {
      const [value] = this.months.slice(this.currentMonth - 1)
      return value
    },
    nextMonth() {
      const [value] = this.months.slice(this.currentMonth + 1)
      return value
    },
    previousYear() {
      return this.currentYear - 1
    },
    nextYear() {
      return this.currentYear + 1
    },
    daysInMonth() {
      return new Date(this.currentYear, this.currentMonth + 1, 0).getDate()
    },
    startDayOfMonth() {
      return new Date(this.currentYear, this.currentMonth, 1).getUTCDay()
    },
    endDayOfMonth() {
      return new Date(this.currentYear, this.currentMonth, this.daysInMonth).getUTCDay()
    },
    sortedVisitsByDay() {
      return Array(this.daysInMonth).fill('').reduce((acc, curr, index) => {
        const number = index + 1
        const date = new Date(this.currentYear, this.currentMonth, number)

        acc[number] = this.visits.filter(visit => {
          return new Date(visit['STISO']) >= date && new Date(visit['STISO']) < new Date(date.getTime() + (24 * 3600 * 1000))
        })

        return acc
      }, {})
    }
  },
  watch: {
    currentYear: {
      handler: 'fetchVisitsCalendar'
    },
    currentMonth: {
      handler: 'fetchVisitsCalendar'
    }
  }
}
</script>
<style>
.calendar-nav-button {
  @apply tw-h-10 tw-p-2 tw-w-1/4 tw-flex tw-items-center tw-justify-center tw-mx-1 tw-bg-content-cal-background tw-cursor-pointer
}
</style>