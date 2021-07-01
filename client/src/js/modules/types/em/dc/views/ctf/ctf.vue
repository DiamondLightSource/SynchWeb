<template>
  <div class="ctf dcap clearfix">
    <p v-if="nothingToShow">
      No CTF Estimation for this movie
    </p>

    <template v-else>
      <h2>CTF Estimation</h2>

      <dialog-box />

      <p class="ra">
        <a
          class="dll button"
          :href="dllUrl"
          @click.prevent="showOutput"
        ><i class="fa fa-download" /> Output</a>
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
        <!-- Cont. Trans. Function ????? -->
        <dc-image
          container-title="Click to view FFT"
          container-class="diffraction fft"
          image-title="FFT Theoretical"
          :image-url="imageUrl"
        />

        <params />
      </div>
    </template>
  </div>
</template>

<script>

import LogView from 'views/log'
import utils from 'utils'
import store from 'app/store/store'
/* TODO: dialogbox.vue belongs on a top level page
   keep moving it until the whole page is "vue-ified" */
import DialogBox from 'app/components/dialogbox.vue'
import MarionetteApplication from 'app/marionette-application.js'
import Params from 'modules/types/em/dc/views/ctf/params.vue'
import DcImage from 'modules/types/em/dc/views/dc-image.vue'

export default {
    'name': "CtfView",
    'components': {
        'dialog-box': DialogBox,
        'dc-image': DcImage,
        'params': Params,
    },
    'data': function() {
        return {
            'apiUrl': store.state.apiUrl
        }
    },
    'computed': {
        'nothingToShow': function() {
            !store.state.models.emCtf.CTFID
        },
        'dllUrl': function() {
            return this.apiUrl +
                '/download/id/' +
                store.state.models.emCtf.DATACOLLECTIONID +
                '/aid/' +
                store.state.models.emCtf.AUTOPROCPROGRAMID
        },
        'logUrl': function() {
            return this.apiUrl +
                '/download/id/' +
                store.state.models.emCtf.DATACOLLECTIONID +
                '/aid/' +
                store.state.models.emCtf.AUTOPROCPROGRAMID +
                '/log/1'
        },
        'imageUrl': function() {
            return this.apiUrl +
                '/em/ctf/image/' +
                store.state.models.emCtf.DATACOLLECTIONID +
                '/n/' +
                store.state.models.emCtf.IMAGENUMBER
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
            const type = store.state.models.emCtf.TYPE
            this.signUrl(event.target.href, function(signedUrl) {
                // TODO: The dialog doesn't fit nicely on the screen
                MarionetteApplication.getInstance().dialog.show(new LogView({
                    'title': type + ' Log File',
                    'url': signedUrl
                }))
            })
        },
        'showOutput': function(event) {
            /* TODO: The Download Button is essentially untested
              All examples I can find give a "Not Found" for this file */
            this.signUrl(event.target.href, function(signedUrl) {
                window.location = signedUrl
            })
        },
    },
}
</script>
