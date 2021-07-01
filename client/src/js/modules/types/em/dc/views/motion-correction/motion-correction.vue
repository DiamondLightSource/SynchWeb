<template>
  <div class="clearfix">
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
        <drift
          :collection-id="collectionId"
          :image-number="imageNumber"
        />

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

        <params :model="model" />
      </div>
    </template>
  </div>
</template>

<script>
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
    'props': {
        'apiUrl': {
            'type': String,
            'required': true,
        },
        'model': {
            'type': Object,
            'required': true,
        },
    },
    'computed': {
        /*
        'dllUrl': function() {
            return this.apiUrl +
                '/download/id/' + this.model.get('DATACOLLECTIONID') +
                '/aid/' + this.model.get('AUTOPROCPROGRAMID')
        },
        */
        'logUrl': function() {
            return this.apiUrl +
                '/download/id/' + this.model.get('DATACOLLECTIONID') +
                '/aid/' + this.model.get('AUTOPROCPROGRAMID') +
                '/log/1'
        },
        'fftUrl': function() {
            return this.apiUrl +
                '/em/mc/fft/image/' + this.model.get('DATACOLLECTIONID') +
                '/n/' + this.model.get('IMAGENUMBER') +
                '/t/2'
        },
        'imageUrl': function() {
            return this.apiUrl +
                '/em/mc/fft/image/' + this.model.get('DATACOLLECTIONID') +
                '/n/' + this.model.get('IMAGENUMBER')
        },
        'nothingToShow': function() {
            return !this.model.get('MOTIONCORRECTIONID')
        },
        'collectionId': function() {
            return this.model.get('id')
        },
        'imageNumber': function() {
            return this.model.get('IMAGENUMBER')
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
            const type = this.model.get('TYPE')
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
