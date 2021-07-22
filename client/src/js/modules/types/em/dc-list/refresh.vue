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

            return this.model.get('VISIT').match(/^(cm|nt|nr)/) == null &&
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
