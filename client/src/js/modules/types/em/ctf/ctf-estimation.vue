<template>
  <processing-section-movie-select
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
  </processing-section-movie-select>
</template>

<script>
import DialogImage from 'modules/types/em/components/dialog-image.vue'
import Params from 'modules/types/em/ctf/params.vue'
import ProcessingSectionMovieSelect from 'modules/types/em/components/processing-section-movie-select.vue'

export default {
    'name': "CtfEstimation",
    'components': {
        'dialog-image': DialogImage,
        'params': Params,
        'processing-section-movie-select': ProcessingSectionMovieSelect,
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
            const image = this.loadedImageNumber
            if (image == '') {
                return '#'
            }
            return this.$store.state.apiUrl +
                '/em/ctf/image/' + this.autoProcProgramId + '/n/' + image
        },
    },
    'methods': {
        'loaded': function(ctfEstimation) {
            this.ctfEstimation = ctfEstimation
        },
    },
}
</script>
