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
          v-if="!containerId || (!sample['BLSAMPLEID'] && editingRow === sample['LOCATION'])"
          class="tw-w-48 protein-select"
          :data="proteinsOptionsList"
          textField="text"
          valueField="value"
          :inputIndex="sampleLocation"
          :excludeElementClassList="excludedElementClassList"
          defaultText=""
          size="small"
          v-model="PROTEINID"
        >
          <template slot-scope="{ option }">
            <span class="tw-flex tw-justify-between tw-w-full">
              <span class="tw-"><i v-if="option.SAFETYLEVEL === 'GREEN'" class="fa fa-check green"></i></span>
              {{ option['text'] }}
            </span>
          </template>
        </combo-box>
        <div v-else class="tw-text-center">{{ selectDataValue(proteinsOptionsList, sample, 'PROTEINID') }}</div>
        <span>{{ errors[0] }}</span>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-py-1"
        :rules="sample['PROTEINID'] > -1 && !containerId ? 'required' : ''"
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
        class="tw-py-1 tw-flex tw-w-full"
        :rules="`required_if:sample ${sampleLocation + 1} screening method,best`"
        :name="`Sample ${sampleLocation + 1} Group`"
        :vid="`sample ${sampleLocation + 1} group`"
        v-slot="{ errors }">
        <div class="tw-w-1/5">Sample Group</div>
        <combo-box
          :data="sampleGroups"
          class="sample-group-select tw-w-48"
          textField="text"
          valueField="value"
          :inputIndex="sampleIndex"
          :defaultText="SAMPLEGROUP"
          size="small"
          :excludeElementClassList="excludedElementClassList"
          v-model="SAMPLEGROUP">
          <template slot="custom-add">
            <div class="tw-w-full add-sample-group">
              <base-input-text
                v-model="SAMPLEGROUP"
                placeholder-text="create new sample group"
                input-class="tw-w-full tw-h-8"
                :quiet="true"/>
            </div>
          </template>
        </combo-box>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-py-1"
        :rules="sample['PROTEINID'] > -1 && !containerId ? 'required' : ''"
        :name="`Sample ${sampleLocation + 1} Anomalous Scatterer`"
        :vid="`sample ${sampleLocation + 1} anomalous scatterer`"
        v-slot="{ errors }">
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
        <div class="tw-flex tw-w-full tw-py-1">
          <div class="tw-w-1/5">Cells</div>
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

        <validation-provider
          tag="div"
          class="tw-py-1"
          :rules="sample['PROTEINID'] > -1 && queueForUDC ? 'required' : ''"
          :name="`Sample ${sampleLocation + 1} Experiment Kind`"
          :vid="`sample ${sampleLocation + 1} experiment kind`"
          v-slot="{ errors }">
          <base-input-select
            :options="experimentKindList"
            inputClass="tw-w-48 tw-h-8"
            outerClass="tw-w-full tw-flex"
            labelClass="tw-w-1/5"
            label="Experiment Kind"
            optionValueKey="value"
            optionTextKey="text"
            :errorMessage="errors[0]"
            :quiet="true"
            :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
            v-model="EXPERIMENTKIND"
          />
        </validation-provider>

        <validation-provider
          tag="div"
          class="tw-py-1"
          :name="`Sample ${sampleLocation + 1} Energy`"
          :rules="sample['PROTEINID'] > -1 && queueForUDC ? `required_if:sample ${sampleLocation + 1} experiment kind,SAD|numeric` : ''"
          :vid="`sample ${sampleLocation + 1} energy`"
          v-slot="{ errors }">
          <base-input-text
            inputClass="tw-w-16 tw-h-8 single-sample-input"
            outerClass="tw-w-full tw-flex"
            labelClass="tw-w-1/5"
            type="number"
            :step="1"
            :quiet="true"
            label="Energy"
            :errorMessage="errors[0]"
            :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
            v-model="ENERGY"
          />
        </validation-provider>

        <validation-provider
          tag="div"
          class="tw-py-1"
          :rules="sample['PROTEINID'] > -1 && queueForUDC ? 'required' : ''"
          :name="`Sample ${sampleLocation + 1} Centering Method`"
          :vid="`sample ${sampleLocation + 1} centering method`"
          v-slot="{ errors }">
          <base-input-select
            :options="centeringMethodList"
            optionValueKey="value"
            optionTextKey="text"
            inputClass="tw-w-48 tw-h-8"
            outerClass="tw-w-full tw-flex"
            labelClass="tw-w-1/5"
            label="Centering Method"
            :quiet="true"
            :errorMessage="errors[0]"
            :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
            v-model="CENTRINGMETHOD"
          />
        </validation-provider>

        <validation-provider
          tag="div"
          class="tw-py-1"
          :rules="sample['PROTEINID'] > -1 && queueForUDC ? 'required' : ''"
          :name="`Sample ${sampleLocation + 1} Screening Method`"
          :vid="`sample ${sampleLocation + 1} screening method`"
          v-slot="{ errors }">
          <base-input-select
            :options="screeningMethodList"
            optionValueKey="value"
            optionTextKey="text"
            inputClass="tw-w-48 tw-h-8"
            outerClass="tw-w-full tw-flex"
            labelClass="tw-w-1/5"
            label="Screening Method"
            :errorMessage="errors[0]"
            :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
            v-model="SCREENINGMETHOD"
          />
        </validation-provider>

        <validation-provider
          tag="div"
          class="tw-py-1"
          :rules="sample['PROTEINID'] > -1 ? `required_if:sample ${sampleLocation + 1} screening method,none|positive_decimal:4` : ''"
          :name="`Sample ${sampleLocation + 1} Required Resolution`"
          :vid="`sample ${sampleLocation + 1} required resolution`"
          v-slot="{ errors }">
          <base-input-text
            :disabled="sample['SCREENINGMETHOD'] !== 'none'"
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

        <validation-provider
          tag="div"
          class="tw-py-1"
          :name="`Sample ${sampleLocation + 1} Minimum Resolution`"
          :rules="sample['PROTEINID'] > - 1 ? `required_if:sample ${sampleLocation + 1} screening method,all|positive_decimal:4`: ''"
          :vid="`sample ${sampleLocation + 1} minimum resolution`"
          v-slot="{ errors }">
          <base-input-text
            :disabled="sample['SCREENINGMETHOD'] !== 'all'"
            inputClass="tw-w-16 tw-h-8 single-sample-input"
            outerClass="tw-w-full tw-flex"
            labelClass="tw-w-1/5"
            type="number"
            label="Minimum Resolution"
            :quiet="true"
            :step="1"
            :errorMessage="errors[0]"
            :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
            v-model="MINIMUMRESOLUTION"
          />
        </validation-provider>

        <validation-provider
          tag="div"
          class="tw-py-1"
          :name="`Sample ${sampleLocation + 1} No to Collect`"
          :rules="sample['PROTEINID'] > -1 ? `required_if:sample ${sampleLocation + 1} screening method,best|numeric`: ''"
          :vid="`sample ${sampleLocation + 1} no to collect`"
          v-slot="{ errors }">
          <base-input-text
            :disabled="sample['SCREENINGMETHOD'] !== 'best'"
            inputClass="tw-w-16 tw-h-8 single-sample-input"
            outerClass="tw-w-full tw-flex"
            labelClass="tw-w-1/5"
            label="No to Collect"
            type="number"
            :step="1"
            :quiet="true"
            :errorMessage="errors[0]"
            :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
            v-model="SCREENINGCOLLECTVALUE"
          />
        </validation-provider>
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
import BaseInputText from 'app/components/base-input-text.vue'
import BaseInputSelect from 'app/components/base-input-select.vue'
import BaseInputTextArea from 'app/components/base-input-textarea.vue'
import BaseInputCheckbox from 'app/components/base-input-checkbox.vue'
import ComboBox from 'app/components/combo-box.vue'
import Table from 'app/components/table.vue'

import PlateSampleControls from 'modules/types/mx/samples/plate-sample-controls.vue'
import SampleTableMixin from 'modules/types/mx/samples/sample-table-mixin.js'

import { ValidationProvider }  from 'vee-validate'

export default {
  name: 'single-sample-default',
	mixins: [SampleTableMixin],
  components: {
    'base-input-select': BaseInputSelect,
    'base-input-text': BaseInputText,
    'base-input-textarea': BaseInputTextArea,
    'base-input-checkbox': BaseInputCheckbox,
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
      excludedElementClassList: ['add-sample-group']
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
    onClearContainerRow() {
    }
  },
  computed: {
    sample() {
      return this.$store.getters['samples/getSingleSampleItem'](this.sampleLocation)
    },
    sampleIndex() {
      return this.sampleLocation
    },
    ...mapGetters({
      samples: ['samples/samples']
    }),
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
