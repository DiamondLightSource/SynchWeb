<template>
  <div class="ctf dcap clearfix">
    <h2>CTF Estimation</h2>

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
      class="data_collection"
      type="data"
    >
      <dc-image
        container-title="Click to view FFT"
        container-class="diffraction fft"
        image-title="FFT Theoretical"
        :image-url="imageUrl"
      />

      <params
        v-if="ctfEstimation !== null"
        :ctf-estimation="ctfEstimation"
      />
    </div>
  </div>
</template>

<script>
import CtfModel from 'modules/types/em/models/ctf'
import DcImage from 'modules/types/em/components/dc-image.vue'
import LogView from 'views/log'
import MarionetteApplication from 'app/marionette-application.js'
import MovieSelect from 'modules/types/em/components/movie-select.vue'
import Params from 'modules/types/em/dc/ap/ctf/params.vue'
import utils from 'utils'

export default {
    'name': "CtfEstimation",
    'components': {
        'dc-image': DcImage,
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
            'ctfEstimation': null,
        }
    },
    'computed': {
        'ctfModel': function() {
            return new CtfModel({
                'id': this.dataCollectionId,
                'TYPE': 'CTF',
            })
        },
        'loadedMovieNumber': function() {
            return this.ctfEstimation === null ? null :
                this.ctfEstimation.IMAGENUMBER
        },
        'programId': function() {
            return this.ctfEstimation === null ? 0 :
                this.ctfEstimation.AUTOPROCPROGRAMID
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
        'imageUrl': function() {
            if (this.programId == 0) {
                return '#'
            }
            return this.$store.state.apiUrl +
                '/em/ctf/image/' + this.dataCollectionId +
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
                vm.ctfEstimation = response
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
                    'message': 'Could not retrieve CTF data',
                    'level': 'error'
                })
            }
            vm.$store.commit('loading', true)
            /* TODO: [SCI-9935]
               vm.$store.dispatch('getModel', model)
               doesn't currently support 'data': */
            vm.ctfModel.fetch({
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
                            'title': 'CTF Log File',
                            'url': signedUrl,
                        })
                    )
                },
            })
        },
    },
}
</script>
