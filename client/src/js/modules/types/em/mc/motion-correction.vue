<template>
  <processing-section-movie-list
    section-title="Motion Correction"
    url-prefix="/em/mc/"
    :fetch-trigger="fetchTrigger"
    :auto-proc-program-id="autoProcProgramId"
    :loaded-movie-number="loadedMovieNumber"
    @loaded="loaded"
  >
    <params :motion-correction="motionCorrection" />

    <dialog-image
      title="Micrograph Snapshot"
      :image-url="snapshotUrl"
    />

    <drift
      :auto-proc-program-id="autoProcProgramId"
      :movie-number="loadedMovieNumber"
    />
  </processing-section-movie-list>
</template>

<script>
import DialogImage from 'modules/types/em/components/dialog-image.vue'
import Drift from 'modules/types/em/mc/drift.vue'
import Params from 'modules/types/em/mc/params.vue'
import ProcessingSectionMovieList from 'modules/types/em/components/processing-section-movie-list.vue'

export default {
    'name': "MotionCorrection",
    'components': {
        'dialog-image': DialogImage,
        'drift': Drift,
        'params': Params,
        'processing-section-movie-list': ProcessingSectionMovieList,
    },
    'props': {
        'autoProcProgramId': {
            'type': Number,
            'required': true,
        },
        'fetchTrigger': {
            'type': String,
            'required': true,
        },
    },
    'data': function() {
        return {
            'motionCorrection': {},
        }
    },
    'computed': {
        'loadedMovieNumber': function() {
            return 'movieNumber' in this.motionCorrection ?
                this.motionCorrection.movieNumber : ''
        },
        'snapshotUrl': function() {
            const movie = this.loadedMovieNumber
            if (movie == '') {
                return '#'
            }
            return this.$store.state.apiUrl +
                '/em/mc/snapshot/' + this.autoProcProgramId + '/n/' + movie
        },
    },
    'methods': {
        'loaded': function(motionCorrection) {
            this.motionCorrection = motionCorrection
        },
    },
}
</script>
