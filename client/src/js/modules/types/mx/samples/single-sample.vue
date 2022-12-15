<template>
  <div class="content">
    <h1>Sample Location {{ sampleLocation + 1 }}</h1>

    <!-- Only allow clone operations when creating the puck/plate -->
    <plate-sample-controls
      v-if="!containerId"
      :extra="true"
      @clone-container="onClonePlate"
      @clone-container-column="onCloneContainerColumn"
      @clone-container-row="onCloneContainerRow"
      @clear-container="onClearPlate"
      @clear-container-column="onClearContainerColumn"
      @clear-container-row="onClearContainerRow"
      @clear-container-sample="onClearSample"
      @extra-puck="onExtraPuckToggle"
    />

    <div>
      <validation-provider
        class="tw-py-1 tw-flex tw-w-full"
        tag="div"
        :name="`Sample ${sampleLocation + 1} Protein`"
        :vid="`sample ${sampleLocation + 1} protein`"
        :rules="sample['NAME'] && !containerId ? 'required' : ''"
      >
        <div class="tw-w-1/5">
          Protein
        </div>
        <combo-box
          v-if="canEditRow(sample['LOCATION'], editingRow)"
          v-model="PROTEINID"
          class="tw-w-48 protein-select"
          :data="proteinsOptionsList"
          text-field="ACRONYM"
          value-field="PROTEINID"
          :input-index="sampleLocation"
          default-text=""
          size="small"
          :exclude-element-class-list="['custom-add']"
        >
          <template #default="{ option }">
            <span class="tw-flex tw-justify-between tw-w-full">
              <span class="tw-"><i
                v-if="option.SAFETYLEVEL === 'GREEN'"
                class="fa fa-check green"
              /></span>
              {{ option['ACRONYM'] }}
            </span>
          </template>
        </combo-box>
        <div
          v-else
          class="tw-text-center"
        >
          {{ sample['ACRONYM'] }}
        </div>
        <span>{{ errors[0] }}</span>
      </validation-provider>

      <validation-provider
        v-slot="{ errors }"
        tag="div"
        class="tw-py-1"
        :rules="sample['PROTEINID'] > -1 && !containerId ? 'required|alpha_dash|max:20' : ''"
        :name="`Sample ${sampleLocation + 1} Name`"
        :vid="`sample ${sampleLocation + 1} name`"
      >
        <base-input-text
          v-model="NAME"
          input-class="tw-w-48 tw-h-8"
          outer-class="tw-w-full tw-flex"
          label-class="tw-w-1/5"
          label="Sample Name"
          :quiet="true"
          :error-message="errors[0]"
          :error-class="errors[0] ? 'tw-text-xxs ferror' : ''"
        />
      </validation-provider>

      <validation-provider
        v-slot="{ errors }"
        tag="div"
        class="tw-py-1"
        :name="`Sample ${sampleLocation + 1} Abundance`"
        :vid="`sample ${sampleLocation + 1} abundance`"
      >
        <base-input-text
          v-model="ABUNDANCE"
          input-class="tw-w-48 tw-h-8 single-sample-input"
          outer-class="tw-w-full tw-flex"
          :quiet="true"
          type="number"
          label-class="tw-w-1/5"
          :error-message="errors[0]"
          :error-class="errors[0] ? 'tw-text-xxs ferror' : ''"
          label="Abundance"
        />
      </validation-provider>

      <validation-provider
        v-slot="{ errors }"
        tag="div"
        class="tw-py-1"
        :name="`Sample ${sampleLocation + 1} Space Group`"
        :vid="`sample ${sampleLocation + 1} spacegroup`"
      >
        <base-input-select
          v-model="SPACEGROUP"
          :options="spaceGroupList"
          option-value-key="value"
          option-text-key="text"
          input-class="tw-w-48 tw-h-8"
          outer-class="tw-w-full tw-flex"
          label-class="tw-w-1/5"
          label="Space Group"
        />
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-py-1"
        name="Comment"
      >
        <base-input-text
          v-model="COMMENTS"
          input-class="tw-w-48 tw-h-8"
          outer-class="tw-w-full tw-flex"
          label-class="tw-w-1/5"
          label="Comment"
        />
      </validation-provider>

      <div
        v-show="currentTab === 'extraFields'"
        class="tw-w-full"
      >
        <base-input-select
          v-model="ANOMALOUSSCATTERER"
          :options="anomalousOptionsList"
          input-class="tw-w-48 tw-h-8"
          outer-class="tw-w-full tw-flex"
          label-class="tw-w-1/5"
          label="Anomalous Scattering"
          option-value-key="value"
          option-text-key="text"
          :error-message="errors[0]"
          :quiet="true"
          :error-class="errors[0] ? 'tw-text-xxs ferror' : ''"
        />

        <validation-provider
          v-slot="{ errors }"
          tag="div"
          class="tw-py-1"
          :rules="sample['PROTEINID'] > -1 ? 'positive_decimal:4' : ''"
          :name="`Sample ${sampleLocation + 1} Required Resolution`"
          :vid="`sample ${sampleLocation + 1} required resolution`"
        >
          <base-input-text
            v-model="REQUIREDRESOLUTION"
            input-class="tw-w-16 tw-h-8 single-sample-input"
            outer-class="tw-w-full tw-flex"
            label-class="tw-w-1/5"
            type="number"
            :step="1"
            label="Required Resolution"
            :error-message="errors[0]"
            :quiet="true"
            :error-class="errors[0] ? 'tw-text-xxs ferror' : ''"
          />
        </validation-provider>

        <div class="tw-flex tw-w-full tw-py-1">
          <div class="tw-w-1/5">
            Unit Cell
          </div>
          <div class="tw-w-4/5">
            <table-component
              class="tw-w-full"
              :headers="sampleCellsHeader"
              :data="[sample]"
            >
              <template
                slot="content"
                slot-scope="{ row }"
              >
                <validation-provider
                  v-slot="{ errors }"
                  tag="td"
                  class="tw-px-1"
                  :rules="sample['PROTEINID'] > -1 ? 'decimal:2' : ''"
                  :name="`Sample ${sampleLocation + 1} CELL-A`"
                  :vid="`sample ${sampleLocation + 1} cell-a`"
                >
                  <base-input-text
                    v-model="CELL_A"
                    :quiet="true"
                    input-class="tw-w-12 tw-h-8 single-sample-input"
                    type="number"
                    :step="0.01"
                    :error-message="errors[0]"
                    :error-class="errors[0] ? 'ferror' : ''"
                  />
                </validation-provider>

                <validation-provider
                  v-slot="{ errors }"
                  tag="td"
                  class="tw-px-1"
                  :rules="sample['PROTEINID'] > -1 ? 'decimal:2' : ''"
                  :name="`Sample ${sampleLocation + 1} CELL-B`"
                  :vid="`sample ${sampleLocation + 1} cell-b`"
                >
                  <base-input-text
                    v-model="CELL_B"
                    :quiet="true"
                    input-class="tw-w-12 tw-h-8 single-sample-input"
                    :error-message="errors[0]"
                    type="number"
                    :step="0.01"
                    :error-class="errors[0] ? 'ferror' : ''"
                  />
                </validation-provider>

                <validation-provider
                  v-slot="{ errors }"
                  tag="td"
                  class="tw-px-1"
                  :rules="sample['PROTEINID'] > -1 ? 'decimal:2' : ''"
                  :name="`Sample ${sampleLocation + 1} CELL-C`"
                  :vid="`sample ${sampleLocation + 1} cell-c`"
                >
                  <base-input-text
                    v-model="CELL_C"
                    input-class="tw-w-12 tw-h-8 single-sample-input"
                    :error-message="errors[0]"
                    type="number"
                    :step="0.01"
                    :quiet="true"
                    :error-class="errors[0] ? 'ferror' : ''"
                    v-on="$listeners"
                  />
                </validation-provider>

                <validation-provider
                  v-slot="{ errors }"
                  tag="td"
                  class="tw-px-1"
                  :rules="sample['PROTEINID'] > -1 ? 'decimal:2' : ''"
                  :name="`Sample ${sampleLocation + 1} CELL-ALPHA`"
                  :vid="`sample ${sampleLocation + 1} cell-alpha`"
                >
                  <base-input-text
                    v-model="CELL_ALPHA"
                    input-class="tw-w-12 tw-h-8 single-sample-input"
                    :quiet="true"
                    type="number"
                    :step="0.01"
                    :error-message="errors[0]"
                    :error-class="errors[0] ? 'ferror' : ''"
                    v-on="$listeners"
                  />
                </validation-provider>

                <validation-provider
                  v-slot="{ errors }"
                  tag="td"
                  class="tw-px-1"
                  :rules="sample['PROTEINID'] > -1 ? 'decimal:2' : ''"
                  :name="`Sample ${sampleLocation + 1} CELL-BETA`"
                  :vid="`sample ${sampleLocation + 1} cell-beta`"
                >
                  <base-input-text
                    v-model="CELL_BETA"
                    input-class="tw-w-12 tw-h-8 single-sample-input"
                    type="number"
                    :step="0.01"
                    :error-message="errors[0]"
                    :error-class="errors[0] ? 'ferror' : ''"
                    :quiet="true"
                    v-on="$listeners"
                  />
                </validation-provider>

                <validation-provider
                  v-slot="{ errors }"
                  tag="td"
                  class="tw-px-1"
                  :rules="sample['PROTEINID'] > -1 ? 'decimal:2' : ''"
                  :name="`Sample ${sampleLocation + 1} CELL-GAMMA`"
                  :vid="`sample ${sampleLocation + 1} cell-gamma`"
                >
                  <base-input-text
                    v-model="CELL_GAMMA"
                    input-class="tw-w-12 tw-h-8 single-sample-input"
                    type="number"
                    :step="0.01"
                    :error-message="errors[0]"
                    :error-class="errors[0] ? 'ferror' : ''"
                    :quiet="true"
                    v-on="$listeners"
                  />
                </validation-provider>
              </template>
            </table-component>
          </div>
        </div>
      </div>

      <div class="">
        <p class="tw-mb-2">
          Components
        </p>
        <div class="tw-w-full tw-flex">
          <p class="tw-w-1/5 tw-text-xxs">
            Add:
          </p>
          <combo-box
            v-if="canEditRow(sample['LOCATION'], editingRow)"
            v-model="newComponentId"
            class="tw-w-48 protein-select tw-mr-2"
            :data="globalProteins"
            text-field="ACRONYM"
            value-field="PROTEINID"
            :input-index="sampleLocation"
            default-text=""
            size="small"
            :exclude-element-class-list="['custom-add']"
            :can-create-new-item="false"
          >
            <template #default="{ option }">
              <span class="tw-flex tw-justify-between tw-w-full">
                <span class="tw-"><i
                  v-if="option.SAFETYLEVEL === 'GREEN'"
                  class="fa fa-check green"
                /></span>
                {{ option['ACRONYM'] }}
              </span>
            </template>
          </combo-box>
          <div v-if="COMPONENTS.length > 0">
            <sample-component-view
              v-for="(component, componentIndex) in COMPONENTS"
              :key="componentIndex"
              :acronym="component['ACRONYM']"
              :concentration-type="component['CONCENTRATIONTYPE']"
              :crystal-id="sample['CRYSTALID']"
              :abundance="component['ABUNDANCE']"
              :editable="true"
              :edit-inline="false"
              :is-new-sample="false"
              :is-global-protein="true"
              :protein-id="component['PROTEINID']"
              :collection="sampleComponents"
              @update-protein-abundance="updateProteinAbundance"
              @remove-sample-components="removeProteinFromComponent"
            />
          </div>
          <div
            v-else
            class="tw-flex tw-items-center"
          >
            <p>No Components</p>
          </div>
        </div>
      </div>
    
      <div v-if="containerId">
        <button
          v-if="sample.BLSAMPLEID"
          class="button submit"
          @click="$emit('save-sample', sampleLocation)"
        >
          Save Sample
        </button>
        <button
          v-else
          class="button submit"
          @click="$emit('save-sample', sampleLocation)"
        >
          Add Sample
        </button>
      </div>
    </div>

    <screen-component-group
      class="tw-w-1/2 tw-mb-5 tw-mt-3"
      :global-proteins="globalProteins"
      :screen-components="sampleScreenComponentGroup.POSITION ? screenComponents : []"
      :screen-component-group="sampleScreenComponentGroup"
      :editable="false"
      :can-save="false"
      @add-component-to-group="addScreenComponentToGroup"
    />
  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import { map } from 'lodash-es'
import BaseInputText from 'app/components/base-input-text.vue'
import BaseInputSelect from 'app/components/base-input-select.vue'
import BaseInputTextArea from 'app/components/base-input-textarea.vue'
import ComboBox from 'app/components/combo-box.vue'
import Table from 'app/components/table.vue'
import ScreenComponentGroup from 'modules/imaging/views/screen-component-group.vue'

import PlateSampleControls from 'modules/types/mx/samples/plate-sample-controls.vue'
import SampleTableMixin from 'modules/types/mx/samples/sample-table-mixin.js'

import { ValidationProvider }  from 'vee-validate'
import SampleComponentView from 'modules/samples/views/sample-component-view.vue'

export default {
  name: 'SingleSampleDefault',
  components: {
    'screen-component-group': ScreenComponentGroup,
    'sample-component-view': SampleComponentView,
    'base-input-select': BaseInputSelect,
    'base-input-text': BaseInputText,
    'base-input-textarea': BaseInputTextArea,
    'validation-provider': ValidationProvider,
		'plate-sample-controls': PlateSampleControls,
    'combo-box': ComboBox,
    'table-component': Table
  },
	mixins: [SampleTableMixin],
  data() {
    return {
      currentTab: '',
      sampleCellsHeader: [
        { key: 'CELL_A', title: 'A' },
        { key: 'CELL_B', title: 'B' },
        { key: 'CELL_C', title: 'C' },
        { key: 'CELL_ALPHA', title: 'α' },
        { key: 'CELL_BETA', title: 'β' },
        { key: 'CELL_GAMMA', title: 'γ' },
      ],
      selectedProteinComponent: null,
      newComponentId: '',
    }
  },
  created() {
    if (this.containerId) {
      this.onExtraPuckToggle(true)
    }
  },
	methods: {
    onClonePlate: function() {
      this.$emit('clone-container', 0)
    },
    onClearPlate: function() {
      this.$emit('clear-container')
    },
    onClearSample: function() {
      this.$emit('clear-sample', +this.sampleLocation)
    },
    onCloneContainerColumn: function() {
      let location = this.sampleLocation + 1
      this.$emit('clone-container-column', location)
    },
    onCloneContainerRow: function() {
      let location = this.sampleLocation + 1
      this.$emit('clone-container-row', location)
    },
    onExtraPuckToggle(value) {
      this.currentTab = value ? 'extraFields' : ''
    },
    onClearContainerColumn() {
      this.$emit('clear-container-column', this.sampleLocation)
    },
    onClearContainerRow() {
      this.$emit('clear-container-row', this.sampleLocation)
    },
    updateProteinAbundance({ proteinId, abundance}) {
      console.log(this.COMPONENTS)
      const index = this.COMPONENTS.findIndex(protein => +protein['PROTEINID'] === +proteinId)
      if (index > -1) {
        const components = this.COMPONENTS.map(protein => {
          if (+protein['PROTEINID'] === +proteinId) {
            protein.ABUNDANCE = +abundance
          }

          return protein
        })

        console.log(components)

        this.$store.commit('samples/updateSamplesField', {
          path: `samples/${this.sampleIndex}/COMPONENTS`,
          value: components
        })

      }
    },
    removeProteinFromComponent(proteinId) {
      const updatedProteinsComponent = this.COMPONENTS.filter(protein => Number(protein['PROTEINID']) !== +proteinId)

      this.$store.commit('samples/updateSamplesField', {
        path: `samples/${this.sampleIndex}/COMPONENTS`,
        value: updatedProteinsComponent
      })
    },
    getProteinId(protein) {
      return Number(protein['PROTEINID'])
    },
    getAbundance(protein) {
      return Number(protein['ABUNDANCE'])
    },
    setComponentIdsAndAmounts() {
      const componentIds = map(this.COMPONENTS, this.getProteinId)
      const componentAbundance = map(this.COMPONENTS, this.getAbundance)

      this.$store.commit('samples/updateSamplesField', {
        path: `samples/${this.sampleIndex}/COMPONENTIDS`,
        value: componentIds
      })

      this.$store.commit('samples/updateSamplesField', {
        path: `samples/${this.sampleIndex}/COMPONENTAMOUNTS`,
        value: componentAbundance
      })
    },
    addScreenComponentToGroup() {},
    generateSampleScreenComponent() {
      if (this.plateType === 'plate') {
        const selectedSample = this.samples[this.sampleLocation]
        const wellLocation = this.containerTypeDetails.getWell(selectedSample['LOCATION'])
        const screenComponentGroup = this.screenComponentGroups.find(group => Number(group['POSITION']) === Number(wellLocation) + 1)
        if (screenComponentGroup) {
          this.sampleScreenComponentGroup = screenComponentGroup
        }
      }
    }
  },
  computed: {
    ...mapGetters({
      samples: ['samples/samples']
    }),
    sample() {
      return this.$store.getters['samples/getSingleSampleItem'](this.sampleLocation)
    },
    sampleIndex() {
      return this.sampleLocation
    },
    sampleComponents() {
      return this.sample['COMPONENTS']
    },
  },
  watch: {
    newComponentId: {
      handler(newValue) {
        if (newValue) {
          this.newComponentId = ''
          const value = Number(newValue)

          const addedProteinIds = map(this.COMPONENTS, this.getProteinId)
          if (addedProteinIds.includes(value)) return

          const components = this.COMPONENTS
          const assignedProtein = this.globalProteins.find(protein => Number(protein['PROTEINID']) === value)
          components.push({ ...assignedProtein, ABUNDANCE: '' })

          this.$store.commit('samples/updateSamplesField', {
            path: `samples/${this.sampleIndex}/COMPONENTS`,
            value: components
          })
        }
      }
    },
    COMPONENTS: {
      deep: true,
      handler: 'setComponentIdsAndAmounts'
    },
    sampleIndex: {
      immediate: true,
      handler: 'generateSampleScreenComponent'
    }
  }
}
</script>
<style scoped>
/* Chrome, Safari, Edge, Opera */
:deep() input.single-sample-input[type=number]::-webkit-outer-spin-button,
:deep() input.single-sample-input[type=number]::-webkit-inner-spin-button{
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
:deep() input.single-sample-input[type=number] {
  -moz-appearance: textfield;
}

:deep() input.single-sample-input[type="number"]:disabled {
  @apply tw-bg-content-dark-background
}

:deep() .sample-group-select .items-list, :deep() .protein-select .items-list {
  height: 100px;
  overflow-y: auto;
}
</style>
