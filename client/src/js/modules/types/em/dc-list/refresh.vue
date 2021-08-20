<template>
  <p
    v-if="isInactive"
    class="message notify"
  >
    This
    {{ proposalOrVisit == 'PROP' ? 'proposal' : 'visit' }}
    is inactive and will not auto update | Auto Refresh
    <input
      v-model="autoRefresh"
      type="checkbox"
    >
    <flat-button
      class="refresh-button"
      @click="collection.fetch()"
    >
      <i class="fa fa-refresh" />
      Refresh
    </flat-button>
  </p>
</template>

<script>
import FlatButton from 'app/components/flat-button.vue'

export default {
    'name': 'Refresh',
    'components': {
        'flat-button': FlatButton,
    },
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
        'proposalOrVisit': function() {
            // This is a bit "horrible"...
            // but it's needed to fit in with the rest of SynchWeb.
            // The data collections list can be passed a Proposal model
            // or a visit model depending on context and we have to determine
            // which to use here.
            return this.model.has('PROP') ? 'PROP' : 'VISIT'
        },
        'isInactive': function() {
            if (!this.model) {
                return true
            }
            if (this.model.get(this.proposalOrVisit).match(/^(cm|nt|nr)/) == null) {
                return false;
            }
            return this.model.get('ACTIVE') != '1'
        },
    },
}
</script>

<style scoped>
.refresh-button {
    margin-left: 20px;
}
</style>
