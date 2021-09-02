<template>
  <processing-section
    section-title="Motion Correction"
    :data-available="motionCorrection !== null"
  >
    <template #controls>
      <movie-select
        :max="movieCount"
        @changed="newMovie"
      />
    </template>

    <params :motion-correction="motionCorrection" />

    <dialog-image
      title="Micrograph Snapshot"
      :image-url="snapshotUrl"
    />

    <drift
      :auto-proc-program-id="autoProcProgramId"
      :movie-number="movieNumber"
    />
  </processing-section>
</template>

<script>
import DialogImage from 'modules/types/em/components/dialog-image.vue'
import Drift from 'modules/types/em/mc/drift.vue'
import MovieSelect from 'modules/types/em/components/movie-select.vue'
import Params from 'modules/types/em/mc/params.vue'
import ProcessingSection from 'modules/types/em/components/processing-section.vue'

export default {
    'name': "MotionCorrection",
    'components': {
        'dialog-image': DialogImage,
        'drift': Drift,
        'movie-select': MovieSelect,
        'params': Params,
        'processing-section': ProcessingSection,
    },
    'props': {
        'autoProcProgramId': {
            'type': Number,
            'required': true,
        },
        'movieCount': {
            'type': Number,
            'required': true,
        },
    },
    'data': function() {
        return {
            'movieNumber': 0,
            'motionCorrection': null,
        }
    },
    'computed': {
        'loadedMovieNumber': function() {
            return this.motionCorrection === null ? 0 :
                this.motionCorrection.movieNumber
        },
        'snapshotUrl': function() {
            return this.$store.state.apiUrl +
                '/em/mc/snapshot/' + this.autoProcProgramId +
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
                'url': '/em/mc/' + this.autoProcProgramId +
                    '/n/' + this.movieNumber,
                'humanName': 'Motion Correction',
            }).then(
                (response) => { this.motionCorrection = response }
            )
        },
    },
}
</script>
