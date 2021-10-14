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
    <dialog-schema-form
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
          <schema-input
            v-for="name in inputs.movies"
            :key="name"
            :name="name"
            :form="form"
          />
        </div>

        <div class="dialog-form-section">
          <h3 class="dialog-form-section-heading">
            Optics
          </h3>
          <schema-input
            v-for="name in inputs.optics"
            :key="name"
            :name="name"
            :form="form"
          />
        </div>

        <div class="dialog-form-section">
          <h3 class="dialog-form-section-heading">
            Electron Beam &amp; Detector
          </h3>
          <schema-input
            v-for="name in inputs.beamDetector"
            :key="name"
            :name="name"
            :form="form"
          />
        </div>
      </template>
    </dialog-schema-form>
  </span>
</template>

<script>
import { mapGetters } from 'vuex'
import DialogSchemaForm from 'modules/types/em/components/dialog-schema-form.vue'
import SchemaInput from 'modules/types/em/components/schema-input.vue'
import ToolbarButton from 'modules/types/em/components/toolbar-button.vue'

export default {
    'name': 'NewDataCollection',
    'components': {
        'dialog-schema-form': DialogSchemaForm,
        'schema-input': SchemaInput,
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
            /* Hopefully, we can use this to check for errors that don't
               have an associated input (which is most likely a coding error)
               But I'm not sure how just yet as all the schema and error related
               stuff is inside dialog-schema-form */
            'inputs': {
                'movies': [
                    'acquisitionSoftware',
                    'imageDirectory',
                    'imageSuffix',
                    'pixelSizeOnImage',
                    'imageSize',
                    'numberOfImages',
                    'numberOfPasses',
                    'exposureTime',
                ],
                'optics': [
                    'c2lens',
                    'c2aperture',
                    'objAperture',
                    'magnification',
                ],
                'beamDetector': [
                    'voltage',
                    'beamSizeAtSampleX',
                    'beamSizeAtSampleY',
                    'slitGapHorizontal',
                    'totalExposedDose',
                    'phasePlate',
                    //'detectorManufacturer',
                    //'detectorModel',
                    'detectorMode',
                ],
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
