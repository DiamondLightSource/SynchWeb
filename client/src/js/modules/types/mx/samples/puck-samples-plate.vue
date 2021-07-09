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
        v-for="(column, columnIndex) in tableColumns"
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
    </div>
    <div class="tw-flex tw-py-1" v-for="(sample, sampleIndex) in samples" :key="sampleIndex">
      <div class="location-column tw-text-center">{{ sample.LOCATION || sampleIndex + 1 }}</div>

      <validation-provider class="tw-px-3 protein-column" tag="div">
        <combo-box
          :data="proteinsOptionsList"
          textField="text"
          :inputIndex="sampleIndex"
          :selectCount="samples.length"
          defaultText=""
          size="small"
          valueField="value">
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
        :currentTab="currentTab"
        :rowData="sample"
        :experimentKind=[]
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
          className: 'anomalous-column'
        },
        {
          key: 'COMMENT',
          title: 'Comment',
          className: 'comment-column'
        }
      ],
      extraFieldsColumns: [
        {
          key: 'USERPATH',
          title: 'User Path',
          className: 'user-path-column'
        },
        {
          key: 'SPACEGROUP',
          title: 'Spacegroup',
          className: 'space-group-column'
        },
        {
          key: 'CELLS',
          title: 'Unit Cell',
          className: 'cell-column'
        }
      ],
      udcColumns: [
        {
          key: 'CENTERINGMETHOD',
          title: 'Centering Method',
          className: 'centering-method-column'
        },
        {
          key: 'EXPERIMENTKIND',
          title: 'Experiment Kind',
          className: 'experiment-kind-column'
        },
        {
          key: 'ENERGY',
          title: 'Energy (eV)',
          className: 'energy-column'
        },
        {
          key: 'ANOMALOUS',
          title: 'Anomalous',
          className: 'anomalous-column'
        },
        {
          key: 'SCREENINGMETHOD',
          title: 'Screening Method',
          className: 'screening-method-column'
        },
        {
          key: 'REQUIREDRES',
          title: 'Reqd Res',
          className: 'resolution-column'
        },
        {
          key: 'MINRES',
          title: 'Min Res',
          className: 'resolution-column'
        },
        {
          key: 'NUMTOCOLLECT',
          title: 'No to collect',
          className: 'collect-column'
        }
      ],
      currentTab: 'basic',
    }
  },
  computed: {
    tableColumns() {
      const columnsMap = {
        basic: this.basicColumns,
        extraFields: this.extraFieldsColumns,
        unattended: this.udcColumns
      }


      return [...this.requiredColumns, ...columnsMap[this.currentTab]]
    },
    samples: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
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
    formatSelectData() {
      
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
  width: 100px;
}
.comment-column, .cell-column {
  width: 200px;
}
.space-group-column, .centering-method-column, .experiment-kind-column {
  width: 70px;
}
.energy-column {
  width: 50px;
}
.resolution-column, .collect-column {
  width: 40px;
  word-wrap: break-word;
}
.screening-method-column {
  width: 70px;
  word-wrap: break-word;
}
</style>