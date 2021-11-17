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
        <dialog-schema-form-section heading="Raw Images">
          <schema-input
            v-for="name in inputs.movies"
            :key="name"
            :name="name"
            :form="form"
          />
        </dialog-schema-form-section>

        <!-- dialog-schema-form-section heading="Optics">
          <schema-input
            v-for="name in inputs.optics"
            :key="name"
            :name="name"
            :form="form"
          />
        </dialog-schema-form-section -->

        <!-- dialog-schema-form-section heading="Electron Beam &amp; Detector">
          <schema-input
            v-for="name in inputs.beamDetector"
            :key="name"
            :name="name"
            :form="form"
          />
        </dialog-schema-form-section -->
      </template>
    </dialog-schema-form>
  </span>
</template>

<script>
import { mapGetters } from 'vuex'
import DialogSchemaForm from 'modules/types/em/components/dialog-schema-form.vue'
import DialogSchemaFormSection from 'modules/types/em/components/dialog-schema-form-section.vue'
import SchemaInput from 'modules/types/em/components/schema-input.vue'
import ToolbarButton from 'modules/types/em/components/toolbar-button.vue'

export default {
    'name': 'NewDataCollection',
    'components': {
        'dialog-schema-form': DialogSchemaForm,
        'dialog-schema-form-section': DialogSchemaFormSection,
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
            'inputs': {
                'movies': [
                    'acquisitionSoftware',
                    'imageDirectory',
                    'imageSuffix',
                    /*
                    'pixelSizeOnImage',
                    'imageSize',
                    'numberOfImages',
                    'numberOfPasses',
                    'exposureTime',
                    */
                ],
                /*
                'optics': [
                    'phasePlate',
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
                    //'detectorManufacturer',
                    //'detectorModel',
                    'detectorMode',
                ],
                */
            },
        }
    },
    'computed': {
        ...mapGetters({
            'currentVisit': 'proposal/currentVisit',
        }),
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
                'message': response.id,
                'level': 'success'
            })
            this.$router.push(
                '/dc/visit/' + this.currentVisit + '/collection/' + response.id
            )
        },
    },
}
</script>
