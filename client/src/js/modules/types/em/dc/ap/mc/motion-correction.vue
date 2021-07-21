<template>
  <div class="mc dcap clearfix">
    <p v-if="nothingToShow">
      No Motion Correction for this movie
    </p>

    <template v-else>
      <h2>Motion Correction</h2>

      <dialog-box />

      <p class="ra">
        <!--
          a
          class="dll button"
          :href="dllUrl"
          @click.prevent="showOutput"
        ><i class="fa fa-download" /> Micrograph</a -->
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
        <drift />

        <!-- FFT of Motion Corrected Image -->
        <dc-image
          container-class="diffraction fft2"
          container-title="Click to view FFT"
          :image-url="fftUrl"
          image-title="FFT Drift Corrected"
        />

        <!-- Motion Corrected Image -->
        <dc-image
          container-class="diffraction fft"
          container-title="Click to view drift corrected FFT"
          :image-url="imageUrl"
          image-title="FFT"
        />

        <params />
      </div>
    </template>
  </div>
</template>

<script>
import store from 'app/store/store'
import LogView from 'views/log'
import utils from 'utils'
/* TODO: dialogbox.vue belongs on a top level page
   keep moving it until the whole page is "vue-ified" */
import DialogBox from 'app/components/dialogbox.vue'
import DcImage from 'modules/types/em/dc/views/dc-image.vue'
import Params from 'modules/types/em/dc/views/motion-correction/params.vue'
import Drift from 'modules/types/em/dc/views/motion-correction/drift.vue'

export default {
    'name': "MotionCorrection",
    'components': {
        'dialog-box': DialogBox,
        'dc-image': DcImage,
        'params': Params,
        'drift': Drift,
    },
    'data': function() {
        return {
            'apiUrl': store.state.apiUrl
        }
    },
    'computed': {
        /*
        'dllUrl': function() {
            return this.apiUrl +
                '/download/id/' +
                store.state.models.emMotionCorrection.DATACOLLECTIONID +
                '/aid/' +
                store.state.models.emMotionCorrection.AUTOPROCPROGRAMID
        },
        */
        'logUrl': function() {
            return this.apiUrl +
                '/download/id/' +
                store.state.models.emMotionCorrection.DATACOLLECTIONID +
                '/aid/' +
                store.state.models.emMotionCorrection.AUTOPROCPROGRAMID +
                '/log/1'
        },
        'fftUrl': function() {
            return this.apiUrl +
                '/em/mc/fft/image/' +
                store.state.models.emMotionCorrection.DATACOLLECTIONID +
                '/n/' +
                store.state.models.emMotionCorrection.IMAGENUMBER +
                '/t/2'
        },
        'imageUrl': function() {
            return this.apiUrl +
                '/em/mc/fft/image/' +
                store.state.models.emMotionCorrection.DATACOLLECTIONID +
                '/n/' +
                store.state.models.emMotionCorrection.IMAGENUMBER
        },
        'nothingToShow': function() {
            return !store.state.models.emMotionCorrection.MOTIONCORRECTIONID
        },
        'collectionId': function() {
            return store.state.models.emMotionCorrection.id
        },
        'imageNumber': function() {
            return store.state.models.emMotionCorrection.IMAGENUMBER
        },
    },
    'methods': {
        'signUrl': function(rootUrl, actionCallback) {
            utils.sign({
                /* TODO: when testing, I'm getting "401 Unauthorised"
                   {"error":"No authorisation token provided"} */
                'url': rootUrl,
                'callback': function(response) {
                    actionCallback(rootUrl + '?token=' + response.token)
                }
            })
        },
        'showLog': function(event) {
            /* TODO: The Log Button is essentially untested
              All examples I can find give a Blank dialog for this file */
            const type = store.state.models.emMotionCorrection.TYPE
            this.signUrl(event.target.href, function(signedUrl) {
                // TODO: The dialog doesn't fit nicely on the screen
                MarionetteApplication.getInstance().dialog.show(new LogView({
                    'title': type + ' Log File',
                    'url': signedUrl
                }))
            })
        },
        /*
        'showOutput': function(event) {
            this.signUrl(event.target.href, function(signedUrl) {
                window.location = signedUrl
            })
        },
        */
    },
}
</script>
