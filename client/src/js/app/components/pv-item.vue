<template>
  <div class="tw-p-1 tw-rounded" :class="`${pvStatusClassName}`">
    <h6 :class="[titleClassNames]">{{ pvItem['NAME'] }}</h6>
    <p :class="[valueClassNames]" v-html="pvItemValue"></p>
  </div>
</template>
<script>
export default {
  name: 'pv-item',
  props: {
    pvItem: {
      required: true,
      type: Object
    },
    titleClassNames: {
      type: String,
      default: 'tw-text-center tw-text-sm tw-font-page-header tw-mb-1'
    },
    valueClassNames: {
      type: String,
      default: 'tw-text-center'
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
    },
    pvItemValue() {
      if (this.pvItem['VALUE']) {
        return this.pvItem['VALUE'].replace(/\\n/g, '<br />')
      }

      return ''
    }
  }
}
</script>