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
          name="projectAcquisitionSoftware"
          :parameters="parameters"
          @update="update"
        />

        <relion-input-select
          name="projectMovieRawFolder"
          :parameters="parameters"
          :extra-description="['select from list']"
          @update="update"
        />

        <relion-input-text
          v-validate="'required|alpha_dash'"
          name="projectMovieRawFolder"
          :parameters="parameters"
          :extra-description="['or enter your own']"
          :error="errors.first('projectMovieRawFolder')"
          @update="update"
        />

        <relion-input-select
          name="projectMovieFileNameExtension"
          :parameters="parameters"
          @update="update"
        />

        <relion-input-checkbox
          name="projectGainReferenceFile"
          :parameters="parameters"
          @update="update"
        />

        <relion-input-text
          v-if="requireGainReferenceFile"
          v-validate="{ required: true, regex: /^[\w-]+\.[\w]{3,4}$/ }"
          name="projectGainReferenceFileName"
          :parameters="parameters"
          :error="errors.first('projectGainReferenceFileName')"
          @update="update"
        />
      </div>

      <div class="relion-form-section">
        <h3 class="relion-form-section-heading">
          Experiment
        </h3>

        <relion-input-select
          name="voltage"
          :parameters="parameters"
          @update="update"
        />

        <relion-input-select
          name="sphericalAberration"
          :parameters="parameters"
          @update="update"
        />

        <relion-input-checkbox
          name="findPhaseShift"
          :parameters="parameters"
          @update="update"
        />

        <relion-input-text
          v-validate="'required|min_value:0.02|max_value:100'"
          name="pixelSize"
          :parameters="parameters"
          :error="errors.first('pixelSize')"
          @update="update"
        />

        <relion-input-text
          v-if="requireEer"
          v-validate="'integer|required|min_value:1'"
          name="eerGrouping"
          :error="errors.first('eerGrouping')"
          :parameters="parameter"
          :extra-description="['Number of frames to group into a fraction.','Excess frames are discarded.']"
          @update="update"
        />

        <relion-input-select
          name="motionCorrectionBinning"
          :parameters="parameters"
          @update="update"
        />

        <relion-input-text
          v-validate="'required|min_value:0.02|max_value:10'"
          name="dosePerFrame"
          :parameters="parameters"
          :error="errors.first('eerGrouping')"
          @update="update"
        />
      </div>

      <div>
        <relion-input-checkbox
          name="pipelineDo1stPass"
          extra-class="relion-form-field relion-after-ctf-header"
          :parameters="parameters"
          @update="update"
        />

        <div class="relion-form">
          <div class="relion-form-section">
            <h3 class="relion-form-section-heading">
              2D &amp; 3D Classification
            </h3>

            <div v-if="require1stPass">
              <relion-input-checkbox
                name="pipelineDo1stPassClassification2d"
                :parameters="parameters"
                @update="update"
              />

              <relion-input-checkbox
                name="pipelineDo1stPassClassification3d"
                :parameters="parameters"
                @update="update"
              />
            </div>
          </div>

          <div class="relion-form-section">
            <h3 class="relion-form-section-heading">
              Particle Picking
            </h3>

            <div v-if="require1stPass">
              <relion-input-checkbox
                name="particleUseCryolo"
                :parameters="parameters"
                :extra-description="['Academic users only.','Not licensed for industry users.']"
                @update="update"
              />

              <relion-input-text
                v-validate="'required|min_value:0.02|max_value:1024'"
                name="particleDiameterMin"
                :parameters="parameters"
                :error="errors.first('particleDiameterMin')"
                @update="update"
              />

              <relion-input-text
                v-validate="'required|min_value:0.02|max_value:4000'"
                name="particleDiameterMax"
                :error="errors.first('particleDiameterMax')"
                :parameters="parameters"
                @update="update"
              />

              <relion-input-text
                v-validate="'required|min_value:0.1|max_value:1024'"
                name="particleMaskDiameter"
                :error="errors.first('particleMaskDiameter')"
                :parameters="parameters"
                :disabled="parameters.particleCalculateForMe.value"
                @update="update"
              />

              <relion-input-text
                v-validate="'required|min_value:0.1|max_value:1024'"
                name="particleBoxSize"
                :error="errors.first('particleBoxSize')"
                :parameters="parameters"
                :disabled="parameters.particleCalculateForMe.value"
                @update="update"
              />

              <relion-input-text
                v-validate="'required|min_value:0.1|max_value:1024'"
                name="particleBoxSizeSmall"
                :error="errors.first('particleBoxSizeSmall')"
                :parameters="parameters"
                :disabled="parameters.particleCalculateForMe.value"
                @update="update"
              />

              <relion-input-checkbox
                name="particleCalculateForMe"
                :parameters="parameters"
                @update="update"
              />
            </div>
          </div>

          <div class="relion-form-section">
            <h3 class="relion-form-section-heading">
              Second Pass
            </h3>

            <div v-if="require1stPass">
              <relion-input-checkbox
                name="pipelineDo2ndPass"
                :parameters="parameters"
                @update="update"
              />

              <template v-if="require2ndPass">
                <relion-input-checkbox
                  name="pipelineDo2ndPassClassification2d"
                  :parameters="parameters"
                  @update="update"
                />

                <relion-input-checkbox
                  name="pipelineDo2ndPassClassification3d"
                  :parameters="parameters"
                  @update="update"
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
import RelionInputCheckbox from 'modules/types/em/relion/relion-input-checkbox.vue'
import RelionInputSelect from 'modules/types/em/relion/relion-input-select.vue'
import RelionInputText from 'modules/types/em/relion/relion-input-text.vue'
import parameters from 'modules/types/em/relion/parameters'
import boxCalculator from 'modules/types/em/relion/box-calculator'

export default {
    'name': 'RelionDialog',
    'components': {
        'dialog-modal': DialogModal,
        'relion-input-checkbox': RelionInputCheckbox,
        'relion-input-select': RelionInputSelect,
        'relion-input-text': RelionInputText,
    },
    'data': function() {
        return {
            'parameters': parameters,
        }
    },
    'computed': {
        ...mapGetters('em', [
            'processingDialogVisible'
        ]),
        'require1stPass': function() {
            return this.parameters.pipelineDo1stPass.value === true
        },
        'require2ndPass': function() {
            return this.parameters.pipelineDo2ndPass.value === true
        },
        'requireGainReferenceFile': function() {
            return this.parameters.projectGainReferenceFile.value === true
        },
        'requireEer': function() {
            return this.parameters.projectMovieFileNameExtension.value == '.eer'
        },
    },
    'mounted': function() {
        this.setDefaults();
    },
    'methods': {
        'setDefaults': function() {
          for (const name in this.parameters) {
              var parameter = this.parameters[name]
              if (
                  typeof parameter.value !== 'undefined' &&
                  typeof parameter.default !== 'undefined'
              ) {
                  parameter.value = parameter.default
              }
          }
        },
        'update': function(payload) {
            const name = payload.name
            const value = payload.value
            console.log(payload, this.parameters)
            if (typeof this.parameters[name] == 'undefined') {
                throw new Error('illegal attempt to update state of' + name)
            }
            this.parameters[name].value = value
            console.log(payload, this.parameters)
            boxCalculator(name, this.errors, this.parameters)
        },
        'confirm': function() {
            this.$validator.validate().then((result) => {
                console.log(this.errors)
                if (result) {
                    //this.$store.dispatch('em/relion/start')
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
.relion-form-error {
    padding: 3px;
    margin-top: 3px;
}
</style>
