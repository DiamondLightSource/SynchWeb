<template>
  <p
    v-if="isInactive"
    class="message notify"
  >
    This visit is inactive and will not auto update | Auto Refresh
    <input
      type="checkbox"
      :value="autoRefresh"
    >
    <a
      href="#"
      class="button refresh"
      @click.prevent="refreshDCs"
    ><i class="fa fa-refresh" /> Refresh</a>
  </p>
</template>

<script>
export default {
    'name': 'Refresh',
    'props': {
        'collection': {
            'type': Object,
            'required': true,
        },
        'model': {
            'type': Object,
            'required': true,
        },
    },
    'computed': {
        'autoRefresh': {
            'get': function() {
                return this.collection.isRunning
            },
            'set': function(toggle) {
                if (toggle) {
                    this.collection.run()
                } else {
                    this.collection.stop()
                }
            },
        },
        'isInactive': function() {
            if (!this.model) {
                return true
            }
            // This is a bit "horrible"... but it's needed to fit in with the
            // rest of SynchWeb.
            // The data collections list can be passed a Proposal model
            // or a visit model depending on context and we have to determine
            // which to use here.
            const proposalOrVisit = this.model.has('PROP') ?
                this.model.get('PROP') : this.model.get('VISIT')

            return proposalOrVisit.match(/^(cm|nt|nr)/) == null &&
                this.model.get('ACTIVE') != '1'
        },
    },
    'methods': {
        'refreshDCs': function() {
            this.collection.fetch()
        },
    },
}
</script>
