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
          'tw-p-2': true,
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
    <div class="tw-flex tw-py-1" v-for="(sample, sampleIndex) in samples" :key="sampleIndex">
      <div class="location-column tw-text-center">{{ sample.LOCATION || sampleIndex + 1 }}</div>

      <validation-provider class="tw-px-3 protein-column" tag="div">
        <combo-box
          :data="proteinsOptionsList"
          textField="text"
          :inputIndex="sampleIndex"
          :selectCount="samples.length"
          :selectedItem="formatSelectData(proteinsOptionsList, sample, 'PROTEINID')"
          defaultText=""
          size="small"
          :hasIcon="true"
          iconClassName="fa-check"
          iconParentClass="tw-text-green"
          valueField="value"
          v-on:handle-select-event="handleProteinSelection(sampleIndex, $event)"
        >
          <template slot="icons">
            <span><i class="fa fa-check green"></i></span>
          </template>
        </combo-box>
      </validation-provider>

      <validation-provider tag="div" class="name-column">
        <base-input-text inputClass="tw-w-full"></base-input-text>
      </validation-provider>

      <validation-provider tag="div" class="tw-px-3 tw-border-r sample-group-column">
        <base-input-select
          :options="anomalousOptionsList"
          optionValueKey="value"
          optionTextKey="text"
          inputClass="tw-w-full"
          @input="handleSampleGroupSelection(sampleIndex)"
        ></base-input-select>
      </validation-provider>

      <tabbed-columns
        class="tw-w-1/2"
        :currentTab="currentTab"
        :rowData="sample"
        :experimentKind=[]
        :spaceGroups="spaceGroups"
        :selectedScreeningMode="{}"
        :selectedCenteringMode="{}"
        @input="handleFieldChange($event, sampleIndex)"
      >
      </tabbed-columns>
    </div>
  </div>
</template>

<script>
import BaseInputSelect from 'app/components/base-input-select.vue'
import BaseInputText from 'app/components/base-input-text.vue'
import TabbedColumnsView from 'modules/types/mx/samples/tabbed-columns-view.vue'
import ComboBox from 'app/components/combo-box.vue'
import { ValidationObserver, ValidationProvider }  from 'vee-validate'
import { cloneDeep } from 'lodash'

export default {
  name: 'puck-samples-plate',
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
    },
    value: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      tabNames: [
        { key: 'basic', name: 'Basic' },
        { key: 'extraFields', name: 'Extra Fields' },
        { key: 'unattended', name: 'Unattended (UDC)' }
      ],
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


      return columnsMap[this.currentTab]
    },
    samples: {
      get() {
        console.log(this.values)
        return this.value
      },
      set(payload) {
        const { index, data, property } = payload
        const samples = cloneDeep(this.samples)
        samples[index][property] = data
        console.log({ samples });
        this.$emit('input', samples)
      }
    },
    proteinsOptionsList() {
      console.log(this.proteins.toJSON())
      return this.proteins.toJSON().map(item => ({ value: item.PROTEINID, text: item.ACRONYM }))
    }
  },
  methods: {
    handleFieldChange(data, sampleIndex) {
      console.log({ data, sampleIndex })
    },
    switchTabColumn(name) {
      this.currentTab = name
    },
    formatSelectData(selectData, data, property) {
      const matchedSelectData = selectData.find(select => select.value === data[property])

      if (!matchedSelectData) {
        return { value: '', text: '' }
      }

      return matchedSelectData
    },
    handleProteinSelection(index, data) {
      this.samples = { index, data: data.value, property: 'PROTEINID' }
    }
  }
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
</style>