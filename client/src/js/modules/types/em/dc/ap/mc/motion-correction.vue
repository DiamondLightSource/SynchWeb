<template>
  <div class="mc dcap clearfix">
    <h2>Motion Correction</h2>

    <movie-select
      :max="length"
      @changed="newMovie"
    />

    <p class="ra">

      <a
        class="view button logf"
        :href="logUrl"
        @click.prevent="showLog"
      ><i class="fa fa-search" /> Log file</a>
    </p>

    <div
      v-if="motionCorrection !== null"
      class="data_collection"
      type="data"
    >
      <drift
        :data-collection-id="dataCollectionId"
        :movie-number="movieNumber"
        :active="active"
      />

      <dc-image
        container-class="diffraction fft2"
        title="FFT of Motion Corrected Image"
        :image-url="fftUrl"
      />

      <dc-image
        container-class="diffraction fft"
        title="Motion Corrected Image"
        :image-url="imageUrl"
      />

      <params :motion-correction="motionCorrection" />
    </div>
  </div>
</template>

<script>
import DcImage from 'modules/types/em/components/dc-image.vue'
import Drift from 'modules/types/em/dc/ap/mc/drift.vue'
import LogView from 'views/log' // TODO: needs fixing or scrapping ?
import MarionetteApplication from 'app/marionette-application.js'
import MotionCorrectionModel from 'modules/types/em/models/motioncorrection'
import MovieSelect from 'modules/types/em/components/movie-select.vue'
import Params from 'modules/types/em/dc/ap/mc/params.vue'
import utils from 'utils'

export default {
    'name': "MotionCorrection",
    'components': {
        'dc-image': DcImage,
        'drift': Drift,
        'movie-select': MovieSelect,
        'params': Params,
    },
    'props': {
        'active' : {
            'type': Boolean,
            'required': true,
        },
        'length': {
            'type': Number,
            'required': true,
        },
        'dataCollectionId': {
            'type': Number,
            'required': true,
        },
    },
    'data': function() {
        return {
            'movieNumber': 1,
            'motionCorrection': null,
        }
    },
    'computed': {
        'motionCorrectionModel': function() {
            return new MotionCorrectionModel({
                'id': this.dataCollectionId,
                'TYPE': 'Motion Correction',
            })
        },
        'loadedMovieNumber': function() {
            return this.motionCorrection === null ? null :
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
            return this.$store.state.apiUrl +
                '/download/id/' + this.dataCollectionId +
                '/aid/' + this.programId +
                '/log/1'
        },
        'fftUrl': function() {
            return this.active == false ? '' :
                this.$store.state.apiUrl +
                    '/em/mc/fft/image/' + this.dataCollectionId +
                    '/n/' + this.movieNumber +
                    '/t/2'
        },
        'imageUrl': function() {
            return this.active == false ? '' :
                this.$store.state.apiUrl +
                    '/em/mc/fft/image/' + this.dataCollectionId +
                    '/n/' + this.movieNumber
        },
    },
    'watch': {
        // eslint-disable-next-line no-unused-vars
        'active': function(newValue, oldValue) {
            this.fetchMovie()
        },
        // eslint-disable-next-line no-unused-vars
        'movieNumber': function(newValue, oldValue) {
            this.fetchMovie()
        },
    },
    'methods': {
        'newMovie': function(movieNumber) {
            this.movieNumber = movieNumber
        },
        'fetchMovie': function() {
            const vm = this
            if (vm.active == false || vm.movieNumber == vm.loadedMovieNumber) {
                return
            }
            vm.$store.commit('loading', true)
            const successCallback = function(
                model, // eslint-disable-line no-unused-vars
                response,
                options // eslint-disable-line no-unused-vars
            ) {
                vm.$store.commit('loading', false)
                vm.motionCorrection = response
            }
            const errorCallback = function (
                model, // eslint-disable-line no-unused-vars
                response,
                options // eslint-disable-line no-unused-vars
            ) {
                vm.$store.commit('loading', false)
                console.log(response.responseJSON)
                vm.$store.commit('notifications/addNotification', {
                    'title': 'Error',
                    'message': 'Could not retrieve motion correction data',
                    'level': 'error'
                })
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
                    // TODO: Dialog broken!
                    MarionetteApplication.getInstance().dialog.show(
                        new LogView({
                            'title': 'Motion Correction Log File',
                            'url': signedUrl,
                        })
                    )
                },
            })
        },
    },
}
</script>
