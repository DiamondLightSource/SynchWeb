<template>
  <processing-section
    section-title="Processing Job Parameters"
    :data-available="Object.keys(parameters).length > 0"
    default-hidden
  >
    <parameter-list-with-schema
      schema-name="Relion Schema"
      schema-url="relion/schema/"
      :parameters="parameters"
    />
  </processing-section>
</template>

<script>
import ProcessingSection from 'modules/types/em/components/processing-section.vue'
import ParameterListWithSchema from 'modules/types/em/components/parameter-list-with-schema.vue'

export default {
    'name': 'JobParameters',
    'components': {
        'processing-section': ProcessingSection,
        'parameter-list-with-schema': ParameterListWithSchema,
    },
    'props': {
        'processingJobId': {
            'type': Number,
            'required': true,
        },
    },
    'data': function() {
        return {
            'parameters': {},
        }
    },
    'mounted': function() {
        this.$store.dispatch('em/fetch', {
            'url': 'relion/parameters?processingJobId=' +
                this.processingJobId,
            'humanName': 'Processing Job Parameters',
        }).then(
            (response) => { this.parameters = response }
        )
    },
}
</script>
