<template>
  <dialog-form
    title="Relion Processing"
    confirm-label="Process"
    schema-url="relion/schema"
    :post-url="postUrl"
    :show-dialog="visible"
    @update="update"
    @posted="success"
    @cancel="$store.commit('em/cancelProcessingDialog')"
  >
    <template #default="form">
      <div class="dialog-form-section">
        <h3 class="dialog-form-section-heading">
          Project
        </h3>

        <schema-input
          v-for="name in inputs.project"
          :key="name"
          :name="name"
          :form="form"
        />
      </div>

      <div class="dialog-form-section">
        <h3 class="dialog-form-section-heading">
          Experiment
        </h3>

        <schema-input
          v-for="name in inputs.experiment"
          :key="name"
          :name="name"
          :form="form"
        />
      </div>

      <div>
        <schema-input
          name="stop_after_ctf_estimation"
          :form="form"
          extra-class="dialog-form-section"
        />

        <div class="dialog-form">
          <div class="dialog-form-section">
            <h3 class="dialog-form-section-heading">
              2D &amp; 3D Classification
            </h3>

            <schema-input
              v-for="name in inputs.classification"
              :key="name"
              :name="name"
              :form="form"
            />
          </div>

          <div class="dialog-form-section">
            <h3 class="dialog-form-section-heading">
              Particle Picking
            </h3>

            <schema-input
              v-for="name in inputs.picking"
              :key="name"
              :name="name"
              :form="form"
              :disabled="wantCalculate(form.fields.wantCalculate, name)"
            />
          </div>

          <div class="dialog-form-section">
            <h3 class="dialog-form-section-heading">
              Second Pass
            </h3>

            <schema-input
              v-for="name in inputs.secondPass"
              :key="name"
              :name="name"
              :form="form"
            />
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
import SchemaInput from 'modules/types/em/components/schema-input.vue'

export default {
    'name': 'RelionDialog',
    'components': {
        'dialog-form': DialogForm,
        'schema-input': SchemaInput,
    },
    'props': {
        'dataCollection': {
            'type': Object,
            'required': true,
        },
    },
    'data': function () {
        return {
            'inputs': {
                'project': [
                    'acquisition_software',
                    'import_images_dir',
                    'import_images_ext',
                    'wantGainReferenceFile',
                    'motioncor_gainreference',
                ],
                'experiment': [
                    'voltage',
                    'Cs',
                    'ctffind_do_phaseshift',
                    'angpix',
                    'eer_grouping',
                    'motioncor_binning',
                    'motioncor_doseperframe',
                ],
                'classification': [
                    'do_class2d',
                    'do_class3d',
                    'use_fsc_criterion',
                ],
                'picking': [
                    'autopick_do_cryolo',
                    'autopick_LoG_diam_min',
                    'autopick_LoG_diam_max',
                    'mask_diameter',
                    'extract_boxsize',
                    'extract_small_boxsize',
                    'wantCalculate',
                ],
                'secondPass': [
                    'want2ndPass',
                    'do_class2d_pass2',
                    'do_class3d_pass2',
                ],
            },
        }
    },
    'computed': {
        ...mapGetters({
            'visible': 'em/processingDialogVisible',
            'previousParameters': 'em/processingPreviousParameters',
        }),
        'postUrl': function () {
            return 'relion/start/' + this.dataCollection.id
        },
    },
    'methods': {
        'wantCalculate': function(wantCalculate, fieldName) {
            return [
                'mask_diameter',
                'extract_boxsize',
                'extract_small_boxsize',
            ].includes (fieldName) && wantCalculate
        },
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
