<template>
  <processing-section-movie-list
    section-title="CTF Estimation"
    url-prefix="/em/ctf/"
    :auto-proc-program-id="autoProcProgramId"
    :loaded-movie-number="loadedMovieNumber"
    @loaded="loaded"
  >
    <params :ctf-estimation="ctfEstimation" />

    <dialog-image
      title="FFT Theoretical"
      :image-url="imageUrl"
    />
  </processing-section-movie-list>
</template>

<script>
import DialogImage from 'modules/types/em/components/dialog-image.vue'
import Params from 'modules/types/em/ctf/params.vue'
import ProcessingSectionMovieList from 'modules/types/em/components/processing-section-movie-list.vue'

export default {
    'name': "CtfEstimation",
    'components': {
        'dialog-image': DialogImage,
        'params': Params,
        'processing-section-movie-list': ProcessingSectionMovieList,
    },
    'props': {
        'autoProcProgramId': {
            'type': Number,
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
