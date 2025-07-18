<template>
  <div class="content">
    <filter-pills
      v-if="displayFilters"
      class="tw-mt-3"
      :filter-data="beamlines"
      value-field="id"
      text-field="name"
      :selected="selectedBeamline"
      @filter-selected="updateSelectedFilter"
    />
    <h1 data-testid="status-calendar-header">Visits for {{ months[currentMonth] }} {{ currentYear }}</h1>

    <div class="tw-w-full tw-flex tw-mb-2">
      <div
        class="calendar-nav-button"
        @click="goToPreviousYear"
      >
        {{ previousYear }}
      </div>
      <div
        class="calendar-nav-button"
        @click="goToPreviousMonth"
      >
        {{ previousMonth }}
      </div>
      <div
        class="calendar-nav-button"
        @click="goToNextMonth"
      >
        {{ nextMonth }}
      </div>
      <div
        class="calendar-nav-button"
        @click="goToNextYear"
      >
        {{ nextYear }}
      </div>
    </div>

    <div class="tw-w-full tw-hidden sm:tw-flex">
      <div
        v-for="(day, dayIndex) in days"
        :key="dayIndex"
        class="calendar-day-header"
      >
        {{ day }}
      </div>
    </div>

    <div class="tw-hidden tw-w-full sm:tw-flex tw-flex-row sm:tw-flex-col tw-overflow-x-scroll sm:tw-overflow-x-hidden tw-h-auto">
      <div
        v-for="(weekValues, weekKey) in getDatesForDay(startDayOfMonth)"
        :key="weekKey"
        class="tw-w-full tw-flex tw-my-1/2"
      >
        <div
          v-for="(date, dateIndex) in weekValues"
          :key="dateIndex"
          :class="{
            'tw-bg-content-cal-background': date && !isToday(date),
            'tw-bg-content-cal-header-background': date && isToday(date)
          }"
          class="sm:tw-w-1/7  tw-h-32 tw-mx-1/2"
        >
          <div
            v-if="date"
            class="tw-hidden sm:tw-block tw-p-2 tw-h-40 tw-overflow-hidden hover:tw-overflow-visible hover:tw-h-auto hover:tw-relative"
            @mouseenter="onHover(`day-${date}-${currentSelectedMonth}-${currentYear}`, true)"
            @mouseleave="onHover(`day-${date}-${currentSelectedMonth}-${currentYear}`, false)"
          >
            <div :class="['sm:tw-bg-transparent', sortedVisitsByDay[date].length > 0 ? 'tw-bg-content-filter-background' : '']">
              <p class="tw-p-4 sm:tw-p-1">
                {{ date }}
              </p>
            </div>
            <calendar-day-events
              :ref="`day-${date}-${currentSelectedMonth}-${currentYear}`"
              class="tw-hidden sm:tw-block"
              :date="date"
              :is-today="isToday(date)"
              :day="days[dateIndex]"
              :visits-data="sortedVisitsByDay[date]"
              :month="currentSelectedMonth"
              :year="currentYear"
            />
          </div>
        </div>
      </div>
    </div>

    <div
      id="mobileDateWrapper"
      class="tw-w-full sm:tw-hidden tw-flex tw-flex-row tw-overflow-x-scroll"
      @scroll="handleScrollDebounced({
        event: $event,
        targetId: 'mobileDayVisitsWrapper',
        targetDirection: 'ttb',
        sourceDirection: 'rtl'
      })"
    >
      <div
        v-for="([date, day], index) in Object.entries(dateAndDays)"
        :key="index"
        :data-visit="date && sortedVisitsByDay[date].length > 0 ? date : ''"
        :class="[
          date && sortedVisitsByDay[date].length > 0 ? 'tw-bg-content-filter-background' : '',
          'tw-mx-1',
          'tw-cursor-pointer'
        ]"
        @click="goToDate(date)"
      >
        <p
          class="tw-p-4 sm:tw-p-1"
          :class="[isPastDate(date) ? 'tw-text-content-cal-past-date' : '']"
        >
          {{ day }}
        </p>
        <p
          class="tw-p-4 sm:tw-p-1 tw-text-center"
          :class="[isPastDate(date) ? 'tw-text-content-cal-past-date' : '']"
        >
          {{ date }}
        </p>
      </div>
    </div>
    <div
      id="mobileDayVisitsWrapper"
      class="tw-w-full sm:tw-hidden tw-overflow-y-scroll mobile-calendar-view tw-mt-4"
    >
      <div
        v-for="([date, day], index) in Object.entries(dateAndDays)"
        :key="index"
        :data-visit="date && sortedVisitsByDay[date].length > 0 ? date : ''"
      >
        <div v-if="date && sortedVisitsByDay[date].length">
          <div class="tw-mb-2">
            {{ day }} {{ date }} {{ currentSelectedMonth }}
          </div>
          <calendar-day-events
            :date="Number(date)"
            :day="day"
            :visits-data="sortedVisitsByDay[date]"
            :month="currentSelectedMonth"
            :year="currentYear"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { debounce } from 'lodash-es'

import Visits from 'collections/visits'
import Beamlines from 'collections/bls'
import FilterPills from 'app/components/filter-pills.vue'
import CalendarDayEvents from 'modules/calendar/views/components/calendar-day-events.vue'
import { DateTime } from 'luxon'

export default {
  name: 'CalendarView',
  components: {
    'calendar-day-events': CalendarDayEvents,
    'filter-pills': FilterPills
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
      days: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      shortDays: [
        'Mon',
        'Tues',
        'Wed',
        'Thurs',
        'Fri',
        'Sat',
        'Sun',
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
      currentMonth: null,
      currentDay: null,
      currentYear: null,
      visits: [],
      selectedBeamline: this.bl || 'all',
      beamlines: []
    }
  },
  mounted() {
    const dateTime = this.todayDate
    this.currentMonth = dateTime.month - 1
    this.currentDay = dateTime.day
    this.currentYear = dateTime.year
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

        if (app.staff) queryParams.ty = 'calendar'
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
      if (this.currentMonth == -1) {
        this.currentMonth = 11
        this.goToPreviousYear()
      }
    },
    goToNextMonth() {
      this.currentMonth = this.currentMonth + 1
      if (this.currentMonth == 12) {
        this.currentMonth = 0
        this.goToNextYear()
      }
    },
    goToNextYear() {
      this.currentYear = this.currentYear + 1
    },
    getDatesForDay(startDayOfMonth) {
      const start = startDayOfMonth < 1 ? 0 : startDayOfMonth
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
          acc[currentWeek] = [date]
        }

        if (index === this.daysInMonth - 1 && acc[currentWeek].length < 7) {
          const remaining = 7 - acc[currentWeek].length

          acc[currentWeek] = acc[currentWeek].concat(Array(remaining).fill(''))
        }

        return acc
      }, {})
    },
    isToday(date) {
      const { month, day, year } = this.todayDate
      return date === day && month - 1 === this.currentMonth && year === this.currentYear
    },
    isPastDate(date) {
      const dateItem = DateTime.fromObject({
        year: this.currentYear,
        month: this.currentMonth + 1,
        day: date,
        zone: this.timezone
      })

      return dateItem < this.todayDate

    },
    onHover(ref, addHover) {
      const hoveredRef = this.$refs[ref][0].$el

      if (hoveredRef && addHover) {
        hoveredRef.classList.add('tw-bg-content-cal-hl1-background', 'tw-h-auto', 'tw-absolute')

      } else if (hoveredRef && !addHover) {
        hoveredRef.classList.remove('tw-bg-content-cal-hl1-background', 'tw-h-auto', 'tw-absolute')
      }
    },
    handleScrollDebounced: debounce(function({ event, targetId, targetDirection, sourceDirection }) {
      this.handleDivScroll({event, targetId, targetDirection, sourceDirection})
    }, 1000),
    handleDivScroll({
      event,
      targetId,
      targetDirection,
      sourceDirection
    }) {
      const children = event.target.children
      const parentRect = event.target.getBoundingClientRect()
      const otherContainer = document.getElementById(targetId)
      const otherContainerRect = otherContainer.getBoundingClientRect()
      let scrollingDivAttribute = ''

      const parentStartDirection = sourceDirection === 'rtl' ? 'left' : 'top'
      const childStart = sourceDirection === 'rtl' ? 'right' : 'bottom'

      const targetChildPart = targetDirection === 'rtl' ? 'offsetLeft' : 'offsetTop'
      const targetContainerDirection = targetDirection === 'rtl' ? 'scrollLeft' : 'scrollTop'
      const targetRectDirection = targetDirection === 'rtl' ? 'left' : 'top'

      for (let i = 0; i < children.length; i++) {
        const childRect = children[i].getBoundingClientRect()
        if (Math.floor(childRect[childStart]) - Math.floor(parentRect[parentStartDirection]) > 0) {
          scrollingDivAttribute = children[i].getAttribute('data-visit')
          break
        }
      }

      const matchingChild = otherContainer.querySelectorAll(`[data-visit="${scrollingDivAttribute}"]`)

      if (matchingChild.length > 0 && matchingChild[0].getAttribute('data-visit') === scrollingDivAttribute) {
        otherContainer[targetContainerDirection] = Math.floor(matchingChild[0][targetChildPart]) - Math.floor(otherContainerRect[targetRectDirection])
      }
    },
    goToDate(date) {
      const visitsWrapper = document.getElementById('mobileDayVisitsWrapper')
      const dateElement = visitsWrapper.querySelectorAll(`[data-visit="${date}"]`)
      const parentRect = visitsWrapper.getBoundingClientRect()

      if (dateElement.length > 0 && dateElement[0].getAttribute('data-visit') === String(date)) {
        visitsWrapper.scrollTop = Math.floor(dateElement[0].offsetTop) - Math.floor(parentRect.top)
      }
    }
  },
  computed: {
    ...mapGetters({
      proposalType: ['proposal/currentProposalType'],
      appOption: ['getAppOptions']
    }),
    timezone() {
      return this.appOption['timezone']
    },
    todayDate() {
      return DateTime.local().setZone(this.timezone)
    },
    currentSelectedMonth() {
      return this.months[this.currentMonth]
    },
    previousMonth() {
      var value
      if (this.currentMonth == 0) {
        value = this.months.slice(11)
      } else {
        value = this.months.slice(this.currentMonth - 1)
      }
      return value[0]
    },
    nextMonth() {
      var value
      if (this.currentMonth == 11) {
        value = this.months.slice(0)
      } else {
        value = this.months.slice(this.currentMonth + 1)
      }
      return value[0]
    },
    previousYear() {
      return this.currentYear - 1
    },
    nextYear() {
      return this.currentYear + 1
    },
    daysInMonth() {
      return DateTime.fromObject({
        year: this.currentYear,
        month: this.currentMonth + 1,
        day: 1,
        zone: this.timezone
      }).daysInMonth
    },
    startDayOfMonth() {
      return DateTime.fromObject({
        year: this.currentYear,
        month: this.currentMonth + 1,
        day: 1,
        zone: this.timezone
      }).weekday - 1
    },
    sortedVisitsByDay() {
      return Array(this.daysInMonth).fill('').reduce((acc, curr, index) => {
        const number = index + 1

        acc[number] = this.visits.filter(visit => {
          const { year, month, day } = visit['STISO']
          return year === this.currentYear && month - 1 === this.currentMonth && day === number
        })

        return acc
      }, {})
    },
    dateAndDays() {
      return Array(this.daysInMonth).fill('').reduce((acc, curr, index) => {
        const dayOfWeek = this.startDayOfMonth + index
        acc[index + 1] = this.shortDays[dayOfWeek % 7]

        return acc
      }, {})
    }
  },
  watch: {
    currentYear: {
      handler: function(newVal, oldVal) {
          if (oldVal != null) this.fetchVisitsCalendar()
      }
    },
    currentMonth: {
      handler: function(newVal, oldVal) {
          if (oldVal != null) this.fetchVisitsCalendar()
      }
    }
  }
}
</script>
<style>
.calendar-nav-button {
  @apply tw-h-12 tw-px-2 tw-py-4 tw-w-1/4 tw-flex tw-items-center tw-justify-center tw-mx-1/2 tw-bg-content-cal-background tw-cursor-pointer
}
.mobile-calendar-view {
  height: 500px;
}
.calendar-day-header {
  @apply tw-flex tw-items-center tw-justify-center tw-font-bold tw-h-12 tw-w-1/7 tw-py-4 tw-px-4 tw-bg-content-filter-background tw-mx-1/2;
}
</style>
