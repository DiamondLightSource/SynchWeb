<template>
  <dialog-modal
    :show-dialog="processingDialogVisible"
    title="Relion Processing"
    cancel-label="Cancel"
    confirm-label="Process"
    @confirm="confirm"
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

        <relion-input-select
          name="acquisition_software"
          :parameters="parameters"
          :schema="schema"
          @update="update"
        />

        <relion-input-select
          name="import_images_dir"
          :parameters="parameters"
          :schema="schema"
          :help-text="['select from list']"
          @update="update"
        />

        <relion-input-text
          v-validate="'required|alpha_dash'"
          name="import_images_dir"
          :parameters="parameters"
          :schema="schema"
          :help-text="['or enter your own']"
          :error="errors.first('import_images_dir')"
          @update="update"
        />

        <relion-input-select
          name="import_images_ext"
          :parameters="parameters"
          :schema="schema"
          @update="update"
        />

        <!-- "Gain Reference File" default: false -->
        <relion-input-checkbox
          name="wantGainReferenceFile"
          :parameters="parameters"
          :schema="schema"
          @update="update"
        />

        <relion-input-text
          v-if="parameters.wantGainReferenceFile"
          v-validate="{ required: true, regex: /^[\w-]+\.[\w]{3,4}$/ }"
          name="motioncor_gainreference"
          :parameters="parameters"
          :schema="schema"
          :error="errors.first('motioncor_gainreference')"
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
          :schema="schema"
          @update="update"
        />

        <relion-input-select
          name="Cs"
          :parameters="parameters"
          :schema="schema"
          @update="update"
        />

        <relion-input-checkbox
          name="ctffind_do_phaseshift"
          :parameters="parameters"
          :schema="schema"
          @update="update"
        />

        <relion-input-text
          v-validate="'required|min_value:0.02|max_value:100'"
          name="angpix"
          :parameters="parameters"
          :schema="schema"
          :error="errors.first('angpix')"
          @update="update"
        />

        <relion-input-text
          v-if="parameters.import_images_ext == 'eer'"
          v-validate="'integer|required|min_value:1'"
          name="eer_grouping"
          :parameters="parameters"
          :schema="schema"
          :error="errors.first('eer_grouping')"
          @update="update"
        />

        <relion-input-select
          name="motioncor_binning"
          :parameters="parameters"
          :schema="schema"
          @update="update"
        />

        <relion-input-text
          v-validate="'required|min_value:0.02|max_value:10'"
          name="motioncor_doseperframe"
          :parameters="parameters"
          :schema="schema"
          :error="errors.first('motioncor_doseperframe')"
          @update="update"
        />
      </div>


      <div>
        <!-- TODO strange inverted logic -->
        <relion-input-checkbox
          name="stop_after_ctf_estimation"
          extra-class="relion-form-field relion-after-ctf-header"
          :parameters="parameters"
          :schema="schema"
          @update="update"
        />

        <div class="relion-form">
          <div class="relion-form-section">
            <h3 class="relion-form-section-heading">
              2D &amp; 3D Classification
            </h3>

            <div v-if="!parameters.stop_after_ctf_estimation">
              <relion-input-checkbox
                name="do_class2d"
                :parameters="parameters"
                :schema="schema"
                @update="update"
              />

              <relion-input-checkbox
                name="do_class3d"
                :parameters="parameters"
                :schema="schema"
                @update="update"
              />
            </div>
          </div>

          <div class="relion-form-section">
            <h3 class="relion-form-section-heading">
              Particle Picking
            </h3>

            <div v-if="!parameters.stop_after_ctf_estimation">
              <relion-input-checkbox
                name="autopick_do_cryolo"
                :parameters="parameters"
                :schema="schema"
                @update="update"
              />

              <relion-input-text
                v-validate="'required|min_value:0.02|max_value:1024'"
                name="autopick_LoG_diam_min"
                :parameters="parameters"
                :schema="schema"
                :error="errors.first('autopick_LoG_diam_min')"
                @update="update"
              />

              <relion-input-text
                v-validate="'required|min_value:0.02|max_value:4000'"
                name="autopick_LoG_diam_max"
                :error="errors.first('autopick_LoG_diam_max')"
                :parameters="parameters"
                :schema="schema"
                @update="update"
              />

              <relion-input-text
                v-validate="'required|min_value:0.1|max_value:1024'"
                name="mask_diameter"
                :error="errors.first('mask_diameter')"
                :parameters="parameters"
                :schema="schema"
                :disabled="parameters.wantCalculate"
                @update="update"
              />

              <relion-input-text
                v-validate="'required|min_value:0.1|max_value:1024'"
                name="extract_boxsize"
                :error="errors.first('extract_boxsize')"
                :parameters="parameters"
                :schema="schema"
                :disabled="parameters.wantCalculate"
                @update="update"
              />

              <relion-input-text
                v-validate="'required|min_value:0.1|max_value:1024'"
                name="extract_small_boxsize"
                :error="errors.first('extract_small_boxsize')"
                :parameters="parameters"
                :schema="schema"
                :disabled="parameters.wantCalculate"
                @update="update"
              />

              <relion-input-checkbox
                name="wantCalculate"
                :parameters="parameters"
                :schema="schema"
                @update="update"
              />
            </div>
          </div>

          <div class="relion-form-section">
            <h3 class="relion-form-section-heading">
              Second Pass
            </h3>

            <div v-if="!parameters.stop_after_ctf_estimation">
              <relion-input-checkbox
                name="want2ndPass"
                :parameters="parameters"
                :schema="schema"
                @update="update"
              />

              <template v-if="parameters.want2ndPass">
                <relion-input-checkbox
                  name="do_class2d_pass2"
                  :parameters="parameters"
                  :schema="schema"
                  @update="update"
                />

                <relion-input-checkbox
                  name="do_class3d_pass2"
                  :parameters="parameters"
                  :schema="schema"
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
import RelionInputCheckbox from 'modules/types/em/relion/relion-input-checkbox.vue'
import RelionInputSelect from 'modules/types/em/relion/relion-input-select.vue'
import RelionInputText from 'modules/types/em/relion/relion-input-text.vue'
import Schema from 'modules/types/em/relion/schema'

export default {
    'name': 'RelionDialog',
    'components': {
        'dialog-modal': DialogModal,
        'relion-input-checkbox': RelionInputCheckbox,
        'relion-input-select': RelionInputSelect,
        'relion-input-text': RelionInputText,
    },
    'mixins': [Schema],
    'data': function() {
        return { 'parameters': {} }
    },
    'computed': {
        ...mapGetters('em', ['processingDialogVisible']),
    },
    'mounted': function() {
        this.fetchSchema(this.setToDefaults);
    },
    'methods': {
        'setToDefaults': function() {
            for (const name in this.schema) {
                this.$set(this.parameters, name, this.schema[name].default)
            }
            console.log('Relion dialog set to defaults', this.parameters)
        },
        'update': function({name, value}) {
            if (typeof this.parameters[name] == 'undefined') {
                throw new Error('illegal attempt to update state of' + name)
            }
            this.parameters[name] = value
            boxCalculator(name, this.parameters)
        },
        'confirm': function() {
            /* this.$validator.validate().then(
                (result) => {
                    if (result) { */
                        this.relionStart()
            /*        }
                }
            ) */
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
            var validationErrors
            this.$store.commit('loading', false)
            try {
                validationErrors = JSON.parse(jqXHR.responseText).message
            } catch (error) {
                validationErrors = null
            }
            if (Array.isArray(validationErrors) && validationErrors.length > 0) {
                // I can't get vee-validate to display custom messages :(
                // validationErrors.forEach((error) => {
                //     this.errors.add(error)
                // })
                // This will have to do for a substitute for now
                const message = validationErrors.map(function (error) {
                    return error.field + ' - ' + error.message
                }).join('...\n')
                this.$store.commit('notifications/addNotification', {
                    'title': 'Errors',
                    'message': message,
                    'level': 'error'
                })
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
