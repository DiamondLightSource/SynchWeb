<template>
  <div class="tw-my-4">
    <div class="tw-flex tw-justify-end tw-mb-2" v-if="!containerId">
      <button
        class="button"
        @click="$emit('clone-container', 0)">
        Clone all from first row
      </button>
    </div>
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
          [column.className]: true
        }"
      >
        {{ column.title }}
      </div>
      <div class="tw-flex tw-w-1/2 tw-border-table-header-color tw-border-l">
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
    <sample-table-row
      v-for="(sample, sampleIndex) in samples"
      :key="sampleIndex"
      :basic-columns="basicColumns"
      :extra-fields-columns="extraFieldsColumns"
      :required-columns="requiredColumns"
      :current-tab="currentTab"
      :sample="sample"
      :sample-index="sampleIndex"
      :udc-columns="udcColumns"
      :proteins="proteins"
      :samplesLength="samples.length"
      :containerId="containerId"
      v-on="$listeners"
    />
    <portal to="dialog">
      <custom-dialog-box
        v-if="displaySampleGroupModal"
        size="small"
        :hide-ok-button="true"
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
          <div class="tw-py-3 tw-px-4">

            <base-input-select
              class="tw-py-5"
              option-text-key="text"
              option-value-key="value"
              :options="shipments"
              inputClass="tw-w-full tw-h-6"
              :value="containerSamplesGroupData['shipmentId']"
              @input="onSampleGroupDataChange($event, 'shipmentId')"
              label="Shipment:"
              outerClass="tw-w-full tw-flex"
              labelClass="tw-w-3/5 tw-font-bold"
            />

            <base-input-select
              class="tw-py-5"
              option-text-key="text"
              option-value-key="value"
              :options="dewars"
              inputClass="tw-w-full tw-h-6"
              :value="containerSamplesGroupData['dewarId']"
              @input="onSampleGroupDataChange($event, 'dewarId')"
              label="Dewars:"
              outerClass="tw-w-full tw-flex"
              labelClass="tw-w-3/5 tw-font-bold"
            />

            <base-input-select
              class="tw-py-5"
              option-text-key="text"
              option-value-key="value"
              :options="containers"
              inputClass="tw-w-full tw-h-6"
              :value="containerSamplesGroupData['containerId']"
              @input="onSampleGroupDataChange($event, 'containerId')"
              label="Containers:"
              outerClass="tw-w-full tw-flex"
              labelClass="tw-w-3/5 tw-font-bold"
            />

            <div class="tw-w-full tw-flex tw-justify-end tw-py-4">
              <button class="button" @click="createNewSampleGroup">
                <span class="fa fa-plus"></span> &nbsp; Create Group
              </button>
            </div>
          </div>
        </template>
      </custom-dialog-box>
    </portal>
  </div>
</template>

<script>
import SampleTableRow from 'modules/types/mx/samples/sample-table-row.vue'
import CustomDialogBox from 'js/app/components/custom-dialog-box.vue'
import { mapGetters } from 'vuex'
import BaseInputSelect from 'app/components/base-input-select.vue'

export default {
  name: 'mx-sample-plate',
  components: {
    'custom-dialog-box': CustomDialogBox,
    'sample-table-row': SampleTableRow,
    'base-input-select': BaseInputSelect
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
          className: 'tw-w-32'
        },
        {
          key: 'BARCODE',
          title: 'Barcode',
          className: 'tw-w-32'
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
          key: 'CENTRINGMETHOD',
          title: 'Centering Method',
          className: 'tw-w-24'
        },
        {
          key: 'EXPERIMENTKIND',
          title: 'Experiment Kind',
          className: 'tw-w-32'
        },
        {
          key: 'ENERGY',
          title: 'Energy (eV)',
          className: 'tw-w-20'
        },
        {
          key: 'ANOMALOUSSCATTERER',
          title: 'Anomalous',
          className: 'tw-w-24'
        },
        {
          key: 'SCREENINGMETHOD',
          title: 'Screening Method',
          className: 'tw-w-24'
        },
        {
          key: 'REQUIREDRESOLUTION',
          title: 'Reqd Res',
          className: 'tw-w-24'
        },
        {
          key: 'MINRES',
          title: 'Min Res',
          className: 'tw-w-24'
        },
        {
          key: 'NUMTOCOLLECT',
          title: 'No to collect',
          className: 'tw-w-24'
        }
      ],
      currentTab: 'basic',
      displaySampleGroupModal: false
    }
  },
  props: {
    currentlyEditingRow: {
      type: Number,
      default: -1
    },
    proteins: {
      type: Array,
      default: () => ([])
    },
    containerId: {
      type: [Number, String, undefined]
    }
  },
  computed: {
    ...mapGetters({ samples: 'samples/samples' }),
    dynamicColumns() {
      const columnsMap = {
        basic: this.basicColumns,
        extraFields: this.extraFieldsColumns,
        unattended: this.udcColumns
      }

      return columnsMap[this.currentTab]
    },
    tabNames() {
      return [
        { key: 'basic', name: 'Basic' },
        { key: 'extraFields', name: 'Extra Fields' },
        { key: 'unattended', name: 'Unattended (UDC)' }
      ]
    },
    containerSamplesGroupData: {
      get() {
        return this.$store.getters['samples/getContainerSamplesGroupData']
      },
      set(data) {
        this.$store.commit('samples/setContainerSampleGroupData', data)
      }
    }
  },
  methods: {
    switchTabColumn(name) {
      this.currentTab = name
    },
    closeModalAction() {
      this.displaySampleGroupModal = false
      this.editingRow = null
    },
    performModalAction() {
    },
    createNewSampleGroup() {

    },
    async onSampleGroupDataChange(value, property) {
      let changedSampleGroupsData = {}
      switch(property) {
        case 'shipmentId':
          changedSampleGroupsData = {
            shipmentId: value,
            dewarId: null,
            containerId: null
          }
          break
        case 'dewarId':
          changedSampleGroupsData = {
            ...this.containerSamplesGroupData,
            dewarId: value,
            containerId: null
          }
          break
        case 'containerId':
          changedSampleGroupsData = {
            ...this.containerSamplesGroupData,
            containerId: value
          }
          break
        default:
          break
      }
      this.containerSamplesGroupData = changedSampleGroupsData
    }
  },
  watch: {
    currentlyEditingRow(newValue) {
      this.editingRow = newValue
    }
  }
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
</style>
