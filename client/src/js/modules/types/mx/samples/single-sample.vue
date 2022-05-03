<template>
  <div class="content">
    <h1>Sample Location {{ sampleLocation + 1 }}</h1>

    <!-- Only allow clone operations when creating the puck/plate -->
    <plate-sample-controls
      v-if="!containerId"
      :extra="true"
      @clone-container="onClonePlate"
      @clear-container="onClearPlate"
      @clear-container-sample="onClearSample"
      @clone-container-column="onCloneContainerColumn"
      @clone-container-row="onCloneContainerRow"
      @clear-container-column="onClearContainerColumn"
      @clear-container-row="onClearContainerRow"
      @extra-puck="onExtraPuckToggle"
    />

    <div>
      <validation-provider
        class="tw-py-1 tw-flex tw-w-full"
        tag="div"
        :name="`Sample ${sampleLocation + 1} Protein`"
        :vid="`sample ${sampleLocation + 1} protein`"
        :rules="sample['NAME'] && !containerId ? 'required' : ''">
        <div class="tw-w-1/5">Protein</div>
        <combo-box
          v-if="canEditRow(sample['LOCATION'], editingRow)"
          class="tw-w-48 protein-select"
          :data="proteinsOptionsList"
          textField="ACRONYM"
          valueField="PROTEINID"
          :inputIndex="sampleLocation"
          defaultText=""
          size="small"
          v-model="PROTEINID"
          :exclude-element-class-list="['custom-add']"
        >
          <template v-slot:default="{ option }">
            <span class="tw-flex tw-justify-between tw-w-full">
              <span class="tw-"><i v-if="option.SAFETYLEVEL === 'GREEN'" class="fa fa-check green"></i></span>
              {{ option['ACRONYM'] }}
            </span>
          </template>
        </combo-box>
        <div v-else class="tw-text-center">{{ sample['ACRONYM'] }}</div>
        <span>{{ errors[0] }}</span>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-py-1"
        :name="`Sample ${sampleLocation + 1} Abundance`"
        :vid="`sample ${sampleLocation + 1} abundance`"
        v-slot="{ errors }">
        <base-input-text
          inputClass="tw-w-48 tw-h-8 single-sample-input"
          outerClass="tw-w-full tw-flex"
          :quiet="true"
          type="number"
          labelClass="tw-w-1/5"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          label="Abundance"
          v-model="ABUNDANCE"
        />
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-py-1"
        :rules="sample['PROTEINID'] > -1 && !containerId ? 'required|alpha_dash|max:20' : ''"
        :name="`Sample ${sampleLocation + 1} Name`"
        :vid="`sample ${sampleLocation + 1} name`"
        v-slot="{ errors }">
        <base-input-text
          inputClass="tw-w-48 tw-h-8"
          outerClass="tw-w-full tw-flex"
          labelClass="tw-w-1/5"
          label="Sample Name"
          :quiet="true"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          v-model="NAME"
        />
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-py-1"
        :name="`Sample ${sampleLocation + 1} Space Group`"
        :vid="`sample ${sampleLocation + 1} spacegroup`"
        v-slot="{ errors }">
        <base-input-select
          :options="spaceGroupList"
          optionValueKey="value"
          optionTextKey="text"
          inputClass="tw-w-48 tw-h-8"
          outerClass="tw-w-full tw-flex"
          labelClass="tw-w-1/5"
          label="Space Group"
          v-model="SPACEGROUP"
        />
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-py-1"
        name="Comment">
        <base-input-text
          inputClass="tw-w-48 tw-h-8"
          outerClass="tw-w-full tw-flex"
          labelClass="tw-w-1/5"
          label="Comment"
          v-model="COMMENTS"
        />
      </validation-provider>

      <div v-show="currentTab === 'extraFields'" class="tw-w-full">
        <base-input-select
          :options="anomalousOptionsList"
          inputClass="tw-w-48 tw-h-8"
          outerClass="tw-w-full tw-flex"
          labelClass="tw-w-1/5"
          label="Anomalous Scattering"
          optionValueKey="value"
          optionTextKey="text"
          :errorMessage="errors[0]"
          :quiet="true"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          v-model="ANOMALOUSSCATTERER"
        />

        <validation-provider
          tag="div"
          class="tw-py-1"
          :rules="sample['PROTEINID'] > -1 ? 'positive_decimal:4' : ''"
          :name="`Sample ${sampleLocation + 1} Required Resolution`"
          :vid="`sample ${sampleLocation + 1} required resolution`"
          v-slot="{ errors }">
          <base-input-text
            inputClass="tw-w-16 tw-h-8 single-sample-input"
            outerClass="tw-w-full tw-flex"
            labelClass="tw-w-1/5"
            type="number"
            :step="1"
            label="Required Resolution"
            :errorMessage="errors[0]"
            :quiet="true"
            :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
            v-model="REQUIREDRESOLUTION"
          />
        </validation-provider>

        <div class="tw-flex tw-w-full tw-py-1">
          <div class="tw-w-1/5">Unit Cell</div>
          <div class="tw-w-4/5">
            <table-component
              class="tw-w-full"
              :headers="sampleCellsHeader"
              :data=[sample]
            >
              <template slot="content" slot-scope="{ row }">
                <validation-provider
                  tag="td"
                  class="tw-px-1"
                  v-slot="{ errors }"
                  :rules="sample['PROTEINID'] > -1 ? 'decimal:2' : ''"
                  :name="`Sample ${sampleLocation + 1} CELL-A`"
                  :vid="`sample ${sampleLocation + 1} cell-a`">
                  <base-input-text
                    :quiet="true"
                    inputClass="tw-w-12 tw-h-8 single-sample-input"
                    type="number"
                    :step="0.01"
                    :errorMessage="errors[0]"
                    :errorClass="errors[0] ? 'ferror' : ''"
                    v-model="CELL_A"
                  />
                </validation-provider>

                <validation-provider
                  tag="td"
                  class="tw-px-1"
                  v-slot="{ errors }"
                  :rules="sample['PROTEINID'] > -1 ? 'decimal:2' : ''"
                  :name="`Sample ${sampleLocation + 1} CELL-B`"
                  :vid="`sample ${sampleLocation + 1} cell-b`">
                  <base-input-text
                    :quiet="true"
                    inputClass="tw-w-12 tw-h-8 single-sample-input"
                    :errorMessage="errors[0]"
                    type="number"
                    :step="0.01"
                    :errorClass="errors[0] ? 'ferror' : ''"
                    v-model="CELL_B"
                  />
                </validation-provider>

                <validation-provider
                  tag="td"
                  class="tw-px-1"
                  v-slot="{ errors }"
                  :rules="sample['PROTEINID'] > -1 ? 'decimal:2' : ''"
                  :name="`Sample ${sampleLocation + 1} CELL-C`"
                  :vid="`sample ${sampleLocation + 1} cell-c`">
                  <base-input-text
                    v-on="$listeners"
                    inputClass="tw-w-12 tw-h-8 single-sample-input"
                    :errorMessage="errors[0]"
                    type="number"
                    :step="0.01"
                    :quiet="true"
                    :errorClass="errors[0] ? 'ferror' : ''"
                    v-model="CELL_C"
                  />
                </validation-provider>

                <validation-provider
                  tag="td"
                  class="tw-px-1"
                  v-slot="{ errors }"
                  :rules="sample['PROTEINID'] > -1 ? 'decimal:2' : ''"
                  :name="`Sample ${sampleLocation + 1} CELL-ALPHA`"
                  :vid="`sample ${sampleLocation + 1} cell-alpha`">
                  <base-input-text
                    v-on="$listeners"
                    inputClass="tw-w-12 tw-h-8 single-sample-input"
                    :quiet="true"
                    type="number"
                    :step="0.01"
                    :errorMessage="errors[0]"
                    :errorClass="errors[0] ? 'ferror' : ''"
                    v-model="CELL_ALPHA"
                  />
                </validation-provider>

                <validation-provider
                  tag="td"
                  class="tw-px-1"
                  :rules="sample['PROTEINID'] > -1 ? 'decimal:2' : ''"
                  :name="`Sample ${sampleLocation + 1} CELL-BETA`"
                  :vid="`sample ${sampleLocation + 1} cell-beta`"
                  v-slot="{ errors }">
                  <base-input-text
                    v-on="$listeners"
                    inputClass="tw-w-12 tw-h-8 single-sample-input"
                    type="number"
                    :step="0.01"
                    :errorMessage="errors[0]"
                    :errorClass="errors[0] ? 'ferror' : ''"
                    :quiet="true"
                    v-model="CELL_BETA"
                  />
                </validation-provider>

                <validation-provider
                  tag="td"
                  class="tw-px-1"
                  :rules="sample['PROTEINID'] > -1 ? 'decimal:2' : ''"
                  :name="`Sample ${sampleLocation + 1} CELL-GAMMA`"
                  :vid="`sample ${sampleLocation + 1} cell-gamma`"
                  v-slot="{ errors }">
                  <base-input-text
                    v-on="$listeners"
                    inputClass="tw-w-12 tw-h-8 single-sample-input"
                    type="number"
                    :step="0.01"
                    :errorMessage="errors[0]"
                    :errorClass="errors[0] ? 'ferror' : ''"
                    :quiet="true"
                    v-model="CELL_GAMMA"
                  />
                </validation-provider>
              </template>
            </table-component>
          </div>
        </div>
      </div>

      <div class="">
        <p class="tw-mb-2">Components</p>
        <div class="tw-w-full tw-flex">
          <p class="tw-w-1/5 tw-text-xxs">Add:</p>
          <combo-box
            v-if="canEditRow(sample['LOCATION'], editingRow)"
            class="tw-w-48 protein-select tw-mr-2"
            :data="globalProteins"
            textField="ACRONYM"
            valueField="PROTEINID"
            :inputIndex="sampleLocation"
            defaultText=""
            size="small"
            v-model="newComponentId"
            :exclude-element-class-list="['custom-add']"
            :can-create-new-item="false">
            <template v-slot:default="{ option }">
              <span class="tw-flex tw-justify-between tw-w-full">
                <span class="tw-"><i v-if="option.SAFETYLEVEL === 'GREEN'" class="fa fa-check green"></i></span>
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
          <div v-else class="tw-flex tw-items-center"><p>No Components</p></div>
        </div>
      </div>
    
      <div v-if="containerId">
        <button v-if="sample.BLSAMPLEID" class="button submit" @click="$emit('save-sample', sampleLocation)">Save Sample</button>
        <button v-else class="button submit" @click="$emit('save-sample', sampleLocation)">Add Sample</button>
      </div>

    </div>
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

import PlateSampleControls from 'modules/types/mx/samples/plate-sample-controls.vue'
import SampleTableMixin from 'modules/types/mx/samples/sample-table-mixin.js'

import { ValidationProvider }  from 'vee-validate'
import SampleComponentView from 'modules/samples/views/sample-component-view.vue'

export default {
  name: 'single-sample-default',
	mixins: [SampleTableMixin],
  components: {
    SampleComponentView,
    'base-input-select': BaseInputSelect,
    'base-input-text': BaseInputText,
    'base-input-textarea': BaseInputTextArea,
    'validation-provider': ValidationProvider,
		'plate-sample-controls': PlateSampleControls,
    'combo-box': ComboBox,
    'table-component': Table
  },
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
      this.$emit('clone-container', this.sampleLocation)
    },
    onClearPlate: function() {
      this.$emit('clear-container')
    },
    onClearSample: function() {
      let location = this.sampleLocation + 1

      this.$emit('clear-sample', location)
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
    onClearContainerColumn() {},
    onClearContainerRow() {},
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
    }
  }
}
</script>
<style scoped>
/* Chrome, Safari, Edge, Opera */
>>> input.single-sample-input[type=number]::-webkit-outer-spin-button,
>>> input.single-sample-input[type=number]::-webkit-inner-spin-button{
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
>>> input.single-sample-input[type=number] {
  -moz-appearance: textfield;
}

>>> input.single-sample-input[type="number"]:disabled {
  @apply tw-bg-content-dark-background
}

>>> .sample-group-select .items-list, >>> .protein-select .items-list {
  height: 100px;
  overflow-y: auto;
}
</style>
