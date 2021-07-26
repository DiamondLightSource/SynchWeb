<template>
  <div class="tw-my-4">
    <div class="tw-flex tw-justify-end tw-w-full tw-h-auto tw-items-center">
      <a
        v-for="(tabName, tabNameIndex) in tabNames" :key="tabNameIndex"
        :class="{
          'tw-border-t': true,
          'tw-border-l': true,
          'tw-cursor-pointer': true,
          'tw-border-r': tabNameIndex === tabNames.length - 1,
          'tw-bg-table-header-background': currentTab === tabName.key,
          'tw-text-table-header-color': currentTab === tabName.key,
          'tw-p-2': currentTab !== tabName.key,
          'tw-p-3': currentTab === tabName.key,
        }"
        @click="switchTabColumn(tabName.key)">
        {{ tabName.name }}
      </a>
    </div>
    <div class="list-header tw-flex tw-items-center tw-w-full tw-bg-table-header-background tw-text-table-header-color">
      <div
        v-for="(column, columnIndex) in requiredColumns"
        :key="columnIndex"
        :class="{
          'tw-flex': true,
          'tw-items-center': true,
          'tw-py-1': true,
          'tw-justify-center': true,
          'tw-text-center': true,
          'tw-h-12': true,
          'tw-border-table-header-color': columnIndex === 3,
          'tw-border-r': columnIndex === 3,
          [column.className]: true
        }"
      >
        {{ column.title }}
      </div>
      <div class="tw-flex tw-w-1/2">
        <div
          v-for="(column, columnIndex) in dynamicColumns"
          :key="columnIndex"
          :class="{
            'tw-flex': true,
            'tw-items-center': true,
            'tw-p-2': true,
            'tw-justify-center': true,
            'tw-text-center': true,
            'tw-h-12': true,
            [column.className]: true
          }"
        >
          {{ column.title }}
        </div>
      </div>
    </div>
    <div class="tw-flex tw-w-full" v-for="(sample, sampleIndex) in inputValue" :key="sampleIndex">
      <div class="location-column tw-text-center tw-py-1">{{ sample.LOCATION || sampleIndex + 1 }}</div>

      <validation-provider
        class="tw-px-3 protein-column tw-py-1"
        tag="div"
        :rules="sample['NAME'] ? 'required|min_value:1' : ''" name="Protein"
        :vid="`protein-${sample['LOCATION']}`"
        v-slot="{ errors }">
        <combo-box
          v-if="displayInputForm(sample)"
          :data="proteinsOptionsList"
          textField="text"
          :inputIndex="sampleIndex"
          :selectCount="inputValue.length"
          :selectedItem="formatSelectData(proteinsOptionsList, sample, 'PROTEINID')"
          defaultText=""
          size="small"
          valueField="value"
          v-on:handle-select-event="handleProteinSelection(sampleIndex, $event)"
        >
          <template slot-scope="{ option }">
            <span><i class="fa fa-check green"></i></span> {{ option['text'] }}
          </template>
        </combo-box>
        <div v-else>{{ selectDataValue(proteinsOptionsList, sample, 'PROTEINID') }}</div>
        <span>{{ errors[0] }}</span>
      </validation-provider>

      <validation-provider
        tag="div"
        class="name-column tw-py-1"
        :rules="sample['PROTEINID'] > -1 ? 'required|alpha_dash|max:12' : ''"
        name="Sample Name"
        :vid="`sample-name-${sample['LOCATION']}`"
        v-slot="{ errors }">
        <base-input-text
          v-if="displayInputForm(sample)"
          inputClass="tw-w-full tw-h-8"
          v-model="sample['NAME']"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          :value="sample['NAME']"
          @input="handleFieldChange({
            index: sampleIndex,
            field: 'NAME',
            value: $event
          })"
        />
        <p v-else>{{ sample['NAME'] }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-3 tw-border-r sample-group-column tw-py-1"
        :rules="sample['PROTEINID'] > -1 ? 'required' : ''"
        name="Sample Group"
        :vid="`sample-group-${sample['BLSAMPLEGROUPID']}`"
        v-slot="{ errors }">
        <base-input-select
          v-if="displayInputForm(sample)"
          :options="anomalousOptionsList"
          optionValueKey="value"
          optionTextKey="text"
          inputClass="tw-w-full tw-h-8"
          :value="sample['BLSAMPLEGROUPID']"
          @input="handleFieldChange({
            index: sampleIndex,
            field: 'BLSAMPLEGROUPID',
            value: $event
          })"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          :errorMessage="errors[0]"/>
          <p v-else>{{ selectDataValue(proteinsOptionsList, sample, 'BLSAMPLEGROUPID') }}</p>
      </validation-provider>

      <tabbed-columns
        class="tw-w-1/2 tw-py-1"
        :currentTab="currentTab"
        :rowData="sample"
        :rowDatIndex="sampleIndex"
        :experimentKind=[]
        :spaceGroups="spaceGroups"
        :selectedScreeningMode="{}"
        :selectedCenteringMode="{}"
        :sampleIndex="sampleIndex"
        @input="handleFieldChange"
      />

      <div class="actions-column tw-py-1 tw-text-right">
        <span v-if="containerId">
          <a class="button" href="" v-if="editingRow != sample['LOCATION']" @click.prevent="editRow(sample)"><i class="fa fa-edit"></i></a>
        </span>
        <span v-else>
          <a class="button tw-mx-1" href="" @click.prevent="$emit('clone-sample', sample['LOCATION'])"><i class="fa fa-plus"></i></a>
          <a class="button tw-mx-1" href="" @click.prevent="$emit('clear-sample', sample['LOCATION'])"><i class="fa fa-times"></i></a>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import BaseInputSelect from 'app/components/base-input-select.vue'
import BaseInputText from 'app/components/base-input-text.vue'
import TabbedColumnsView from 'modules/types/mx/samples/tabbed-columns-view.vue'
import ComboBox from 'app/components/combo-box.vue'
import { ValidationObserver, ValidationProvider }  from 'vee-validate'
import { SampleTableMixin } from 'modules/types/saxs/samples/experiments/sample-table-mixin.js'
import MxSampleTableMixin from 'modules/types/mx/samples/sample-table-mixin.js'

export default {
  name: 'mx-sample-plate-new',
  mixins: [SampleTableMixin, MxSampleTableMixin],
  components: {
    'base-input-select': BaseInputSelect,
    'base-input-text': BaseInputText,
    'tabbed-columns': TabbedColumnsView,
    'combo-box': ComboBox,
    'validation-provider': ValidationProvider,
    'validation-observer': ValidationObserver
  },
  props: {
    proteins: {
      type: Array
    },
    experimentKind: {
      type: String
    },
    containerId: {
      type: Number
    }
  },
  data() {
    return {
      requiredColumns: [
        {
          key: 'LOCATION',
          title: 'Loc',
          className: 'location-column'
        },
        {
          key: 'ACRONYM',
          title: 'Protein Acronym',
          className: 'protein-column'
        },
        {
          key: 'NAME',
          title: 'Name',
          className: 'name-column'
        },
        {
          key: 'SAMPLEGROUP',
          title: 'Sample Group',
          className: 'sample-group-column'
        }
      ],
      basicColumns: [
        {
          key: 'ANOLAMLOUS',
          title: 'Anomalous',
          className: 'tw-w-1/4'
        },
        {
          key: 'COMMENT',
          title: 'Comment',
          className: 'tw-w-1/2'
        }
      ],
      extraFieldsColumns: [
        {
          key: 'USERPATH',
          title: 'User Path',
          className: 'tw-w-3/12'
        },
        {
          key: 'SPACEGROUP',
          title: 'Spacegroup',
          className: 'tw-w-3/12'
        },
        {
          key: 'CELLS',
          title: 'Unit Cell',
          className: 'tw-w-4/12'
        }
      ],
      udcColumns: [
        {
          key: 'CENTERINGMETHOD',
          title: 'Centering Method',
          className: 'tw-w-2/12'
        },
        {
          key: 'EXPERIMENTKIND',
          title: 'Experiment Kind',
          className: 'tw-w-2/12'
        },
        {
          key: 'ENERGY',
          title: 'Energy (eV)',
          className: 'tw-w-1/12'
        },
        {
          key: 'ANOMALOUS',
          title: 'Anomalous',
          className: 'tw-w-2/12'
        },
        {
          key: 'SCREENINGMETHOD',
          title: 'Screening Method',
          className: 'tw-w-2/12'
        },
        {
          key: 'REQUIREDRES',
          title: 'Reqd Res',
          className: 'tw-w-1/12'
        },
        {
          key: 'MINRES',
          title: 'Min Res',
          className: 'tw-w-1/12'
        },
        {
          key: 'NUMTOCOLLECT',
          title: 'No to collect',
          className: 'tw-w-1/12'
        }
      ],
      currentTab: 'basic',
      editingRow: null,
      sample: {}
    }
  },
  computed: {
    selectedColumns() {
      const columnsMap = {
        basic: this.basicColumns,
        extraFields: this.extraFieldsColumns,
        unattended: this.udcColumns
      }


      return [...this.requiredColumns, ...columnsMap[this.currentTab]]
    },
    dynamicColumns() {
      const columnsMap = {
        basic: this.basicColumns,
        extraFields: this.extraFieldsColumns,
        unattended: this.udcColumns
      }

      if (!this.showUDCColumns && this.currentTab === 'unattended') {
        return []
      }


      return columnsMap[this.currentTab]
    },
    proteinsOptionsList() {
      return this.proteins.toJSON().map(item => ({ value: item.PROTEINID, text: item.ACRONYM }))
    },
    showUDCColumns() {
      return this.$showUDCColumns()
    },
    tabNames() {
      const tabs = [
        { key: 'basic', name: 'Basic' },
        { key: 'extraFields', name: 'Extra Fields' }
      ]

      if (this.showUDCColumns) {
        tabs.push({ key: 'unattended', name: 'Unattended (UDC)' })
      }

      return tabs
    }
  },
  methods: {
    handleFieldChange(data) {
      const { index, key, value } = data
      this.$emit('reset-form-validation')
      this.$store.commit('samples/update', { index, key,  value })
    },
    switchTabColumn(name) {
      this.currentTab = name
    },
    handleProteinSelection(index, data) {
      this.$store.commit('samples/update', { index, key: 'PROTEINID', value: data.value })
    },
    editRow(row) {
      this.sample = row
      this.sample.CONTAINERID = this.containerId
      this.editingRow = row.LOCATION
    },
    displayInputForm(row) {
      return !this.containerId || Number(this.editingRow) === Number(row.LOCATION)
    }
  },
  inject: [
    '$showUDCColumns'
  ]
}
</script>

<style scoped>
.location-column {
  width: 30px;
}
.protein-column {
  width: 20%;
}
.name-column {
  width: 10%;
} 
.sample-group-column {
  width: 10%;
}

.user-path-column, .screening-method-column {
  width: 150px;
}
.anomalous-column {
  width: 80px;
}
.comment-column, .cell-column {
  width: 200px;
}
.space-group-column, .centering-method-column, .experiment-kind-column {
  width: 100px;
}
.energy-column {
  width: 50px;
}
.resolution-column, .collect-column {
  width: 40px;
  word-wrap: break-word;
}
.screening-method-column {
  width: 100px;
  word-wrap: break-word;
}
.actions-column {
  width: calc(10% - 30px);
}
</style>