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
        :rules="inputValue[sampleLocation]['NAME'] ? 'required|min_value:1' : ''" name="Protein Acronym"
        :vid="`protein-${inputValue[sampleLocation]['LOCATION']}`">
      <div class="tw-w-1/5">Protein</div>
      <combo-box
        class="tw-w-48"
        :data="proteinsOptionsList"
        textField="text"
        :inputIndex="sampleLocation"
        :selectCount="inputValue[sampleLocation].length"
        :selectedItem="formatSelectData(proteinsOptionsList, inputValue[sampleLocation], 'PROTEINID')"
        defaultText=""
        size="small"
        valueField="value"
        v-on:handle-select-event="handleProteinSelection(sampleLocation, $event)"
      >
        <template slot-scope="{ option }">
          <span><i class="fa fa-check green"></i></span> {{ option['text'] }}
        </template>
      </combo-box>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-py-1"
        :rules="inputValue[sampleLocation]['PROTEINID'] > -1 ? 'required|alpha_dash|max:12' : ''"
        name="Abundance"
        :vid="`abundance-${inputValue[sampleLocation]['LOCATION']}`"
        v-slot="{ errors }">
        <base-input-text
          inputClass="tw-w-48 tw-h-8"
          outerClass="tw-w-full tw-flex"
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
        name="Sample Name"
        :vid="`sample-name-${inputValue[sampleLocation]['LOCATION']}`"
        v-slot="{ errors }">
        <base-input-text
          inputClass="tw-w-48 tw-h-8"
          outerClass="tw-w-full tw-flex"
          labelClass="tw-w-1/5"
          label="Sample Name"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          v-model="inputValue[sampleLocation]['NAME']"/>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-py-1"
        name="Space Group"
        :rules="inputValue[sampleLocation]['PROTEINID'] > -1 ? 'required' : ''"
        :vid="`spacegroup-${sampleLocation}`"
        v-slot="{ errors }">
        <base-input-select
          :options="spaceGroupList"
          optionValueKey="value"
          optionTextKey="text"
          inputClass="tw-w-48 tw-h-8"
          outerClass="tw-w-full tw-flex"
          labelClass="tw-w-1/5"
          label="Space Group"
          v-model="inputValue[sampleLocation]['SPACEGROUP']"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
        />
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-py-1"
        :rules="inputValue[sampleLocation]['PROTEINID'] > -1 ? 'required' : ''"
        name="Sample Group"
        :vid="`sample-group-${inputValue[sampleLocation]['BLSAMPLEGROUPID']}`"
        v-slot="{ errors }">
        <base-input-select
          :options="sampleGroups"
          optionValueKey="value"
          optionTextKey="text"
          inputClass="tw-w-48 tw-h-8"
          outerClass="tw-w-full tw-flex"
          labelClass="tw-w-1/5"
          label="Sample Group"
          v-model="inputValue[sampleLocation]['BLSAMPLEGROUPID']"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          :errorMessage="errors[0]"
        />
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-py-1"
        :rules="inputValue[sampleLocation]['PROTEINID'] > -1 ? 'required' : ''"
        name="Anomalous Scaterrer"
        :vid="`anomalous-${sampleLocation}`"
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
                <validation-provider tag="td" class="tw-px-1" name="CELL A" :rules="row['PROTEINID'] > -1 ? 'required' : ''" :vid="`cell-a-${sampleLocation}`" v-slot="{ errors }">
                  <base-input-text
                    :quiet="true"
                    inputClass="tw-w-12 tw-h-8"
                    :errorMessage="errors[0]"
                    :errorClass="errors[0] ? 'ferror' : ''"
                    v-model="inputValue[sampleLocation]['CELL_A']"
                  />
                </validation-provider>

                <validation-provider tag="td" class="tw-px-1" name="CELL A" :rules="row['PROTEINID'] > -1 ? 'required' : ''" :vid="`cell-a-${sampleLocation}`" v-slot="{ errors }">
                  <base-input-text
                    :quiet="true"
                    inputClass="tw-w-12 tw-h-8"
                    :errorMessage="errors[0]"
                    :errorClass="errors[0] ? 'ferror' : ''"
                    v-model="inputValue[sampleLocation]['CELL_B']"
                  />
                </validation-provider>

                <validation-provider tag="td" class="tw-px-1" name="CELL C" :rules="row['PROTEINID'] > -1 ? 'required' : ''" :vid="`cell-c-${sampleLocation}`" v-slot="{ errors }">
                  <base-input-text
                    v-on="$listeners"
                    inputClass="tw-w-12 tw-h-8"
                    :errorMessage="errors[0]"
                    :quiet="true"
                    :errorClass="errors[0] ? 'ferror' : ''"
                    v-model="inputValue[sampleLocation]['CELL_C']"
                  />
                </validation-provider>

                <validation-provider tag="td" class="tw-px-1" name="CELL ALPHA" :rules="row['PROTEINID'] > -1 ? 'required' : ''" :vid="`cell-d-${sampleLocation}`" v-slot="{ errors }">
                  <base-input-text
                    v-on="$listeners"
                    inputClass="tw-w-12 tw-h-8"
                    :quiet="true"
                    :errorMessage="errors[0]"
                    :errorClass="errors[0] ? 'ferror' : ''"
                    v-model="inputValue[sampleLocation]['CELL_ALPHA']"
                  />
                </validation-provider>

                <validation-provider tag="td" class="tw-px-1" name="CELL BETA" :rules="row['PROTEINID'] > -1 ? 'required' : ''" :vid="`cell-e-${sampleLocation}`" v-slot="{ errors }">
                  <base-input-text
                    v-on="$listeners"
                    inputClass="tw-w-12 tw-h-8"
                    :errorMessage="errors[0]"
                    v-model="inputValue[sampleLocation]['CELL_BETA']"
                    :errorClass="errors[0] ? 'ferror' : ''"
                    :quiet="true"
                  />
                </validation-provider>

                <validation-provider tag="td" class="tw-px-1" name="CELL GAMMA" :rules="row['PROTEINID'] > -1 ? 'required' : ''" :vid="`cell-e-${sampleLocation}`" v-slot="{ errors }">
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
          name="Experiment Kind"
          :rules="inputValue[sampleLocation]['PROTEINID'] > -1 ? 'required' : ''"
          :vid="`experiment-kind-${sampleLocation}`"
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
            :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
            v-model="inputValue[sampleLocation]['EXPERIMENTKIND']"
          />
        </validation-provider>

        <validation-provider
          tag="div"
          class="tw-py-1"
          name="Energy"
          :rules="inputValue[sampleLocation]['PROTEINID'] > -1 && inputValue[sampleLocation]['EXPERIMENTKIND'] === 'phasing' ? 'required|numeric' : ''"
          :vid="`energy-${sampleLocation}`"
          v-slot="{ errors }">
          <base-input-text
            :disabled="inputValue[sampleLocation]['EXPERIMENTKIND'] !== 'phasing'"
            inputClass="tw-w-16 tw-h-8"
            outerClass="tw-w-full tw-flex"
            labelClass="tw-w-1/5"
            type="number"
            label="Energy"
            :errorMessage="errors[0]"
            :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
            v-model="inputValue[sampleLocation]['ENERGY']"
          />
        </validation-provider>

        <validation-provider
          tag="div"
          class="tw-py-1"
          name="Centering Method"
          :rules="inputValue[sampleLocation]['PROTEINID'] > -1 ? 'required' : ''"
          :vid="`centering-method-${sampleLocation}`"
          v-slot="{ errors }">
          <base-input-select
            :options="centeringMethodList"
            optionValueKey="value"
            optionTextKey="text"
            inputClass="tw-w-48 tw-h-8"
            outerClass="tw-w-full tw-flex"
            labelClass="tw-w-1/5"
            label="Centering Method"
            :errorMessage="errors[0]"
            :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
            v-model="inputValue[sampleLocation]['CENTERINGMETHOD']"
          />
        </validation-provider>

        <validation-provider
          tag="div"
          class="tw-py-1"
          name="Screening Method"
          :rules="inputValue[sampleLocation]['PROTEINID'] > -1 ? 'required' : ''"
          :vid="`screening-method-${sampleLocation}`"
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
            v-model="inputValue[sampleLocation]['SCREENINGMETHOD']"
          />
        </validation-provider>

        <validation-provider
          tag="div"
          class="tw-py-1"
          name="Required Resolution"
          :rules="inputValue[sampleLocation]['PROTEINID'] > -1 && inputValue[sampleLocation]['SCREENINGMETHOD'] === 'None' ? 'required' : ''"
          :vid="`required-resolution-${sampleLocation}`"
          v-slot="{ errors }">
          <base-input-text
            :disabled="inputValue[sampleLocation]['SCREENINGMETHOD'] !== 'None'"
            inputClass="tw-w-16 tw-h-8"
            outerClass="tw-w-full tw-flex"
            labelClass="tw-w-1/5"
            type="number"
            label="Required Resolution"
            :errorMessage="errors[0]"
            :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
            v-model="inputValue[sampleLocation]['SCREENINGMETHOD']"
          />
        </validation-provider>

        <validation-provider
          tag="div"
          class="tw-py-1"
          name="Minimum Resolution"
          :rules="inputValue[sampleLocation]['PROTEINID'] > -1 && inputValue[sampleLocation]['SCREENINGMETHOD'] === 'Better Than' ? 'required' : ''"
          :vid="`minimum-resolution-${sampleLocation}`"
          v-slot="{ errors }">
          <base-input-text
            :disabled="inputValue[sampleLocation]['SCREENINGMETHOD'] !== 'Better Than'"
            inputClass="tw-w-16 tw-h-8"
            outerClass="tw-w-full tw-flex"
            labelClass="tw-w-1/5"
            type="number"
            label="Minimum Resolution"
            :errorMessage="errors[0]"
            :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
            v-model="inputValue[sampleLocation]['MINIMUMRESOLUTION']"
          />
        </validation-provider>

        <validation-provider
          tag="div"
          class="tw-py-1"
          name="No to Collect"
          :rules="inputValue[sampleLocation]['PROTEINID'] > -1 && inputValue[sampleLocation]['SCREENINGMETHOD'] === 'Collect Best N' ? 'required' : ''"
          :vid="`no-to-collect-${sampleLocation}`"
          v-slot="{ errors }">
          <base-input-text
            :disabled="inputValue[sampleLocation]['SCREENINGMETHOD'] !== 'Better Than'"
            inputClass="tw-w-16 tw-h-8"
            outerClass="tw-w-full tw-flex"
            labelClass="tw-w-1/5"
            label="No to Collect"
            type="number"
            :errorMessage="errors[0]"
            :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
            v-model="inputValue[sampleLocation]['NOTOCOLLECT']"
          />
        </validation-provider>
      </div>
    
      <div v-if="containerId">
        <button v-if="inputValue[sampleLocation][sampleLocation].BLSAMPLEID" class="button submit" @click="onSaveSample">Save Sample</button>
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

import PlateSampleControls from 'modules/types/saxs/samples/plate-sample-controls.vue'
import SampleTableMixin from 'modules/types/mx/samples/sample-table-mixin.js'

import { ValidationProvider }  from 'vee-validate'

export default {
  name: 'single-sample-default',
	mixins: [SampleTableMixin],
  props: {
    sampleLocation: {
      type: Number
    }
  },
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