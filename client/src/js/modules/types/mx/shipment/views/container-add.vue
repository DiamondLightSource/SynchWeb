<template>
  
</template>

<script>
import ProcessingPipelines from 'collections/processingpipelines'
import PuckControls from 'modules/shipment/components/samples/PuckSampleControls.vue'
import Users from 'collections/users'

import { ValidationObserver, ValidationProvider, Validator }  from 'vee-validate'

export default {
  name: 'mx-container-add',
  data() {
    return {
      dewar: null,
      samples: [],
      samplesCollection: null,
      proteins: [],
      proteinsCollection: null,

      users: [],
      usersCOllection: null
    }
  },
  created() {
    this.dewar = this.options.dewar.toJSON()
    this.containerState.DEWARID = this.dewar.DEWARID

    // Used to help show/hide fields
    this.containerGroup = this.$store.state.proposalType

    this.samplesCollection = new Samples(null, {model: LocationSample})

    this.getProteins()
    this.getExperimentTypes()
    this.getContainerTypes()
    this.getContainerRegistry()
    this.getUsers()
    this.getProcessingPipelines()
  },
  methods: {

  }
}
</script>

<style>

</style>