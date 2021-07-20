<template>
  <h1 class="message nou">
    <a
      class="button"
      :href="allCollectionsUrl"
    >View All Data Collections</a>
  </h1>
</template>

<script>

export default {
    'name': 'AllCollectionsLink',
    'computed': {
        'allCollectionsUrl': function() {
            var url = '/dc'
            if (this.isVisit) {
                url = url + '/visit/' + this.$store.state.proposal.visit
            }
            return url
        },
    },
}
</script>
