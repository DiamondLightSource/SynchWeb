<template>
  <div
    class="tw-flex tw-w-full tw-items-center"
     :class="{
      'tw-bg-table-body-background': sampleIndex % 2 === 0,
      'tw-bg-table-body-background-odd': sampleIndex % 2 === 1
    }">
    <div class="location-column tw-text-center tw-py-1">{{ sample.LOCATION || sampleIndex + 1 }}</div>

    <validation-provider
      class="tw-px-2 protein-column tw-py-1"
      tag="div"
      :rules="sample['NAME'] && !containerId ? 'required' : ''"
      :name="`Sample ${sampleIndex + 1} Protein`"
      :vid="`sample ${sampleIndex + 1} protein`"
      v-slot="{ errors }">
      <combo-box
        v-if="!containerId || (!sample['BLSAMPLEID'] && editingRow === sample['LOCATION'])"
        :data="proteinsOptionsList"
        class="tw-w-full protein-select"
        textField="text"
        valueField="value"
        :inputIndex="sampleIndex"
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
      class="name-column tw-py-1 tw-px-2"
      :rules="sample['PROTEINID'] > -1 && !containerId ? 'required|alpha_dash|max:20|' : ''"
      :name="`Sample ${sampleIndex + 1} Name`"
      :vid="`sample ${sampleIndex + 1} name`"
      v-slot="{ errors }">
      <base-input-text
        v-if="!containerId || (!sample['BLSAMPLEID'] && editingRow === sample['LOCATION'])"
        inputClass="tw-w-full tw-h-8"
        v-model="NAME"
        :errorMessage="errors[0]"
        :quiet="true"
        :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
      />
      <p v-else class="tw-text-center">{{ sample['NAME'] }}</p>
    </validation-provider>

    <validation-provider
      tag="div"
      class="tw-px-2 sample-group-column tw-py-1"
      :rules="`required_if:sample ${sampleIndex + 1} screening method,best`"
      :name="`Sample Group Sample ${sampleIndex + 1}`"
      :vid="`sample group sample ${sampleIndex + 1}`"
      v-slot="{ errors }">
      <combo-box
        v-if="!containerId || (!sample['BLSAMPLEID'] && editingRow === sample['LOCATION'])"
        :data="sampleGroups"
        textField="text"
        valueField="value"
        :inputIndex="sampleIndex"
        :defaultText="SAMPLEGROUP"
        class="sample-group-select tw-w-44"
        size="small"
        @handle-search-text="handleSampleGroupSearchInput"
        v-model="SAMPLEGROUP">
      </combo-box>
      <div v-else class="tw-text-center">{{ sampleGroupName }}</div>
    </validation-provider>

    <tabbed-columns
      class="tw-w-1/2 tw-py-1 tw-border-l tw-border-table-header-background min-height-8"
      :currentEditingRow="editingRow"
      :sample="sample"
      :currentTab="currentTab"
      :sampleIndex="sampleIndex"
      :containerId="containerId"
    />

    <div class="actions-column tw-py-1 tw-text-right">
      <span v-if="containerId">
        <span v-if="editingRow === sample['LOCATION']">
          <a class="button tw-cursor-pointer  " @click="$emit('save-sample', sampleIndex)"><i class="fa fa-check"></i></a>
          <a class="button tw-cursor-pointer tw-mx-1" @click="closeSampleEditing"><i class="fa fa-times"></i></a>
        </span>
        <span v-else>
          <a class="button tw-cursor-pointer tw-mx-1" @click="editRow(sample)"><i class="fa fa-pencil"></i></a>
          <router-link v-if="sample['BLSAMPLEID']" class="button tw-mx-1" :to="`/samples/sid/${sample['BLSAMPLEID']}`" ><i class="fa fa-search"></i></router-link>
          <a class="button tw-cursor-pointer tw-mx-1" v-if="sample['BLSAMPLEID']" @click="onAddToSampleGroup"><i class="fa fa-cubes"></i></a>
        </span>
      </span>
      <span v-else>
        <a class="button tw-mx-1" href="" @click.prevent="$emit('clone-sample', sampleIndex)"><i class="fa fa-plus"></i></a>
        <a class="button tw-mx-1" href="" @click.prevent="$emit('clear-sample', sampleIndex)"><i class="fa fa-times"></i></a>
      </span>
    </div>
  </div>
</template>
<script>
import BaseInputSelect from 'app/components/base-input-select.vue'
import BaseInputText from 'app/components/base-input-text.vue'
import TabbedColumnsView from 'modules/types/mx/samples/tabbed-columns-view.vue'
import ComboBox from 'app/components/combo-box.vue'
import {ValidationObserver, ValidationProvider} from 'vee-validate'
import MxSampleTableMixin from 'modules/types/mx/samples/sample-table-mixin.js'

export default {
  name: 'sample-table-row',
  mixins: [MxSampleTableMixin],
  props: {
    sample: {
      type: Object,
      default: () => ({})
    },
    sampleIndex: {
      type: Number,
      default: -1
    },
    requiredColumns: {
      type: Array,
      default: () => ([])
    },
    basicColumns: {
      type: Array,
      default: () => ([])
    },
    extraFieldsColumns: {
      type: Array,
      default: () => ([])
    },
    udcColumns: {
      type: Array,
      default: () => ([])
    },
    currentTab: {
      type: String,
      default: 'basic'
    },
    samplesLength: {
      type: Number,
      default: 1
    },
  },
  components: {
    'base-input-select': BaseInputSelect,
    'base-input-text': BaseInputText,
    'tabbed-columns': TabbedColumnsView,
    'combo-box': ComboBox,
    'validation-provider': ValidationProvider,
    'validation-observer': ValidationObserver
  },
  computed: {
    selectedColumns() {
      const columnsMap = {
        basic: this.basicColumns,
        extraFields: this.extraFieldsColumns,
        unattended: this.udcColumns
      }

      return [...this.requiredColumns, ...columnsMap[this.currentTab]]
    }
  },
  methods: {
    editRow(row) {
      this.sample = row
      this.sample.CONTAINERID = this.containerId
      this.editingRow = row.LOCATION
    },
    onAddToSampleGroup() {
      this.displaySampleGroupModal = true
    },
  },
}
</script>
<style scoped>
.location-column {
  width: 30px;
}
.protein-column {
  width: 15%;
}
.name-column {
  width: 10%;
}
.sample-group-column {
  width: 13%;
}
.actions-column {
  width: calc(12% - 30px);
}
.min-height-8 {
  min-height: 32px;
}
>>> .sample-group-select .items-list, >>> .protein-select .items-list {
  height: 100px;
  overflow-y: auto;
}
/* Chrome, Safari, Edge, Opera */
input[type=number]::-webkit-outer-spin-button,
input[type=number]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
}
</style>