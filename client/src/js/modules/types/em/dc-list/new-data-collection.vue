<template>
  <span>
    <toolbar-button
      icon="fa fa-plus"
      button-text="Add data Collection"
      :show-text="showText"
      :hint="hint"
      :disabled="hint !== 'Add data collection'"
      @click="showDialog = true"
    />
    <dialog-form
      title="New Data Collection"
      confirm-label="Add"
      schema-url="dc/schema"
      :post-url="'dc/new/' + currentVisit"
      :show-dialog="showDialog"
      @posted="postSuccess"
      @cancel="showDialog = false"
    >
      <template #default="form">
        <div class="dialog-form-section">
          <h3 class="dialog-form-section-heading">
            Movies
          </h3>
          <component
            :is="control"
            v-for="(control, name) in inputs.movies"
            :key="name"
            :name="name"
            :form="form"
          />
        </div>

        <div class="dialog-form-section">
          <h3 class="dialog-form-section-heading">
            Optics
          </h3>

          <component
            :is="control"
            v-for="(control, name) in inputs.optics"
            :key="name"
            :name="name"
            :form="form"
          />
        </div>

        <div class="dialog-form-section">
          <h3 class="dialog-form-section-heading">
            Electron Beam &amp; Detector
          </h3>

          <component
            :is="control"
            v-for="(control, name) in inputs.beamDetector"
            :key="name"
            :name="name"
            :form="form"
          />
        </div>
      </template>
    </dialog-form>
  </span>
</template>

<script>
import { mapGetters } from 'vuex'
import DialogForm from 'modules/types/em/components/dialog-form.vue'
import InputCheckbox from 'modules/types/em/components/input-checkbox.vue'
import InputSelect from 'modules/types/em/components/input-select.vue'
import InputText from 'modules/types/em/components/input-text.vue'
import ToolbarButton from 'modules/types/em/components/toolbar-button.vue'

export default {
    'name': 'NewDataCollection',
    'components': {
        'dialog-form': DialogForm,
        'input-checkbox': InputCheckbox,
        'input-select': InputSelect,
        'input-text': InputText,
        'toolbar-button': ToolbarButton,
    },
    'props': {
        'showText': {
            'type': Boolean,
            'default': false,
        },
        'reason': {
            'type': String,
            'required': true,
        },
    },
    'data': function() {
        return {
            'showDialog': false,
            // This way we can iterate over the inputs to check for errors, etc.
            'inputs': {
                'movies': {
                    'acquisitionSoftware': 'input-select',
                    'imageDirectory': 'input-text',
                    'imageSuffix': 'input-select',
                    'pixelSizeOnImage': 'input-text',
                    'imageSize': 'input-select',
                    'numberOfImages': 'input-text',
                    'numberOfPasses': 'input-text',
                    'exposureTime': 'input-text',
                },
                'optics': {
                    'c2lens': 'input-text',
                    'c2aperture': 'input-text',
                    'objAperture': 'input-text',
                    'magnification': 'input-text',
                },
                'beamDetector': {
                    'voltage': 'input-select',
                    'beamSizeAtSampleX': 'input-text',
                    'beamSizeAtSampleY': 'input-text',
                    'totalExposedDose': 'input-text',
                    'phasePlate': 'input-checkbox',
                    'detectorManufacturer': 'input-text',
                    'detectorModel': 'input-text',
                    'detectorMode': 'input-text',
                },
            },
        }
    },
    'computed': {
        ...mapGetters('proposal', ['currentVisit']),
        'hint': function () {
            return this.reason === '' ? 'Add data collection' :
                this.reason + ' - No more data collections possible'
        }
    },
    'methods': {
        'postSuccess': function(response) {
            this.$emit('cancel')
            this.$store.commit('notifications/addNotification', {
                'title': 'Data Collection Added',
                'message': 'data collection Added (' + response.id + ')',
                'level': 'success'
            })
            this.$router.push(
                '/dc/visit/' + this.currentVisit + '/collection/' + response.id
            )
        },
    },
}
</script>
