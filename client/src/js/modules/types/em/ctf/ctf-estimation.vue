<template>
  <processing-section-movie-select
    section-title="CTF Estimation"
    url-prefix="ctf"
    :fetch-trigger="fetchTrigger"
    :auto-proc-program-id="autoProcProgramId"
    :loaded-movie-number="loadedMovieNumber"
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
        'fetchTrigger': {
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
        'loadedMovieNumber': function() {
            return 'movieNumber' in this.ctfEstimation ?
                this.ctfEstimation.movieNumber : ''
        },
        'imageUrl': function() {
            const movie = this.loadedMovieNumber
            if (movie == '') {
                return '#'
            }
            return this.$store.state.apiUrl +
                '/em/ctf/image/' + this.autoProcProgramId + '/n/' + movie
        },
    },
    'methods': {
        'loaded': function(ctfEstimation) {
            this.ctfEstimation = ctfEstimation
        },
    },
}
</script>
