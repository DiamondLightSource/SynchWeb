<template>

</template>

<script>
export default {
  name: 'items-log-view',
  props: {
    url: {
      type: String,
      required: true
    }
  },
  mounted() {

  },
  methods: {
    loadIframe() {
      const app = {
        apiUrl: this.$store.state.apiUrl,
        prop: this.$store.state.proposal.proposal,
        token: this.$store.getters['auth/token'],
      }

      const root = this.url.replace(/\?token=.*/, '')
      const ajax = (options) => {
        options.data.prop
      }

      // TODO: Decide how to display log Viewer
    }
  }
}
</script>

<style scoped>

</style>