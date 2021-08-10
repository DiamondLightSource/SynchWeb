<template>
  <processing-section
    section-title="Motion Correction"
    :data-available="motionCorrection !== null"
  >
    <template #controls>
      <div style="display: flex; justify-content: space-between;">
        <movie-select
          :max="movieCount"
          @changed="newMovie"
        />

        <div>
          <a
            class="view button logf"
            :href="logUrl"
            @click.prevent="showLog"
          ><i class="fa fa-search" /> Log file</a>
        </div>
      </div>
    </template>

    <params :motion-correction="motionCorrection" />

    <dc-image
      container-class="diffraction fft"
      title="Motion Corrected Image"
      :image-url="imageUrl"
    />

    <dc-image
      container-class="diffraction fft2"
      title="FFT of Motion Corrected Image"
      :image-url="fftUrl"
    />

    <drift
      :auto-proc-program-id="autoProcProgramId"
      :movie-number="movieNumber"
    />
  </processing-section>
</template>

<script>
import DcImage from 'modules/types/em/components/dc-image.vue'
import Drift from 'modules/types/em/mc/drift.vue'
import LogView from 'views/log' // TODO: needs fixing or scrapping ?
import MotionCorrectionModel from 'modules/types/em/models/motioncorrection'
import MovieSelect from 'modules/types/em/components/movie-select.vue'
import Params from 'modules/types/em/mc/params.vue'
import ProcessingSection from 'modules/types/em/components/processing-section.vue'
import utils from 'utils'

export default {
    'name': "MotionCorrection",
    'components': {
        'dc-image': DcImage,
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
        'motionCorrectionModel': function() {
            return new MotionCorrectionModel({
                'id': this.autoProcProgramId,
            })
        },
        'loadedMovieNumber': function() {
            return this.motionCorrection === null ? 0 :
                this.motionCorrection.IMAGENUMBER
        },
        'programId': function() {
            return this.motionCorrection === null ? 0 :
                this.motionCorrection.AUTOPROCPROGRAMID
        },
        'logUrl': function() {
            if (this.programId == 0) {
                return '#'
            }
            const dataCollectionId = 0
            return this.$store.state.apiUrl +
                '/download/id/' + dataCollectionId +
                '/aid/' + this.programId +
                '/log/1'
        },
        'imageUrl': function() {
            const dataCollectionId = 0
            return this.$store.state.apiUrl +
                '/em/mc/fft/image/' + dataCollectionId +
                '/n/' + this.movieNumber
        },
        'fftUrl': function() {
            return this.imageUrl + '/t/2'
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
            const vm = this
            if (vm.movieNumber == vm.loadedMovieNumber) {
                return
            }
            vm.$store.commit('loading', true)
            const successCallback = function(
                model, // eslint-disable-line no-unused-vars
                response,
                options // eslint-disable-line no-unused-vars
            ) {
                vm.motionCorrection = response
                console.log('got motion correction', vm.motionCorrection)
                vm.$store.commit('loading', false)
            }
            const errorCallback = function (
                model, // eslint-disable-line no-unused-vars
                response,
                options // eslint-disable-line no-unused-vars
            ) {
                console.log(response.responseJSON)
                vm.$store.commit('notifications/addNotification', {
                    'title': 'Error',
                    'message': 'Could not retrieve motion correction data',
                    'level': 'error'
                })
                vm.$store.commit('loading', false)
            }
            vm.$store.commit('loading', true)
            /* TODO: [SCI-9935]
               vm.$store.dispatch('getModel', model)
               doesn't currently support 'data': */
            vm.motionCorrectionModel.fetch({
                'data': { 'IMAGENUMBER': vm.movieNumber },
                'success': successCallback,
                'error': errorCallback,
            })
        },
        'showLog': function() {
            const url = this.logUrl
            utils.sign({
                'url': url,
                'callback': function(response) {
                    const signedUrl = url + '?token=' + response.token
                },
            })
        },
    },
}
</script>
