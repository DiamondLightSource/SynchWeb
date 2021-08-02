<template>
  <processing-section
    section-title="Cryolo Auto Picker"
    :data-available="true"
  >
    <p>TODO:</p>
  </processing-section>
</template>

<script>
import ProcessingSection from 'modules/types/em/components/processing-section.vue'

export default {
    'name': "AutoPicker",
    'components': {
        'processing-section': ProcessingSection,
    },
    'props': {
        'autoProcProgramId': {
            'type': Number,
            'required': true,
        },
    },
}
</script>
