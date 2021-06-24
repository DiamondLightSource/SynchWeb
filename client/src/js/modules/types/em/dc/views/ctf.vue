<template>
  <div class="clearfix">
    <p v-if="!model.get('CTFID')">
      No CTF Correction for this movie
    </p>

    <template v-else>
      <h2>CTF Correction</h2>

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
        <ctf-fft
          :api-url="apiUrl"
          :model="model"
        />
        <ctf-params
          :model="model"
        />
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
import MarionetteApplication from 'app/marionette-application.js'
import CtfParamsView from 'modules/types/em/dc/views/ctf-params.vue'
import CtfFftView from 'modules/types/em/dc/views/ctf-fft.vue'

export default {
    'name': "CtfView",
    'components': {
        'dialog-box': DialogBox,
        'ctf-params': CtfParamsView,
        'ctf-fft': CtfFftView,
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
        'dllUrl': function() {
            return this.apiUrl +
                '/download/id/' +
                this.model.get('DATACOLLECTIONID') +
                '/aid/' +
                this.model.get('AUTOPROCPROGRAMID')
        },
        'logUrl': function() {
            return this.apiUrl +
                '/download/id/' +
                this.model.get('DATACOLLECTIONID') +
                '/aid/' +
                this.model.get('AUTOPROCPROGRAMID') +
                '/log/1'
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
