<template>
  <processing-section-image-select
    section-title="Particle Picking"
    url-prefix="picker"
    :latest="latest"
    :max="max"
    :auto-proc-program-id="autoProcProgramId"
    :loaded-image-number="loadedImageNumber"
    @loaded="loaded"
  >
    <params :pick="pick" />

    <dialog-image
      title="Summary Image"
      :image-url="imageUrl"
    />
  </processing-section-image-select>
</template>

<script>
import DialogImage from 'modules/types/em/components/dialog-image.vue'
import Params from 'modules/types/em/picker/params.vue'
import ProcessingSectionImageSelect from 'modules/types/em/components/processing-section-image-select.vue'

export default {
    'name': "Picker",
    'components': {
        'dialog-image': DialogImage,
        'params': Params,
        'processing-section-image-select': ProcessingSectionImageSelect,
    },
    'props': {
        'autoProcProgramId': {
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
    },
    'data': function() {
        return {
            'pick': {},
        }
    },
    'computed': {
        'loadedImageNumber': function() {
            return 'imageNumber' in this.pick ? this.pick.imageNumber : ''
        },
        'imageUrl': function() {
            if (this.loadedImageNumber == '') {
                return ''
            }
            return this.$store.state.apiUrl +
                '/em/picker/image/' + this.autoProcProgramId +
                '/n/' + this.loadedImageNumber
        },
    },
    'methods': {
        'loaded': function(pick) {
            this.pick = pick
        },
    },
}
</script>
