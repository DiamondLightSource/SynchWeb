<template>
  <div v-if="epicItem.t === 1" class="tw-m-1">
    <div class="tw-bg-content-search-background tw-p-4 tw-rounded">
      <div class="tw-flex tw-w-full tw-items-center tw-mb-2">
        <h1 class="tw-bg-content-highlight tw-flex-1 tw-p-2 tw-font-bold">{{ epicItem.title }}</h1>
        <div class="tw-p-2 tw-bg-motor-value-background" title="Set Value">{{ epicItem.val['VAL'] }}</div>
      </div>

      <div
        class="tw-w-full tw-flex tw-justify-center tw-items-center"
        @mouseenter="onHover(`epics_${epicsId}`, true)"
        @mouseleave="onHover(`epics_${epicsId}`, false)"
      >
        <div
          :class="{
            'tw-bg-content-inactive': epicItem.val['SEVR'].toLowerCase() === 'major',
            'tw-bg-content-minor': epicItem.val['SEVR'].toLowerCase() === 'minor',
            'tw-bg-content-header-color': !['minor', 'major'].includes(epicItem.val['SEVR'].toLowerCase()),
            'motor-button': true,
            'tw-w-2/12': true,
            'tw-mr-2': true,
            'tw-text-white': true,
          }"
          title="Alarm">!</div>
        <div
          class="tw-border tw-border-black tw-rounded-sm tw-flex-1 tw-mx-2 tw-text-center tw-text-motor-readback-text tw-p-1"
          title="Readback Value">
          {{ epicItem.val['RBV'] }}
        </div>
        <div
          :class="{
            'tw-bg-content-active':  epicItem.val['DMOV'] === 0,
            'tw-bg-content-header-color': Number(epicItem.val['DMOV']) !== 0,
            'motor-button': true,
            'tw-w-2/12': true,
            'tw-ml-2': true,
            'tw-text-white': true,
          }"
          title="Moving">M</div>
      </div>
    </div>

    <div class="tw-relative">
      <div class="tw-w-full tw-h-1 tw-invisible hovered-items tw-bg-white" :ref="`epics_${epicsId}`">
        <div class="tw-my-2 tw-w-full tw-flex">
          <span
            :class="{
            'tw-w-2/12': true,
            'motor-button': true,
            'tw-bg-content-minor': Number(epicItem.val['HLS']) === 1,
            'tw-bg-content-header-color': Number(epicItem.val['HLS']) !== 1,
            }">&nbsp;</span>
          <span class="tw-flex-1 tw-ml-2">High Limit</span>

        </div>

        <div class="tw-my-2 tw-w-full tw-flex">
          <span
            :class="{
            'tw-w-2/12': true,
            'motor-button': true,
            'tw-bg-content-minor': Number(epicItem.val['LLS']) === 1,
            'tw-bg-content-header-color': Number(epicItem.val['LLS']) !== 1,
            }">&nbsp;</span>
          <span class="tw-flex-1 tw-ml-2">Low Limit</span>
        </div>

        <div class="tw-my-2 tw-w-full tw-flex">
          <span
            :class="{
            'tw-w-2/12': true,
            'motor-button': true,
            'tw-bg-content-minor': Number( epicItem.val['LVIO']) === 1,
            'tw-bg-content-header-color': Number(epicItem.val['LVIO']) !== 1,
            }">&nbsp;</span>
          <span class="tw-flex-1 tw-ml-2">Soft Limit</span>
        </div>

        <div class="tw-my-2 tw-w-full tw-flex">
          <span
            :class="{
            'tw-w-2/12': true,
            'motor-button': true,
            'tw-bg-content-inactive': (epicItem.val['MSTA'] & 1 << 6) === 1 << 6,
            'tw-bg-content-header-color': (epicItem.val['MSTA'] & 1 << 6) !== 1 << 6,
          }">&nbsp;</span>
          <span class="tw-flex-1 tw-ml-2">Following Error</span>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="tw-bg-content-search-background tw-p-4 tw-m-1 tw-w-full tw-rounded">
    <div class="tw-bg-content-highlight tw-p-1 tw-flex tw-w-full">
      <h1 class="tw-font-bold tw-flex-1">{{ epicItem.title }}</h1>
      <div :class="['motor-button', 'tw-w-2/12', epicItem.val ? 'tw-bg-content-active' : 'tw-bg-content-header-color']"></div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'motor-view',
  props: {
    motorItem: {
      type: [Object, null],
      required: true
    }
  },
  data() {
    return {
      epicItem: {
        val: {}
      }
    }
  },
  methods: {
    formatMotorItem(data) {
      if (data) {
        this.epicItem = data
      }
    },
    onHover(ref, addHover) {
      const hoveredRef = this.$refs[ref]

      if (addHover) {
        hoveredRef.classList.add('tw-h-auto', 'tw-absolute', 'tw-z-9999')
        hoveredRef.classList.remove('tw-invisible', 'tw-h-1')

      } else {
        hoveredRef.classList.remove('tw-h-auto', 'tw-absolute', 'tw-z-9999')
        hoveredRef.classList.add('tw-invisible', 'tw-h-1')
      }
    }
  },
  computed: {
    epicsId() {
      return this.epicItem.title.replace(/\s+/, '_').toLowerCase()
    }
  },
  watch: {
    motorItem: {
      deep: true,
      immediate: true,
      handler: 'formatMotorItem'
    }
  }
}
</script>

<style scoped>
.motor-button {
  @apply tw-p-1 tw-rounded-sm tw-border tw-border-black tw-text-center
}
</style>