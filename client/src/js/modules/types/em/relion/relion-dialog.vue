<template>
  <dialog-modal
    :is-active="processingDialogVisible"
    title="Relion Processing"
    cancel-label="Cancel"
    confirm-label="Process"
    @confirm="confirm"
    @cancel="$store.commit('em/cancelProcessingDialog')"
  >
    <form
      novalidate
      class="relion-form"
    >
      <div class="relion-form-section">
        <h3 class="relion-form-section-heading">
          Project
        </h3>

        <relion-input-select
          v-validate="'required'"
          name="projectAcquisitionSoftware"
          label="Acquisition Software"
          :options="['EPU', 'SerialEM']"
        />

        <relion-input-select
          name="projectMovieRawFolder"
          label="Raw Folder (select)"
          :options="['raw', 'raw2', 'raw3', 'raw4', 'raw5', 'raw6', 'raw7', 'raw8', 'raw9']"
        />

        <relion-input-text
          v-validate="{ required: true, regex: /^[\w-]+$/ }"
          name="projectMovieRawFolder"
          label="Raw Folder (or enter your own)"
        />

        <relion-input-select
          v-validate="'required'"
          name="projectMovieFileNameExtension"
          label="Movie File Name Extension"
          :options="['.tif', '.tiff', '.mrc', '.eer']"
        />

        <relion-input-checkbox
          name="projectGainReferenceFile"
          label="Gain Reference File"
        />

        <relion-input-text
          v-if="projectGainReferenceFile"
          v-validate="{ required: true, regex: /^[\w-]+\.[\w]{3,4}$/ }"
          label="Gain Reference File Name"
          name="projectGainReferenceFileName"
        />
      </div>

      <div class="relion-form-section">
        <h3 class="relion-form-section-heading">
          Experiment
        </h3>

        <relion-input-select
          v-validate="'required'"
          name="voltage"
          label="Voltage (kV)"
          :options="['200', '300']"
        />

        <relion-input-select
          name="sphericalAberration"
          label="Spherical Aberration (mm)"
          default-text=""
          :options="[{ 'value': '2.7', 'display': '2.7 (Talos/Krios)' }]"
        />

        <relion-input-checkbox
          name="findPhaseShift"
          label="Phase Plate Used"
        />

        <relion-input-text
          v-validate="'required|min_value:0.02|max_value:100'"
          name="pixelSize"
          label="Pixel Size (Å/pixel)"
        />

        <relion-input-text
          v-if="movieFileEer"
          v-validate="'integer|required|min_value:1'"
          name="eerGrouping"
          label="EER fractionation"
          :extra-description="['Number of frames to group into a fraction.','Excess frames are discarded.']"
        />

        <relion-input-select
          name="motionCorrectionBinning"
          label="Motion Correction Binning"
          :options="['1', '2']"
        />

        <relion-input-text
          v-validate="'required|min_value:0.02|max_value:10'"
          name="dosePerFrame"
          :label="'Dose per frame (' + electronsPerAngstromSquared + ')'"
        />
      </div>

      <div>
        <relion-input-checkbox
          name="pipelineDo1stPass"
          label="Continue after CTF estimation"
          outer-class="relion-form-field relion-after-ctf-header"
        />

        <div class="relion-form">
          <div class="relion-form-section">
            <h3 class="relion-form-section-heading">
              2D &amp; 3D Classification
            </h3>

            <div v-if="pipelineDo1stPass">
              <relion-input-checkbox
                name="pipelineDo1stPassClassification2d"
                label="Do 2D Classification"
              />

              <relion-input-checkbox
                name="pipelineDo1stPassClassification3d"
                label="Do 3D Classification"
              />
            </div>
          </div>

          <div class="relion-form-section">
            <h3 class="relion-form-section-heading">
              Particle Picking
            </h3>

            <div v-if="pipelineDo1stPass">
              <relion-input-checkbox
                name="particleUseCryolo"
                label="Use crYOLO"
                :extra-description="['Academic users only.','Not licensed for industry users.']"
              />

              <relion-input-text
                v-validate="'required|min_value:0.02|max_value:1024'"
                name="particleDiameterMin"
                label="Minimum Diameter (Å)"
              />

              <relion-input-text
                v-validate="'required|min_value:0.02|max_value:4000'"
                name="particleDiameterMax"
                label="Maximum Diameter (Å)"
              />

              <relion-input-text
                v-validate="'required|min_value:0.1|max_value:1024'"
                name="particleMaskDiameter"
                label="Mask Diameter (Å)"
                :disabled="calculateForMe"
              />

              <relion-input-text
                v-validate="'required|min_value:0.1|max_value:1024'"
                name="particleBoxSize"
                label="Box Size (pixels)"
                :disabled="calculateForMe"
              />

              <relion-input-text
                v-validate="'required|min_value:0.1|max_value:1024'"
                name="particleBoxSizeSmall"
                label="Downsample Box Size (pixels)"
                :disabled="calculateForMe"
              />

              <relion-input-checkbox
                name="particleCalculateForMe"
                label="Calculate For Me"
              />
            </div>
          </div>

          <div class="relion-form-section">
            <h3 class="relion-form-section-heading">
              Second Pass
            </h3>

            <div v-if="pipelineDo1stPass">
              <relion-input-checkbox
                name="pipelineDo2ndPass"
                label="Do Second Pass"
              />

              <template v-if="pipelineDo2ndPass">
                <relion-input-checkbox
                  name="pipelineDo2ndPassClassification2d"
                  label="Do 2D Classification"
                />

                <relion-input-checkbox
                  name="pipelineDo2ndPassClassification3d"
                  label="Do 3D Classification"
                />
              </template>
            </div>
          </div>
        </div>
      </div>
    </form>
  </dialog-modal>
</template>

<script>
import { mapGetters } from 'vuex'
import DialogModal from 'app/components/dialog-modal.vue'
import FormatsUnits from 'modules/types/em/components/formats-units'
import RelionInputCheckbox from 'modules/types/em/relion/relion-input-checkbox.vue'
import RelionInputSelect from 'modules/types/em/relion/relion-input-select.vue'
import RelionInputText from 'modules/types/em/relion/relion-input-text.vue'

export default {
    'name': 'RelionDialog',
    'components': {
        'dialog-modal': DialogModal,
        'relion-input-checkbox': RelionInputCheckbox,
        'relion-input-select': RelionInputSelect,
        'relion-input-text': RelionInputText,
    },
    'mixins': [FormatsUnits],
    'computed': {
        ...mapGetters('em/relion', [
            'calculateForMe',
            'movieFileEer',
            'pipelineDo1stPass',
            'pipelineDo2ndPass',
            'projectGainReferenceFile',
            'relionStartJson',
        ]),
        ...mapGetters('em', [
            'processingDialogVisible'
        ]),
    },
    'methods': {
        'confirm': function() {
            const vm = this
            this.$validator.validateAll().then((result) => {
                vm.$store.commit('em/relion/formErrors', vm.errors)
                if (result) {
                    vm.$store.dispatch('em/relion/start')
                }
            })
        }
    },
}
</script>

<style>
.relion-form {
    display: flex;
}
.relion-form-section, .relion-after-ctf-header {
    margin: 5px;
    background-color: #e6e6e6;
    padding: 8px;
}
.relion-form-section-heading {
    font-weight: bold;
}
.relion-form-field {
    margin-top: 5px;
}
.relion-form-input {
    display: block;
}
.relion-form-note {
    font-size: 10px;
}
</style>
