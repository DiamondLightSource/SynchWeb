<template>
  <section class="content">
    <h1>Add Simple Sample</h1>
    <p class="help">
      This page allows you to add all sample information for one or more samples in a single transaction
    </p>
    <simple-sample
      v-if="ready"
      :protein="model"
    />
  </section>
</template>

<script>
import SimpleSample from 'modules/types/xpdf/samples/views/vue-simplesample.vue'
import Protein from 'models/protein'

import EventBus from 'app/components/utils/event-bus.js'
import VeeValidateCustom from 'app/mixins/vee-validate-custom-rules'


export default {
    name: 'SimpleSampleAddWrapper',
    components: {
        'simple-sample': SimpleSample
    },
    mixins: [VeeValidateCustom],
    props: {
        'pid': {
            type: Number,
            required: true,
        }
    },
    data: function() {
        return {
            ready: false,
            model: null,
            bc: [], // Breadcrumbs
        }
    },
    created: function() {
        this.model = new Protein({ PROTEINID: this.pid })

        // Start loading animation
        this.$store.commit('loading', true)

        // Fetch the model
        this.$store.dispatch('getModel', this.model).then((model) => {
            // Set breadcrumbs now we have the model
            this.setBreadcrumbs()
        }, (error) => {
            let errorMessage = error.msg || 'Error getting sample model'
            console.log(this.$options.name + " Error getting model " + errorMessage)
            this.$store.commit('notifications/addNotification', { title: 'Error getting model', message: errorMessage, level: 'error'})
        }).finally( () => { 
            // Only render when complete and stop loading animation
            this.$store.commit('loading', false)
            // Not convinced we still need to use the ready flag to delay rendering...
            this.ready = true
        })
    },
    methods: {
        // Set Breadcrumbs
        // Because we are not passing these into a marionette wrapper, update the breadcrumbs here
        setBreadcrumbs: function() {
            this.bc = [{ title: 'Samples', url: '/xsamples' }]
            this.bc.push({ title: 'Add' })
            EventBus.$emit('bcChange', this.bc)
        },
    }
}
</script>