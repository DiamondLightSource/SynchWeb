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
      @extra-puck="onExtraPuckToggle"
    />

    <div>
      <validation-provider
        class="tw-py-1 tw-flex tw-w-full"
        tag="div"
        :name="`Sample ${sampleLocation + 1} Protein`"
        :vid="`sample ${sampleLocation + 1} protein`"
        :rules="inputValue[sampleLocation]['NAME'] ? 'required|min_value:1' : ''">
      <div class="tw-w-1/5">Protein</div>
      <combo-box
        class="tw-w-48"
        :data="proteinsOptionsList"
        textField="text"
        valueField="value"
        :inputIndex="sampleLocation"
        :selectCount="inputValue[sampleLocation].length"
        defaultText=""
        size="small"
        v-model="inputValue[sampleLocation]['PROTEINID']"
      >
        <template slot-scope="{ option }">
          <span class="tw-flex tw-justify-between tw-w-full">
            <span class="tw-"><i v-if="option.SAFETYLEVEL == 'GREEN'" class="fa fa-check green"></i></span>
            {{ option['text'] }}
          </span>
        </template>
      </combo-box>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-py-1"
        :rules="inputValue[sampleLocation]['PROTEINID'] > -1 ? 'required|alpha_dash|max:12' : ''"
        :name="`Sample ${sampleLocation + 1} Abundance`"
        :vid="`sample ${sampleLocation + 1} abundance`"
        v-slot="{ errors }">
        <base-input-text
          inputClass="tw-w-48 tw-h-8"
          outerClass="tw-w-full tw-flex"
          :quiet="true"
          labelClass="tw-w-1/5"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          v-model="inputValue[sampleLocation]['ABUNDANCE']"
          label="Abundance"
        />
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-py-1"
        :rules="inputValue[sampleLocation]['PROTEINID'] > -1 ? 'required|alpha_dash|max:12' : ''"
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
          v-model="inputValue[sampleLocation]['NAME']"/>
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
          :quiet="true"
          v-model="inputValue[sampleLocation]['SPACEGROUP']"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
        />
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-py-1"
        :rules="`required_if:sample ${sampleLocation + 1} screening method,best`"
        :name="`Sample ${sampleLocation + 1} Group`"
        :vid="`sample ${sampleLocation + 1} group`"
        v-slot="{ errors }">
        <base-input-select
          :options="sampleGroups"
          optionValueKey="value"
          optionTextKey="text"
          inputClass="tw-w-48 tw-h-8"
          outerClass="tw-w-full tw-flex"
          labelClass="tw-w-1/5"
          label="Sample Group"
          :quiet="true"
          v-model="inputValue[sampleLocation]['SAMPLEGROUP']"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          :errorMessage="errors[0]"
        />
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-py-1"
        :rules="inputValue[sampleLocation]['PROTEINID'] > -1 ? 'required' : ''"
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
          v-model="inputValue[sampleLocation]['ANOMALOUSSCATTERER']"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
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
          v-model="inputValue[sampleLocation]['COMMENTS']"
        />
      </validation-provider>

      <div v-show="currentTab === 'extraFields'" class="tw-w-full">
        <div class="tw-flex tw-w-full tw-py-1">
          <div class="tw-w-1/5">Cells</div>
          <div class="tw-w-4/5">
            <table-component
              class="tw-w-full"
              :headers="sampleCellsHeader"
              :data=[inputValue[sampleLocation]]
            >
              <template slot="content" slot-scope="{ row }">
                <validation-provider tag="td" class="tw-px-1" v-slot="{ errors }" :name="`Sample ${sampleLocation + 1} CELL-A`" :vid="`sample ${sampleLocation + 1} cell-a`">
                  <base-input-text
                    :quiet="true"
                    inputClass="tw-w-12 tw-h-8"
                    :errorMessage="errors[0]"
                    :errorClass="errors[0] ? 'ferror' : ''"
                    v-model="inputValue[sampleLocation]['CELL_A']"
                  />
                </validation-provider>

                <validation-provider tag="td" class="tw-px-1"  v-slot="{ errors }" :name="`Sample ${sampleLocation + 1} CELL-B`" :vid="`sample ${sampleLocation + 1} cell-b`">
                  <base-input-text
                    :quiet="true"
                    inputClass="tw-w-12 tw-h-8"
                    :errorMessage="errors[0]"
                    :errorClass="errors[0] ? 'ferror' : ''"
                    v-model="inputValue[sampleLocation]['CELL_B']"
                  />
                </validation-provider>

                <validation-provider tag="td" class="tw-px-1" v-slot="{ errors }" :name="`Sample ${sampleLocation + 1} CELL-C`" :vid="`sample ${sampleLocation + 1} cell-c`">
                  <base-input-text
                    v-on="$listeners"
                    inputClass="tw-w-12 tw-h-8"
                    :errorMessage="errors[0]"
                    :quiet="true"
                    :errorClass="errors[0] ? 'ferror' : ''"
                    v-model="inputValue[sampleLocation]['CELL_C']"
                  />
                </validation-provider>

                <validation-provider tag="td" class="tw-px-1" v-slot="{ errors }" :name="`Sample ${sampleLocation + 1} CELL-ALPHA`" :vid="`sample ${sampleLocation + 1} cell-alpha`">
                  <base-input-text
                    v-on="$listeners"
                    inputClass="tw-w-12 tw-h-8"
                    :quiet="true"
                    :errorMessage="errors[0]"
                    :errorClass="errors[0] ? 'ferror' : ''"
                    v-model="inputValue[sampleLocation]['CELL_ALPHA']"
                  />
                </validation-provider>

                <validation-provider tag="td" class="tw-px-1" :name="`Sample ${sampleLocation + 1} CELL-BETA`" :vid="`sample ${sampleLocation + 1} cell-beta`"v-slot="{ errors }">
                  <base-input-text
                    v-on="$listeners"
                    inputClass="tw-w-12 tw-h-8"
                    :errorMessage="errors[0]"
                    v-model="inputValue[sampleLocation]['CELL_BETA']"
                    :errorClass="errors[0] ? 'ferror' : ''"
                    :quiet="true"
                  />
                </validation-provider>

                <validation-provider tag="td" class="tw-px-1" :name="`Sample ${sampleLocation + 1} CELL-GAMMA`" :vid="`sample ${sampleLocation + 1} cell-gamma`" v-slot="{ errors }">
                  <base-input-text
                    v-on="$listeners"
                    inputClass="tw-w-12 tw-h-8"
                    :errorMessage="errors[0]"
                    :errorClass="errors[0] ? 'ferror' : ''"
                    v-model="inputValue[sampleLocation]['CELL_GAMMA']"
                    :quiet="true"
                  />
                </validation-provider>
              </template>
            </table-component>
          </div>
        </div>

        <validation-provider
          tag="div"
          class="tw-py-1"
          :rules="inputValue[sampleLocation]['PROTEINID'] > -1 ? 'required' : ''"
          :name="`Sample ${sampleLocation + 1} Experiment Kind`"
          :vid="`sample ${sampleLocation + 1} experiment kind`"
          v-slot="{ errors }">
          <base-input-select
            :is-disabled="!allowUDC"
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
            v-model="inputValue[sampleLocation]['EXPERIMENTKIND']"
          />
        </validation-provider>

        <validation-provider
          tag="div"
          class="tw-py-1"
          :name="`Sample ${sampleLocation + 1} Energy`"
          :rules="`required_if:sample ${sampleLocation + 1} experiment kind,SAD|numeric`"
          :vid="`sample ${sampleLocation + 1} energy`"
          v-slot="{ errors }">
          <base-input-text
            :disabled="inputValue[sampleLocation]['EXPERIMENTKIND'] !== 'SAD'"
            inputClass="tw-w-16 tw-h-8"
            outerClass="tw-w-full tw-flex"
            labelClass="tw-w-1/5"
            type="number"
            :quiet="true"
            label="Energy"
            :errorMessage="errors[0]"
            :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
            v-model="inputValue[sampleLocation]['ENERGY']"
          />
        </validation-provider>

        <validation-provider
          tag="div"
          class="tw-py-1"
          :rules="inputValue[sampleLocation]['PROTEINID'] > -1 ? 'required' : ''"
          :name="`Sample ${sampleLocation + 1} Centering Method`"
          :vid="`sample ${sampleLocation + 1} centering method`"
          v-slot="{ errors }">
          <base-input-select
            :is-disabled="!allowUDC"
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
            v-model="inputValue[sampleLocation]['CENTRINGMETHOD']"
          />
        </validation-provider>

        <validation-provider
          tag="div"
          class="tw-py-1"
          :rules="inputValue[sampleLocation]['PROTEINID'] > -1 ? 'required' : ''"
          :name="`Sample ${sampleLocation + 1} Screening Method`"
          :vid="`sample ${sampleLocation + 1} screening method`"
          v-slot="{ errors }">
          <base-input-select
            :is-disabled="!allowUDC"
            :options="screeningMethodList"
            optionValueKey="value"
            optionTextKey="text"
            inputClass="tw-w-48 tw-h-8"
            outerClass="tw-w-full tw-flex"
            labelClass="tw-w-1/5"
            label="Screening Method"
            :errorMessage="errors[0]"
            :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
            v-model="inputValue[sampleLocation]['SCREENINGMETHOD']"
          />
        </validation-provider>

        <validation-provider
          tag="div"
          class="tw-py-1"
          :rules="`required_if:sample ${sampleLocation + 1} screening method,none`"
          :name="`Sample ${sampleLocation + 1} Required Resolution`"
          :vid="`sample ${sampleLocation + 1} required resolution`"
          v-slot="{ errors }">
          <base-input-text
            :disabled="inputValue[sampleLocation]['SCREENINGMETHOD'] !== 'none' || !allowUDC"
            inputClass="tw-w-16 tw-h-8"
            outerClass="tw-w-full tw-flex"
            labelClass="tw-w-1/5"
            type="number"
            label="Required Resolution"
            :errorMessage="errors[0]"
            :quiet="true"
            :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
            v-model="inputValue[sampleLocation]['SCREENINGMETHOD']"
          />
        </validation-provider>

        <validation-provider
          tag="div"
          class="tw-py-1"
          :name="`Sample ${sampleLocation + 1} Minimum Resolution`"
          :rules="`required_if:sample ${sampleLocation + 1} screening method,all`"
          :vid="`sample ${sampleLocation + 1} minimum resolution`"
          v-slot="{ errors }">
          <base-input-text
            :disabled="inputValue[sampleLocation]['SCREENINGMETHOD'] !== 'all' || !allowUDC"
            inputClass="tw-w-16 tw-h-8"
            outerClass="tw-w-full tw-flex"
            labelClass="tw-w-1/5"
            type="number"
            label="Minimum Resolution"
            :quiet="true"
            :errorMessage="errors[0]"
            :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
            v-model="inputValue[sampleLocation]['MINIMUMRESOLUTION']"
          />
        </validation-provider>

        <validation-provider
          tag="div"
          class="tw-py-1"
          :name="`Sample ${sampleLocation + 1} No to Collect`"
          :rules="`required_if:sample ${sampleLocation + 1} screening method,best`"
          :vid="`sample ${sampleLocation + 1} no to collect`"
          v-slot="{ errors }">
          <base-input-text
            :disabled="inputValue[sampleLocation]['SCREENINGMETHOD'] !== 'best' || !allowUDC"
            inputClass="tw-w-16 tw-h-8"
            outerClass="tw-w-full tw-flex"
            labelClass="tw-w-1/5"
            label="No to Collect"
            type="number"
            :quiet="true"
            :errorMessage="errors[0]"
            :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
            v-model="inputValue[sampleLocation]['NOTOCOLLECT']"
          />
        </validation-provider>
      </div>
    
      <div v-if="containerId">
        <button v-if="inputValue[sampleLocation].BLSAMPLEID" class="button submit" @click="onSaveSample">Save Sample</button>
        <button v-else class="button submit" @click="onSaveSample">Add Sample</button>
      </div>

    </div>
  </div>
</template>

<script>


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
      ]
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
    onSaveSample: function() {
      let location = this.sampleLocation + 1
      let containerId = this.inputValue[sampleLocation][this.sampleLocation].CONTAINERID
      if (!containerId) this.inputValue[sampleLocation][this.sampleLocation].CONTAINERID = this.containerId

      this.$emit('save-sample', location)
    },
    onExtraPuckToggle(value) {
      this.currentTab = value ? 'extraFields' : ''
    }
	}
}
</script>
