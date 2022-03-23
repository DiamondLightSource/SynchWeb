<template>
  <div class="tw-p-1 tw-rounded" :class="`${pvStatusClassName}`">
    <h6 class="tw-text-center tw-text-sm tw-font-page-header tw-mb-1">{{ pvItem['NAME'] }}</h6>
    <p class="tw-text-center">{{ pvItem['VALUE'] }}</p>
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