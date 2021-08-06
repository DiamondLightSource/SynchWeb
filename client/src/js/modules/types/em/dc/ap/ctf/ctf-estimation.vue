<template>
  <processing-section
    section-title="CTF Estimation"
    :data-available="ctfEstimation !== null"
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

    <params :ctf-estimation="ctfEstimation" />

    <dc-image
      container-class="diffraction fft"
      title="FFT Theoretical"
      :image-url="imageUrl"
    />
  </processing-section>
</template>

<script>
import CtfModel from 'modules/types/em/models/ctf'
import DcImage from 'modules/types/em/components/dc-image.vue'
import LogView from 'views/log'
import MarionetteApplication from 'app/marionette-application.js'
import MovieSelect from 'modules/types/em/components/movie-select.vue'
import Params from 'modules/types/em/dc/ap/ctf/params.vue'
import ProcessingSection from 'modules/types/em/components/processing-section.vue'
import utils from 'utils'

export default {
    'name': "CtfEstimation",
    'components': {
        'dc-image': DcImage,
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
        'ctfModel': function() {
            return new CtfModel({
                'id': this.autoProcProgramId,
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
                '/download/id/' + this.autoProcProgramId +
                '/aid/' + this.programId +
                '/log/1'
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
            const vm = this
            if (
                (!vm.autoProcProgramId) ||
                (!vm.movieNumber) ||
                (vm.movieNumber == vm.loadedMovieNumber)
            ) {
                return
            }
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
                console.log(response.responseJSON)
                vm.$store.commit('loading', false)
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
