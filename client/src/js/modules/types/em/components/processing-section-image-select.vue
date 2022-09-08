<template>
  <processing-section
    :section-title="sectionTitle"
    :data-available="max > 0"
    :default-hidden="false"
  >
    <template #controls>
      <image-select
        v-if="max > 0"
        :max="max"
        :latest="latest"
        @changed="selectChanged"
      />
    </template>

    <slot />
  </processing-section>
</template>

<script>
import ImageSelect from 'modules/types/em/components/image-select.vue'
import ProcessingSection from 'modules/types/em/components/processing-section.vue'

export default {
    'name': "ProcessingSectionImageSelect",
    'components': {
        'image-select': ImageSelect,
        'processing-section': ProcessingSection,
    },
    'props': {
        'sectionTitle': {
            'type': String,
            'required': true,
        },
        'urlPrefix': {
            'type': String,
            'required': true,
        },
        'max': {
            'type': String,
            'required': true,
        },
        'latest': {
            'type': String,
            'required': true,
        },
        'autoProcProgramId': {
            'type': String,
            'required': true,
        },
        'loadedImageNumber': {
            'type': String,
            'required': true,
        },
    },
    'data': function() {
        return {
            'imageNumber': 0,
        }
    },
    'watch': {
        'imageNumber': function(newValue) {
            if (
                this.autoProcProgramId == '' ||
                newValue == this.loadedImageNumber
            ) {
                return;
            }
            if (newValue == '0') {
                this.$emit('loaded', {})
                return
            }
            this.$store.dispatch('em/api/fetch', {
                'url': this.urlPrefix + '/' +
                    this.autoProcProgramId + '/n/' + newValue,
                'humanName': this.sectionTitle + ' Details',
            }).then(
                (details) => {
                    this.$emit('loaded', details)
                },
                () => {
                    this.$emit('loaded', {})
                }
            )
        },
    },
    'methods': {
        'selectChanged': function(imageNumber) {
            this.imageNumber = imageNumber
        },
    },
}
</script>
