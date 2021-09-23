<template>
  <dialog-form
    title="Relion Processing"
    confirm-label="Process"
    schema-url="relion/schema"
    :post-url="postUrl"
    :show-dialog="processingDialogVisible"
    @update="update"
    @posted="success"
    @cancel="$store.commit('em/cancelProcessingDialog')"
  >
    <template #default="form">
      <div class="dialog-form-section">
        <h3 class="dialog-form-section-heading">
          Project
        </h3>

        <input-select
          name="acquisition_software"
          :form="form"
        />

        <input-select
          name="import_images_dir"
          :form="form"
          :help-text="['select from list']"
        />

        <input-text
          name="import_images_dir"
          :form="form"
          :help-text="['or enter your own']"
        />

        <input-select
          name="import_images_ext"
          :form="form"
        />

        <!-- "Gain Reference File" default: false -->
        <input-checkbox
          name="wantGainReferenceFile"
          :form="form"
        />

        <input-text
          v-if="form.fields.wantGainReferenceFile"
          name="motioncor_gainreference"
          :form="form"
        />
      </div>

      <div class="dialog-form-section">
        <h3 class="dialog-form-section-heading">
          Experiment
        </h3>

        <input-select
          name="voltage"
          :form="form"
        />

        <input-select
          name="Cs"
          :form="form"
        />

        <input-checkbox
          name="ctffind_do_phaseshift"
          :form="form"
        />

        <input-text
          name="angpix"
          :form="form"
        />

        <input-text
          v-if="form.fields.import_images_ext == 'eer'"
          name="eer_grouping"
          :form="form"
        />

        <input-select
          name="motioncor_binning"
          :form="form"
        />

        <input-text
          name="motioncor_doseperframe"
          :form="form"
        />
      </div>

      <div>
        <input-checkbox
          name="stop_after_ctf_estimation"
          extra-class="dialog-form-section"
          :form="form"
        />

        <div class="dialog-form">
          <div class="dialog-form-section">
            <h3 class="dialog-form-section-heading">
              2D &amp; 3D Classification
            </h3>

            <div v-if="!form.fields.stop_after_ctf_estimation">
              <input-checkbox
                name="do_class2d"
                :form="form"
              />

              <input-checkbox
                name="do_class3d"
                :form="form"
              />
            </div>
          </div>

          <div class="dialog-form-section">
            <h3 class="dialog-form-section-heading">
              Particle Picking
            </h3>

            <div v-if="!form.fields.stop_after_ctf_estimation">
              <input-checkbox
                name="autopick_do_cryolo"
                :form="form"
              />

              <input-text
                name="autopick_LoG_diam_min"
                :form="form"
              />

              <input-text
                name="autopick_LoG_diam_max"
                :form="form"
              />

              <input-text
                name="mask_diameter"
                :form="form"
                :disabled="form.fields.wantCalculate"
              />

              <input-text
                name="extract_boxsize"
                :form="form"
                :disabled="form.fields.wantCalculate"
              />

              <input-text
                name="extract_small_boxsize"
                :form="form"
                :disabled="form.fields.wantCalculate"
              />

              <input-checkbox
                name="wantCalculate"
                :form="form"
              />
            </div>
          </div>

          <div class="dialog-form-section">
            <h3 class="dialog-form-section-heading">
              Second Pass
            </h3>

            <div v-if="!form.fields.stop_after_ctf_estimation">
              <input-checkbox
                name="want2ndPass"
                :form="form"
              />

              <template v-if="form.fields.want2ndPass">
                <input-checkbox
                  name="do_class2d_pass2"
                  :form="form"
                />

                <input-checkbox
                  name="do_class3d_pass2"
                  :form="form"
                />
              </template>
            </div>
          </div>
        </div>
      </div>
    </template>
  </dialog-form>
</template>

<script>
import { mapGetters } from 'vuex'
import boxCalculator from 'modules/types/em/relion/box-calculator'
import DialogForm from 'modules/types/em/components/dialog-form.vue'
import InputCheckbox from 'modules/types/em/components/input-checkbox.vue'
import InputSelect from 'modules/types/em/components/input-select.vue'
import InputText from 'modules/types/em/components/input-text.vue'

export default {
    'name': 'RelionDialog',
    'components': {
        'dialog-form': DialogForm,
        'input-checkbox': InputCheckbox,
        'input-select': InputSelect,
        'input-text': InputText,
    },
    'computed': {
        ...mapGetters('em', ['processingDialogVisible']),
        ...mapGetters('proposal', ['currentVisit']),
        'postUrl': function () {
            return 'relion/start/' + this.currentVisit
        },
    },
    'methods': {
        'update': function({name, fields}) {
            boxCalculator(name, fields)
        },
        // eslint-disable-next-line no-unused-vars
        'success': function(response) {
            this.$store.commit('em/cancelProcessingDialog', null)
            this.$store.commit('notifications/addNotification', {
                'title': 'Job submitted',
                'message': 'Processing Job submitted OK.',
                'level': 'success'
            })
        },
    },
}
</script>
