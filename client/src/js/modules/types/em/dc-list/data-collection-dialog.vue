<template>
  <dialog-form
    title="New Data Collection"
    confirm-label="Add"
    schema-url="dc/schema"
    :post-url="postUrl"
    :show-dialog="showDialog"
    @posted="addSuccess"
    @cancel="$emit('cancel')"
  >
    <template #default="form">
      <div class="dialog-form-section">
        <h3 class="dialog-form-section-heading">
          Movies
        </h3>

        <input-select
          name="acquisitionSoftware"
          :form="form"
        />
        <input-text
          name="imageDirectory"
          :form="form"
        />

        <input-select
          name="imageSuffix"
          :form="form"
        />

        <input-text
          name="pixelSizeOnImage"
          :form="form"
        />

        <input-text
          name="pixelSizeOnImage"
          :form="form"
        />

        <input-text
          name="imageSizeX"
          :form="form"
        />

        <input-text
          name="imageSizeY"
          :form="form"
        />

        <input-text
          name="numberOfImages"
          :form="form"
        />

        <input-text
          name="numberOfPasses"
          :form="form"
        />

        <input-text
          name="exposureTime"
          :form="form"
        />
      </div>

      <div class="dialog-form-section">
        <h3 class="dialog-form-section-heading">
          Optics
        </h3>

        <input-text
          name="c1lens"
          :form="form"
        />
        <input-text
          name="c1aperture"
          :form="form"
        />
        <input-text
          name="c2lens"
          :form="form"
        />
        <input-text
          name="c2aperture"
          :form="form"
        />
        <input-text
          name="c3lens"
          :form="form"
        />
        <input-text
          name="c3aperture"
          :form="form"
        />
        <input-text
          name="objAperture"
          :form="form"
        />
        <input-text
          name="magnification"
          :form="form"
        />
      </div>

      <div class="dialog-form-section">
        <h3 class="dialog-form-section-heading">
          Electron Beam &amp; Detector
        </h3>

        <input-select
          name="voltage"
          :form="form"
        />

        <input-text
          name="beamSizeAtSampleX"
          :form="form"
        />

        <input-text
          name="beamSizeAtSampleY"
          :form="form"
        />

        <input-text
          name="totalExposedDose"
          :form="form"
        />

        <input-checkbox
          name="phasePlate"
          :form="form"
        />

        <input-text
          name="detectorManufacturer"
          :form="form"
        />

        <input-text
          name="detectorModel"
          :form="form"
        />

        <input-text
          name="detectorMode"
          :form="form"
        />
      </div>
    </template>
  </dialog-form>
</template>

<script>
/*
 * TODO: Could we make Detector into a drop down
 * And pre-insert the eBIC "standard" detectors into iSpyB?
 */

import { mapGetters } from 'vuex'
import DialogForm from 'modules/types/em/components/dialog-form.vue'
import InputCheckbox from 'modules/types/em/components/input-checkbox.vue'
import InputSelect from 'modules/types/em/components/input-select.vue'
import InputText from 'modules/types/em/components/input-text.vue'

export default {
    'name': 'DataCollectionDialog',
    'components': {
        'dialog-form': DialogForm,
        'input-checkbox': InputCheckbox,
        'input-select': InputSelect,
        'input-text': InputText,
    },
    'props': {
        'showDialog': {
            'type': Boolean,
            'required': true,
        },
    },
    'computed': {
        ...mapGetters('proposal', ['currentVisit']),
        'postUrl': function() {
            return 'dc/new/' + this.currentVisit
        },
    },
    'methods': {
        'addSuccess': function(response) {
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
