<template>
  <processing-section
    section-title="CTF Estimation"
    :data-available="ctfEstimation !== null"
  >
    <template #controls>
      <movie-select
        :max="movieCount"
        @changed="newMovie"
      />
    </template>

    <params :ctf-estimation="ctfEstimation" />

    <dialog-image
      title="FFT Theoretical"
      :image-url="imageUrl"
    />
  </processing-section>
</template>

<script>
import DialogImage from 'modules/types/em/components/dialog-image.vue'
import MovieSelect from 'modules/types/em/components/movie-select.vue'
import Params from 'modules/types/em/ctf/params.vue'
import ProcessingSection from 'modules/types/em/components/processing-section.vue'

export default {
    'name': "CtfEstimation",
    'components': {
        'dialog-image': DialogImage,
        'movie-select': MovieSelect,
        'params': Params,
        'processing-section': ProcessingSection,
    },
    'props': {
        'movieCount': {
            'type': Number,
            'required': true,
        },
        'autoProcProgramId': {
            'type': Number,
            'required': true,
        },
    },
    'data': function() {
        return {
            'movieNumber': 1,
            'ctfEstimation': null,
        }
    },
    'computed': {
        'loadedMovieNumber': function() {
            return this.ctfEstimation === null ? null :
                this.ctfEstimation.movieNumber
        },
        'programId': function() {
            return this.ctfEstimation === null ? 0 :
                this.ctfEstimation.autoProcProgramId
        },
        'imageUrl': function() {
            if (this.programId == 0) {
                return '#'
            }
            return this.$store.state.apiUrl +
                '/em/ctf/image/' + this.autoProcProgramId +
                '/n/' + this.movieNumber
        },
    },
    'watch': {
        // eslint-disable-next-line no-unused-vars
        'movieNumber': function(newValue, oldValue) {
            this.fetchMovie()
        },
    },
    'mounted': function() {
        this.fetchMovie()
    },
    'methods': {
        'newMovie': function(movieNumber) {
            this.movieNumber = movieNumber
        },
        'fetchMovie': function() {
            if (
                (!this.autoProcProgramId) ||
                (!this.movieNumber) ||
                (this.movieNumber == this.loadedMovieNumber)
            ) {
                return
            }
            this.$store.dispatch('em/fetch', {
                'url': '/em/ctf/' + this.autoProcProgramId +
                    '/n/' + this.movieNumber,
                'humanName': 'CTF Estimation',
            }).then(
                (ctfEstimation) => { this.ctfEstimation = ctfEstimation }
            )
        },
    },
}
</script>
