<template>
  <processing-section-image-select
    section-title="CTF Estimation"
    url-prefix="ctf"
    :latest="latest"
    :max="max"
    :auto-proc-program-id="autoProcProgramId"
    :loaded-image-number="loadedImageNumber"
    @loaded="loaded"
  >
    <params :ctf-estimation="ctfEstimation" />

    <dialog-image
      title="FFT Theoretical"
      :image-url="imageUrl"
    />
  </processing-section-image-select>
</template>

<script>
import DialogImage from 'modules/types/em/components/dialog-image.vue'
import Params from 'modules/types/em/ctf/params.vue'
import ProcessingSectionImageSelect from 'modules/types/em/components/processing-section-image-select.vue'

export default {
    'name': "CtfEstimation",
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
        'latest': {
            'type': String,
            'required': true,
        },
        'max': {
            'type': String,
            'required': true,
        },
    },
    'data': function() {
        return {
            'ctfEstimation': {},
        }
    },
    'computed': {
        'loadedImageNumber': function() {
            return 'imageNumber' in this.ctfEstimation ?
                this.ctfEstimation.imageNumber : ''
        },
        'imageUrl': function() {
            if (this.loadedImageNumber == '') {
                return ''
            }
            return this.$store.state.apiUrl +
                '/em/ctf/image/' + this.autoProcProgramId +
                '/n/' + this.loadedImageNumber
        },
    },
    'methods': {
        'loaded': function(ctfEstimation) {
            this.ctfEstimation = ctfEstimation
        },
    },
}
</script>
