<template>
  <processing-section
    section-title="Processing Parameters"
    :data-available="parameters.length > 0"
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
        return { 'parameters': [] }
    },
    'mounted': function() {
        this.$store.dispatch('em/fetch', {
            'url': '/em/process/relion/job/parameters?processingJobId=' +
                this.processingJobId,
            'humanName': 'Processing Job Parameters',
        }).then(
            (response) => {
                /* TODO: once all Relion screens are updated,
                   This endpoint can be updated to match */
                this.parameters = response.data.map(function(parameter) {
                    return {
                        'key': parameter.PARAMETERKEY,
                        'value': parameter.PARAMETERVALUE,
                    }
                })
            }
        )
    },
}
</script>
