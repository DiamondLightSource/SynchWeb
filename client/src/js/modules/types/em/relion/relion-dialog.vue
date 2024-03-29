<template>
  <dialog-schema-form
    title="Relion Processing"
    confirm-label="Process"
    schema-url="relion/schema"
    :post-url="postUrl"
    :show-dialog="visible"
    :defaults="computedDefaults"
    @update="update"
    @posted="success"
    @cancel="$store.commit('em/processing/cancelDialog')"
  >
    <template #default="form">
      <dialog-schema-form-section heading="Experiment">
        <schema-input
          v-for="name in inputs.experiment"
          :key="name"
          :name="name"
          :form="form"
        />
      </dialog-schema-form-section>

      <div>
        <dialog-schema-form-section>
          <schema-input
            name="stop_after_ctf_estimation"
            :form="form"
            extra-class="dialog-form-section"
          />
        </dialog-schema-form-section>

        <div style="display: flex;">
          <dialog-schema-form-section heading="2D &amp; 3D Classification">
            <schema-input
              v-for="name in inputs.classification"
              :key="name"
              :name="name"
              :form="form"
            />
          </dialog-schema-form-section>

          <dialog-schema-form-section heading="Particle Picking">
            <schema-input
              v-for="name in inputs.picking"
              :key="name"
              :name="name"
              :form="form"
              :disabled="disableCalculated(form.fields.wantCalculate, name)"
            />
          </dialog-schema-form-section>

          <dialog-schema-form-section heading="Second Pass">
            <schema-input
              v-for="name in inputs.secondPass"
              :key="name"
              :name="name"
              :form="form"
            />
          </dialog-schema-form-section>
        </div>
      </div>
    </template>
  </dialog-schema-form>
</template>

<script>
import { mapGetters } from 'vuex'
import boxCalculator from 'modules/types/em/relion/box-calculator'
import DialogSchemaForm from 'modules/types/em/components/dialog-schema-form.vue'
import DialogSchemaFormSection from 'modules/types/em/components/dialog-schema-form-section.vue'
import SchemaInput from 'modules/types/em/components/schema-input.vue'

export default {
    'name': 'RelionDialog',
    'components': {
        'dialog-schema-form': DialogSchemaForm,
        'dialog-schema-form-section': DialogSchemaFormSection,
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
                'experiment': [
                    'wantGainReferenceFile',
                    'motioncor_gainreference',
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
            'visible': 'em/processing/dialogVisible',
            'defaultParameters': 'em/processing/defaultParameters',
        }),
        'postUrl': function () {
            return 'relion/start/' + this.dataCollection.dataCollectionId
        },
        'computedDefaults': function() {
            if (this.defaultParameters !== null) {
                return Object.assign({}, this.defaultParameters, {
                    'wantCalculate': false,
                })
            }
            return {
                'voltage': this.dataCollection.voltage,
                // 'Cs' is only a single value at this point in time,
                'ctffind_do_phaseshift': this.dataCollection.phasePlate > 0,
                'angpix': this.dataCollection.pixelSizeOnImage,
                'motioncor_doseperframe': this.dataCollection.frameDose,
                'wantCalculate': true,
            }
        },
    },
    'methods': {
        'disableCalculated': function(wantCalculate, fieldName) {
            return wantCalculate && [
                'mask_diameter',
                'extract_boxsize',
                'extract_small_boxsize',
            ].includes (fieldName)
        },
        'update': function({name, fields}) {
            boxCalculator(name, fields)
        },
        // eslint-disable-next-line no-unused-vars
        'success': function(response) {
            this.$store.commit('em/processing/cancelDialog', null)
            this.$store.commit('notifications/addNotification', {
                'title': 'Job submitted',
                'message': 'Processing Job submitted OK.',
                'level': 'success'
            })
        },
    },
}
</script>
