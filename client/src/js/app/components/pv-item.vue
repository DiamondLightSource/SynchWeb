<template>
  <div class="tw-p-2 tw-rounded tw-flex tw-flex-col tw-items-center tw-justify-center" :class="`${pvStatusClassName}`">
    <div class="tw-w-full tw-flex-1">
      <p class="tw-text-center tw-text-2xl tw-font-page-header">{{ pvItem['NAME'] }}</p>
    </div>
    <div class="tw-w-full tw-pt-2 tw-border-t tw-border-content-page-hover-color tw-flex tw-justify-center tw-items-center">
      <p class="tw-text-center">{{ pvItem['VALUE'] }}</p>
    </div>
  </div>
</template>
<script>
export default {
  name: 'pv-item',
  props: {
    pvItem: {
      required: true,
      type: Object
    }
  },
  data() { return {} },
  methods: {},
  computed: {
    pvStatusClassName() {
      const key = this.pvItem['NAME']
      const value = this.pvItem['VALUE']
      let className

      switch (key) {
        case 'Ring Current':
          className = value > 10
          break
        case 'Ring State':
          className = value === 'User'
          break
        case 'Hutch':
          className = value === 'Locked'
          break
        case 'Refil':
          className = value !== -1
          break
        default:
          className = value !== 'Closed'
      }

      return className ? 'tw-bg-content-active' : 'tw-bg-content-inactive'
    }
  }
}
</script>