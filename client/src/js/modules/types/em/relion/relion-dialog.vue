<template>
  <dialog-modal
    :show-dialog="processingDialogVisible"
    title="Relion Processing"
    cancel-label="Cancel"
    confirm-label="Process"
    @confirm="relionStart"
    @cancel="$store.commit('em/cancelProcessingDialog')"
  >
    <form
      v-if="processingDialogVisible"
      novalidate
      class="relion-form"
    >
      <div class="relion-form-section">
        <h3 class="relion-form-section-heading">
          Project
        </h3>

        <input-select
          name="acquisition_software"
          :parameters="parameters"
          :schema="schema"
          :error-messages="errorMessages"
          @update="update"
        />

        <input-select
          name="import_images_dir"
          :parameters="parameters"
          :schema="schema"
          :error-messages="errorMessages"
          :help-text="['select from list']"
          @update="update"
        />

        <input-text
          name="import_images_dir"
          :parameters="parameters"
          :schema="schema"
          :error-messages="errorMessages"
          :help-text="['or enter your own']"
          @update="update"
        />

        <input-select
          name="import_images_ext"
          :parameters="parameters"
          :schema="schema"
          :error-messages="errorMessages"
          @update="update"
        />

        <!-- "Gain Reference File" default: false -->
        <input-checkbox
          name="wantGainReferenceFile"
          :parameters="parameters"
          :schema="schema"
          :error-messages="errorMessages"
          @update="update"
        />

        <input-text
          v-if="parameters.wantGainReferenceFile"
          name="motioncor_gainreference"
          :parameters="parameters"
          :schema="schema"
          :error-messages="errorMessages"
          @update="update"
        />
      </div>

      <div class="relion-form-section">
        <h3 class="relion-form-section-heading">
          Experiment
        </h3>

        <input-select
          name="voltage"
          :parameters="parameters"
          :schema="schema"
          :error-messages="errorMessages"
          @update="update"
        />

        <input-select
          name="Cs"
          :parameters="parameters"
          :schema="schema"
          :error-messages="errorMessages"
          @update="update"
        />

        <input-checkbox
          name="ctffind_do_phaseshift"
          :parameters="parameters"
          :schema="schema"
          :error-messages="errorMessages"
          @update="update"
        />

        <input-text
          name="angpix"
          :parameters="parameters"
          :schema="schema"
          :error-messages="errorMessages"
          @update="update"
        />

        <input-text
          v-if="parameters.import_images_ext == 'eer'"
          name="eer_grouping"
          :parameters="parameters"
          :schema="schema"
          :error-messages="errorMessages"
          @update="update"
        />

        <input-select
          name="motioncor_binning"
          :parameters="parameters"
          :schema="schema"
          :error-messages="errorMessages"
          @update="update"
        />

        <input-text
          name="motioncor_doseperframe"
          :parameters="parameters"
          :schema="schema"
          :error-messages="errorMessages"
          @update="update"
        />
      </div>

      <div>
        <!-- TODO strange inverted logic -->
        <input-checkbox
          name="stop_after_ctf_estimation"
          extra-class="relion-after-ctf-header"
          :parameters="parameters"
          :schema="schema"
          :error-messages="errorMessages"
          @update="update"
        />

        <div class="relion-form">
          <div class="relion-form-section">
            <h3 class="relion-form-section-heading">
              2D &amp; 3D Classification
            </h3>

            <div v-if="!parameters.stop_after_ctf_estimation">
              <input-checkbox
                name="do_class2d"
                :parameters="parameters"
                :schema="schema"
                :error-messages="errorMessages"
                @update="update"
              />

              <input-checkbox
                name="do_class3d"
                :parameters="parameters"
                :schema="schema"
                :error-messages="errorMessages"
                @update="update"
              />
            </div>
          </div>

          <div class="relion-form-section">
            <h3 class="relion-form-section-heading">
              Particle Picking
            </h3>

            <div v-if="!parameters.stop_after_ctf_estimation">
              <input-checkbox
                name="autopick_do_cryolo"
                :parameters="parameters"
                :schema="schema"
                :error-messages="errorMessages"
                @update="update"
              />

              <input-text
                name="autopick_LoG_diam_min"
                :parameters="parameters"
                :schema="schema"
                :error-messages="errorMessages"
                @update="update"
              />

              <input-text
                name="autopick_LoG_diam_max"
                :parameters="parameters"
                :schema="schema"
                :error-messages="errorMessages"
                @update="update"
              />

              <input-text
                name="mask_diameter"
                :parameters="parameters"
                :schema="schema"
                :error-messages="errorMessages"
                :disabled="parameters.wantCalculate"
                @update="update"
              />

              <input-text
                name="extract_boxsize"
                :parameters="parameters"
                :schema="schema"
                :error-messages="errorMessages"
                :disabled="parameters.wantCalculate"
                @update="update"
              />

              <input-text
                name="extract_small_boxsize"
                :parameters="parameters"
                :schema="schema"
                :error-messages="errorMessages"
                :disabled="parameters.wantCalculate"
                @update="update"
              />

              <input-checkbox
                name="wantCalculate"
                :parameters="parameters"
                :schema="schema"
                :error-messages="errorMessages"
                @update="update"
              />
            </div>
          </div>

          <div class="relion-form-section">
            <h3 class="relion-form-section-heading">
              Second Pass
            </h3>

            <div v-if="!parameters.stop_after_ctf_estimation">
              <input-checkbox
                name="want2ndPass"
                :parameters="parameters"
                :schema="schema"
                :error-messages="errorMessages"
                @update="update"
              />

              <template v-if="parameters.want2ndPass">
                <input-checkbox
                  name="do_class2d_pass2"
                  :parameters="parameters"
                  :schema="schema"
                  :error-messages="errorMessages"
                  @update="update"
                />

                <input-checkbox
                  name="do_class3d_pass2"
                  :parameters="parameters"
                  :schema="schema"
                  :error-messages="errorMessages"
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
import Backbone from 'backbone'
import boxCalculator from 'modules/types/em/relion/box-calculator'
import DialogModal from 'app/components/dialog-modal.vue'
import InputCheckbox from 'modules/types/em/components/input-checkbox.vue'
import InputSelect from 'modules/types/em/components/input-select.vue'
import InputText from 'modules/types/em/components/input-text.vue'
import Schema from 'modules/types/em/relion/schema'

export default {
    'name': 'RelionDialog',
    'components': {
        'dialog-modal': DialogModal,
        'input-checkbox': InputCheckbox,
        'input-select': InputSelect,
        'input-text': InputText,
    },
    'mixins': [Schema],
    'data': function() {
        return {
            'parameters': {},
            'errorMessages': {},
        }
    },
    'computed': {
        ...mapGetters('em', ['processingDialogVisible']),
    },
    'mounted': function() {
        this.fetchSchema(this.setToDefaults)
    },
    'methods': {
        'setToDefaults': function() {
            this.iterateSchema((name) => {
                const schemaDefault = this.schema[name].default
                this.$set(
                    this.parameters,
                    name,
                    typeof schemaDefault == 'undefined' ? '' : schemaDefault
                )
            })
            console.log('Relion dialog set to defaults', this.parameters)
        },
        'update': function({name, value}) {
            if (typeof this.parameters[name] == 'undefined') {
                throw new Error('illegal attempt to update state of' + name)
            }
            this.parameters[name] = value
            boxCalculator(name, this.parameters)
        },
        // eslint-disable-next-line no-unused-vars
        'startSuccess': function(data, textStatus, jqXHR) {
            this.$store.commit('loading', false)
            this.$store.commit('em/cancelProcessingDialog', null)
            this.$store.commit('notifications/addNotification', {
                'title': 'Job submitted',
                'message': 'Processing Job submitted OK.',
                'level': 'success'
            })
        },
        'startError': function(jqXHR, textStatus, errorThrown) {
            var errorMessages
            this.$store.commit('loading', false)
            try {
                errorMessages = JSON.parse(jqXHR.responseText).message.invalid
            } catch (error) {
                errorMessages = undefined
            }
            if (typeof errorMessages == 'object') {
                this.errorMessages = errorMessages
                return
            }
            console.log(
                'Error starting Relion job',
                'textStatus: ', textStatus,
                'errorThrown: ', errorThrown,
                'jqXHR: ', jqXHR
            )
            this.$store.commit('notifications/addNotification', {
                'title': 'Failed',
                'message': 'Relion start failed',
                'level': 'error'
            })
        },
        'relionStart': function() {
            this.$store.commit('loading', true)
            console.log(this.parameters)
            Backbone.ajax({
                'url': this.$store.state.apiUrl +
                    '/em/relion/start/' + this.$store.state.proposal.visit,
                'type': 'POST',
                'contentType': 'application/json',
                'data': JSON.stringify(this.parameters),
                // eslint-disable-next-line no-unused-vars
                'success': this.startSuccess,
                'error': this.startError,
            })
        },
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
</style>
