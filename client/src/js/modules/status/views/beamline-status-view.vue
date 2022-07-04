<template>
  <div class="content">
    <div class="tw-mb-3 content">
      <h1>{{ beamline }} Beamline Status</h1>
    </div>

    <div class="tw-w-full tw-flex tw-mb-3 tw-flex-wrap">
      <pv-item v-for="(pv, pvIndex) in pvs" :key="pvIndex" class="tw-mx-1/2 tw-my-1/2 md:tw-w-1/7 sm:tw-w-1/6" :pv-item="pv">
      </pv-item>
    </div>

    <div class="tw-full tw-mb-3">
      <pv-item v-for="(messagePV, messagePVIndex) in messagesPvs" :key="messagePVIndex" class="tw-mx-1/2 tw-my-1/2 tw-w-full" :pv-item="messagePV" value-class-names="" title-class-names="tw-font-bold tw-mb-2">
      </pv-item>
    </div>

    <div class="tw-mb-3">
      <h6 class="tw-font-bold">Webcams</h6>
      <div class="tw-w-full tw-flex">
        <div v-for="(webcam, webcamIndex) in webcams" :key="webcamIndex" class="tw-px-1">
          <img class="tw-w-full" :alt="webcam.alt" :src="webcam.url"/>
        </div>
      </div>
    </div>

    <div class="tw-mb-3">
      <h1 @click="toggleOAV">OAV</h1>
      <div v-show="showOAV" class="tw-w-full">
        <div class="sm:tw-w-1/3">
          <img class="tw-w-full"  :alt="oavData.alt" :src="oavData.url"/>
        </div>
      </div>
    </div>

    <div class="tw-mb-3">
      <h1>EPICS Screens</h1>
      <div class="tw-flex tw-w-full">
        <button
          v-for="(epic, epicIndex) in epicPages"
          :key="epicIndex"
          class="button tw-mx-1 tw-cursor-pointer"
          @click="showEpicMotor(epic)">
          {{ epic['NAME'] }}
        </button>
      </div>
    </div>

    <div v-if="isStaff" class="tw-mb-3">
      <h1>GDA Log</h1>
      <div class="tw-bg-content-light-background tw-m-2 tw-p-2 tw-rounded-sm tw-overflow-y-scroll tw-h-64 tw-text-content-page-color">
        <p v-for="(logItem, logIndex) in GDALogData" :key="logIndex">{{ logItem['LINE'] }}</p>
      </div>
    </div>

    <calendar-view :bl="beamline" :display-filters="false"/>

    <portal to="dialog">
      <dialog-box
        :hideOkButton="true"
        size="large"
        v-if="displayEpicMotorsModal"
        @close-modal-action="closeEpicMotor">
        <template slot="dialog-title">
          <div class="tw-relative tw-w-full tw-py-2">
            <p class="tw-font-bold">{{ selectedMotorTitle }}</p>
            <button class="button tw-absolute tw-right-0 tw-top-0" @click="closeEpicMotor"><i :class="['fa', 'fa-times']"></i></button>
          </div>
        </template>
        <div class="tw-flex tw-w-full tw-flex-wrap" v-if="selectedMotorItems.length > 0">
          <motor-view
            class="motor-view"
            title="Name"
            :motor-item="motorItem"
            v-for="(motorItem, motorItemIndex) in selectedMotorItems"
            :key="motorItemIndex"/>
        </div>
      </dialog-box>
    </portal>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'

import PVs from 'collections/pvs'
import GDALog from 'modules/status/collections/gda'
import EpicPages from 'modules/status/collections/epicspages'
import Motors from 'modules/status/collections/motors'

import PvItem from 'app/components/pv-item.vue'
import CalendarView from 'modules/calendar/views/calendar-view.vue'
import DialogBox from 'app/components/custom-dialog-box.vue'
import MotorView from 'modules/status/views/components/motor-view.vue'

export default {
  name: 'beamline-status',
  components: {
    'motor-view': MotorView,
    'pv-item': PvItem,
    'calendar-view': CalendarView,
    'dialog-box': DialogBox
  },
  props: {},
  data() {
    return {
      beamline: String(this.$route.params.bl),
      epicPages: [],
      epicPagesCollection: null,
      displayEpicMotorsModal: false,
      GDALogData: [],
      GDALogCollection: null,
      oavData: {
        alt: 'oav',
        url: '#'
      },
      pvs: [],
      messagesPvs: [],
      pvsCollection: null,
      messagePVsCollection: null,
      webcams: [
        {
          alt: 'webcam1',
          url: '#'
        },
        {
          alt: 'webcam2',
          url: '#'
        }
      ],
      selectedMotorItems: [],
      selectedMotorTitle: '',
      selectedMotorItemsCollections: null,
      showOAV: false
    }
  },
  mounted() {
    if (this.$route.params.bl === 'i02') {
      this.webcams.push({
        alt: 'webcam3',
        url: '#'
      })
    }

    if (this.isStaff) {
      this.fetchDGALogData()
    }
    this.fetchPVSData()
    this.fetchMessagePVSData()
    this.fetchEPICSPagesData()
    this.prepareWebcamDisplay()
  },
  methods: {
    async fetchDGALogData() {
      this.GDALogCollection = new GDALog(null, { bl: this.beamline })
      await this.$store.dispatch('getCollection', this.GDALogCollection)
    },
    async fetchPVSData() {
      this.pvsCollection = new PVs(null, { bl: this.beamline })
      await this.$store.dispatch('getCollection', this.pvsCollection)
    },
    async fetchMessagePVSData() {
      this.messagePVsCollection = new PVs(null, { bl: this.beamline, mmsg: true })
      await this.$store.dispatch('getCollection', this.messagePVsCollection)
    },
    async fetchEPICSPagesData() {
      this.epicPagesCollection = new EpicPages(null, { bl: this.beamline })
      const epicPages = await this.$store.dispatch('getCollection', this.epicPagesCollection)
      this.epicPages = epicPages.toJSON()
    },
    fetchCamToken(data) {
      return this.$store.dispatch('saveDataToApi', {
        url: `/download/sign`,
        data
      })
    },
    async prepareWebcamDisplay() {
      for (const [index, cam] of this.webcams.entries()) {
        const camToken = await this.fetchCamToken({
          validity: `/image/cam/bl/${this.beamline}/n/${index}`
        })
        cam.url = `${this.apiUrl}/image/cam/bl/${this.beamline}/n/${index}?token=${camToken.token}`
      }
    },
    async toggleOAV() {
      if (!this.showOAV) {
        const camToken = await this.fetchCamToken({
          validity: `/image/oav/bl/${this.beamline}`
        })

        this.oavData.url = `${this.apiUrl}/image/oav/bl/${this.beamline}?token=${camToken.token}`
      } else {
        this.oavData.url = '#'
      }

      this.showOAV = !this.showOAV
    },
    formatPvsCollectionData(data) {
      if (data) {
        this.pvs = this.pvsCollection.toJSON()
      }
    },
    formatMessagesPvsCollectionData(data) {
      if (data) {
        this.messagesPvs = this.messagePVsCollection.toJSON()
      }
    },
    formatGDALogCollectionData(data) {
      if (data) {
        this.GDALogData = this.GDALogCollection.toJSON()
      }
    },
    formatMotorItemsCollectionData(data) {
      if (data) {
        this.selectedMotorItems = this.selectedMotorItemsCollections.toJSON()
      }
    },
    async showEpicMotor(epics) {
      this.selectedMotorTitle = epics['NAME']
      this.selectedMotorItemsCollections = new Motors(null, { bl: this.beamline, epid: epics['ID'] })
      await this.$store.dispatch('getCollection', this.selectedMotorItemsCollections)
      this.$nextTick(() => {
        this.displayEpicMotorsModal = true
      })
    },
    closeEpicMotor() {
      this.selectedMotorItemsCollections.stop()
      this.selectedMotorItemsCollections = null
      this.selectedMotorItems = []
      this.displayEpicMotorsModal = false
    }
  },
  computed: {
    ...mapGetters({
      apiUrl: ['apiUrl'],
      isStaff: ['user/isStaff']
    })
  },
  watch: {
    pvsCollection: {
      deep: true,
      immediate: true,
      handler: 'formatPvsCollectionData'
    },
    messagePVsCollection: {
      deep: true,
      immediate: true,
      handler: 'formatMessagesPvsCollectionData'
    },
    GDALogCollection: {
      deep: true,
      immediate: true,
      handler: 'formatGDALogCollectionData'
    },
    selectedMotorItemsCollections: {
      deep: true,
      immediate: true,
      handler: 'formatMotorItemsCollectionData'
    }
  },
  beforeDestroy() {
    this.pvsCollection.stop()
    this.messagePVsCollection.stop()
    this.GDALogCollection.stop()
  }
}
</script>
<style>
.motor-view {
  width: calc(50% - 10px);
}
</style>