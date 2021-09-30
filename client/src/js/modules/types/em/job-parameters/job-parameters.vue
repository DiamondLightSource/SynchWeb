<template>
  <processing-section-with-schema
    section-title="Processing Job Parameters"
    schema-name="Relion Schema"
    schema-url="relion/schema/"
    :data-url="dataUrl"
    default-hidden
  />
</template>

<script>
import ProcessingSectionWithSchema from 'modules/types/em/components/processing-section-with-schema.vue'

export default {
    'name': 'JobParameters',
    'components': {
        'processing-section-with-schema': ProcessingSectionWithSchema,
    },
    'props': {
        'processingJobId': {
            'type': Number,
            'required': true,
        },
    },
    'computed': {
        'dataUrl': function() {
            return 'relion/parameters?processingJobId=' +
                this.processingJobId
        },
    },
}
</script>
