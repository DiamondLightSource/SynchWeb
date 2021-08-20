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
          'tw-py-1': true,
          'tw-justify-center': true,
          'tw-text-center': true,
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
            'tw-py-1': true,
            'tw-justify-center': true,
            'tw-text-center': true,
            [column.className]: true
          }"
        >
          {{ column.title }}
        </div>
      </div>
    </div>
    <div
      class="tw-flex tw-w-full tw-items-center"
      :class="{
        'tw-bg-table-body-background': sampleIndex % 2 == 0,
        'tw-bg-table-body-background-odd': sampleIndex % 2 == 1
      }"
      v-for="(sample, sampleIndex) in inputValue"
      :key="sampleIndex">
      <div class="location-column tw-text-center tw-py-1">{{ sample.LOCATION || sampleIndex + 1 }}</div>

      <validation-provider
        class="tw-px-2 protein-column tw-py-1"
        tag="div"
        :rules="sample['NAME'] ? 'required|min_value:1' : ''" name="Protein"
        :vid="`protein-${sample['LOCATION']}`"
        v-slot="{ errors }">
        <combo-box
          v-if="!containerId || (!sample['BLSAMPLEID'] && editingRow === sample['LOCATION'])"
          :data="proteinsOptionsList"
          textField="text"
          :inputIndex="sampleIndex"
          :selectCount="samples.length"
          defaultText=""
          size="small"
          valueField="value">
        </combo-box>
        <div v-else class="tw-text-center">{{ selectDataValue(proteinsOptionsList, sample, 'PROTEINID') }}</div>
        <span>{{ errors[0] }}</span>
      </validation-provider>

      <validation-provider
        tag="div"
        class="name-column tw-py-1 tw-px-2"
        :rules="sample['PROTEINID'] > -1 ? 'required|alpha_dash|max:12' : ''"
        name="Sample Name"
        :vid="`sample-name-${sample['LOCATION']}`"
        v-slot="{ errors }">
        <base-input-text
          v-if="!containerId || (!sample['BLSAMPLEID'] && editingRow === sample['LOCATION'])"
          inputClass="tw-w-full tw-h-8"
          v-model="sample['NAME']"
          :errorMessage="errors[0]"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
        />
        <p v-else class="tw-text-center">{{ sample['NAME'] }}</p>
      </validation-provider>

      <validation-provider
        tag="div"
        class="tw-px-2 tw-border-r sample-group-column tw-py-1"
        :rules="sample['PROTEINID'] > -1 ? 'required' : ''"
        name="Sample Group"
        :vid="`sample-group-${sample['BLSAMPLEGROUPID']}`"
        v-slot="{ errors }">
        <base-input-select
          v-if="!containerId || (!sample['BLSAMPLEID'] && sample['LOCATION'] === editingRow)"
          :options="sampleGroups"
          optionValueKey="value"
          optionTextKey="text"
          inputClass="tw-w-full tw-h-8"
          v-model="sample['BLSAMPLEGROUPID']"
          :errorClass="errors[0] ? 'tw-text-xxs ferror' : ''"
          :errorMessage="errors[0]"/>
          <p v-else class="tw-text-center">{{ findSampleGroupsBySample(sample['PROTEINID']) }}</p>
      </validation-provider>


      <tabbed-columns
        class="tw-w-1/2 tw-py-1"
        :currentEditingRow="editingRow"
        :currentTab="currentTab"
        :rowData="sample"
        :rowDatIndex="sampleIndex"
        :experimentKind=[]
        :selectedScreeningMode="{}"
        :selectedCenteringMode="{}"
        :sampleIndex="sampleIndex"
        @input="handleFieldChange"
        :containerId="containerId"
      />

      <div class="actions-column tw-py-1 tw-text-right">
        <span v-if="containerId">
          <span v-if="editingRow === sample['LOCATION']">
            <a class="button tw-cursor-pointer" @click="saveSample(sample['LOCATION'])"><i class="fa fa-check"></i></a>
            <a class="button tw-cursor-pointer" @click="closeSampleEditing"><i class="fa fa-times"></i></a>
          </span>
          <span v-else>
            <a class="button tw-cursor-pointer" @click="editRow(sample)"><i class="fa fa-pencil"></i></a>
            <router-link v-if="sample['BLSAMPLEID']" class="button" :to="`/samples/sid/${sample['BLSAMPLEID']}`" ><i class="fa fa-search"></i></router-link>
            <a class="button tw-cursor-pointer" v-if="sample['BLSAMPLEID']" @click="onAddToSampleGroup"><i class="fa fa-cubes"></i></a>
          </span>
        </span>
        <span v-else>
          <a class="button tw-mx-1" href="" @click.prevent="$emit('clone-sample', sample['LOCATION'])"><i class="fa fa-plus"></i></a>
          <a class="button tw-mx-1" href="" @click.prevent="$emit('clear-sample', sample['LOCATION'])"><i class="fa fa-times"></i></a>
        </span>
      </div>
    </div>
    <portal to="dialog">
      <dialog-box
        v-if="displaySampleGroupModal"
        size="small"
        @perform-modal-action="performModalAction"
        @close-modal-action="closeModalAction">
        <template>
          <div class="tw-bg-modal-header-background tw-py-1 tw-pl-4 tw-pr-2 tw-rounded-sm tw-flex tw-w-full tw-justify-between tw-items-center tw-relative">
            <p>Sample Groups</p>
            <button
              class="tw-flex tw-items-center tw-border tw-rounded-sm tw-border-content-border tw-bg-white tw-text-content-page-color tw-p-1"
              @click="closeModalAction">
              <i class="fa fa-times"></i>
            </button>
          </div>
          <div class="tw-py-3 tw-px-4"></div>
        </template>
      </dialog-box>
    </portal>
  </div>
</template>

<script>
import BaseInputSelect from 'app/components/base-input-select.vue'
import BaseInputText from 'app/components/base-input-text.vue'
import TabbedColumnsView from 'modules/types/mx/samples/tabbed-columns-view.vue'
import ComboBox from 'app/components/combo-box.vue'
import { ValidationObserver, ValidationProvider }  from 'vee-validate'
import MxSampleTableMixin from 'modules/types/mx/samples/sample-table-mixin.js'
import Dialog from 'app/components/dialogbox.vue'

export default {
  name: 'mx-sample-plate-new',
  mixins: [MxSampleTableMixin],
  components: {
    'base-input-select': BaseInputSelect,
    'base-input-text': BaseInputText,
    'tabbed-columns': TabbedColumnsView,
    'combo-box': ComboBox,
    'validation-provider': ValidationProvider,
    'validation-observer': ValidationObserver,
    'dialog-box': Dialog
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
          key: 'REQUIREDRESOLUTION',
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
      sample: {},
      displaySampleGroupModal: false
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
    editRow(row) {
      this.sample = row
      this.sample.CONTAINERID = this.containerId
      this.editingRow = row.LOCATION
    },
    findSampleGroupsBySample(proteinId) {
      return this.sampleGroups.reduce((acc, curr) => {
        const hasSample = curr.MEMBERS.toJSON().find(member => Number(member.PROTEINID) === Number(proteinId))

        if (hasSample && curr.toJSON().NAME) {
          acc += `${curr.toJSON().NAME}, `
        } else {
          acc += `${curr.toJSON().BLSAMPLEGROUPID}, `
        }

        return acc
      }, '')
    },
    onAddToSampleGroup() {
      this.displaySampleGroupModal = true
    },
    closeSampleEditing() {
      this.editingRow = null
    },
    closeModalAction() {
      this.displaySampleGroupModal = false
    },
    performModalAction() {
    }
  },
  watch: {
    showUDCColumns() {
      if (!this.showUDCColumns) {
        this.currentTab = 'basic'
      }
    }
  }
}
</script>

<style scoped>
.location-column {
  width: 30px;
}
.protein-column {
  width: 18%;
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
.actions-column {
  width: calc(12% - 30px);
}
</style>