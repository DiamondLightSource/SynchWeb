<template>
  <processing-section
    section-title="Processing Parameters"
    :data-available="dataAvailable"
    not-available-message="No processing parameters available"
    default-hidden
  >
    <parameter-list width="100%">
      <template v-for="parameter in parameters">
        <parameter-list-item
          v-if="parameter.value.length < 20"
          :key="parameter.id"
          width="20%"
          :label="parameter.key"
          :item="parameter.value"
        />
      </template>

      <template v-for="parameter in parameters">
        <parameter-list-item
          v-if="parameter.value.length >= 20"
          :key="parameter.id"
          width="100%"
          :label="parameter.key"
          :item="parameter.value"
        />
      </template>
    </parameter-list>
  </processing-section>
</template>

<script>
import ParameterList from 'modules/types/em/components/parameter-list.vue'
import ParameterListItem from 'modules/types/em/components/parameter-list-item.vue'
import ProcessingJobParameters from 'modules/types/em/collections/processingjobparameters'
import ProcessingSection from 'modules/types/em/components/processing-section.vue'

export default {
    'name': 'JobParameters',
    'components': {
        'processing-section': ProcessingSection,
        'parameter-list': ParameterList,
        'parameter-list-item': ParameterListItem,
    },
    'props': {
        'processingJobId': {
            'type': Number,
            'required': true,
        },
    },
    'data': function() {
        return {
            parameters: [],
        }
    },
    'computed': {
        'dataAvailable': function() {
            return true // TODO
        },
    },
    'mounted': function() {
        this.fetchProcessingParameters()
    },
    'methods': {
        'fetchProcessingParameters': function() {
            const processingParametersCollection = new ProcessingJobParameters()
            processingParametersCollection.queryParams.processingJobId = this.processingJobId
            this.$store.dispatch(
                'getCollection',
                processingParametersCollection
            ).then((collection) => {
                this.parameters = collection.models.map(function(parameter) {
                    return {
                        'key': parameter.get('PARAMETERKEY'),
                        'value': parameter.get('PARAMETERVALUE'),
                    }
                })
            }, () => {
                console.log('no processing parameters')
            })
        }
    }
}
</script>
