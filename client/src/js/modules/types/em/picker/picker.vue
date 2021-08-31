<template>
  <processing-section
    section-title="Particle Picking"
    :data-available="true"
  >
    <div>
      TODO:
    </div>
  </processing-section>
</template>

<script>
import ProcessingSection from 'modules/types/em/components/processing-section.vue'

export default {
    'name': "Picker",
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
