<template>
  <div class="content">
    <help-banner level='notify' message="Select a shipment to see all containers. Clicking on the samples in the selected containers will add it to the current group. Click the 'Save Sample Group' button to save the changes to the group. "/>

    <h1>{{ gid ? 'Editing Sample Group' : 'Create Sample Group' }}</h1>

    <div v-if="objectKeys(selectedSamplesInGroups).length > 0 && objectKeys(cachedContainerList).length > 0" class="content">
      <h2>Sample in Group By Containers</h2>
      <custom-table-component class="tw-w-full" :data-list="formatSamplesInGroups()" table-class="tw-w-full">
        <template v-slot:tableHeaders>
          <td class="tw-w-6/12 tw-py-2 tw-pl-2">Container Name</td>
          <td class="tw-w-6/12 tw-py-2 tw-pl-2">Container Samples Added</td>
        </template>
        <template v-slot:slotData="{ dataList }">
          <custom-table-row
            :class="['tw-w-full', 'tw-cursor-pointer', rowIndex % 2 === 0 ? 'tw-bg-table-body-background-odd': 'tw-bg-table-body-background']"
            v-for="(result, rowIndex) in dataList"
            :key="rowIndex"
            :result="result"
            :row-index="rowIndex"
            @click.native="onContainerSelected(cachedContainerList[result['CONTAINERID']])">
            <td class="tw-w-6/12 tw-pl-2 tw-p1-2">{{ result['NAME'] }}</td>
            <td class="tw-w-6/12 tw-py-1 tw-pl-2">{{ result['SAMPLES'] }}</td>
          </custom-table-row>
        </template>
      </custom-table-component>
    </div>

    <div class="content">
      <h2>Containers</h2>
      <p class="tw-text-xs tw-mb-3">Select a shipment to see all associated containers</p>
      <div class="tw-flex tw-flex-row tw-w-full">
        <div class="tw-mr-2">
          <p class="tw-mb-2">Shipment</p>
          <combo-box
            class="tw-w-48 tw-mb-4 shipment-select"
            :data="shipments"
            value-field="SHIPPINGID"
            text-field="SHIPPINGNAME"
            default-text="Select a Shipment"
            :input-index="0"
            v-model="shipmentId"
          />
        </div>
      </div>

      <containers-list
        v-if="proposalObject.BEAMLINENAME"
        :showImaging="false"
        :tableHeaders="containerHeaders"
        :query-params="queryParams"
        :table-actions="true"
        action-class="tw-w-2/12 tw-py-2 tw-pl-2"
        v-on:row-clicked="onContainerSelected"
        v-on:unselect-container="unselectContainer"
      >
        <template v-slot:containers-table-action="{ result, rowIndex }">
          <router-link class="button button-notext atp" :to="`/containers/cid/${result.CONTAINERID}`">
            <i class="fa fa-info"></i> <span>See Details</span>
          </router-link>
        </template>
      </containers-list>
    </div>

    <div v-if="containerSelected" class="tw-w-full">
      <puck-table-view
        v-if="selectedContainerType.NAME && selectedContainerType.NAME.toLowerCase() === 'puck'"
        :selected-samples="selectedSamplesInGroups[selectedContainerId]"
        :samples="samples"
        :container-name="selectedContainerName"
        @cell-clicked="addSelectedCells"
        @unselect-cell="deselectCells"
      />

      <valid-container-graphic
        v-else-if="selectedContainerType.NAME && selectedContainerType.NAME.toLowerCase() !== 'puck'"
        :container-type="selectedContainerType"
        :valid-samples="selectedSamplesInGroups[selectedContainerId]"
        :container-identifier="selectedContainerName"
        color-attribute="VALID"
        :samples="samples"
        :containerGraphicHeader="selectedContainerName"
        @cell-clicked="addSelectedCells"
        @unselect-cell="deselectCells"
      />
    </div>

    <validation-observer class="tw-w-full" ref="sampleGroupName" v-slot="{ invalid, errors }" tag="div">
      <validation-provider
        tag="div"
        class="tw-flex tw-flex-row tw-w-full tw-items-center"
        rules="required|alpha_dash|max:40"
        name="sample group name"
        vid="sample_group_name"
        v-slot="{ errors }">
        <base-input-text
          outerClass="tw-py-4 group-name maven-pro-font tw-mr-3"
          labelClass="tw-mr-3 tw-py-8 name-label maven-pro-font"
          inputClass="tw-rounded tw-border tw-w-64 tw-py-1 tw-px-3 tw-text-gray-700 tw-leading-tight focus:tw-outline-none focus:tw-border-blue-500"
          v-model="groupName"
          type="text"
          id="sample_group_name"
          :errorMessage="errors[0]"
          label="Sample Group Name"
          initial-text="Click here to enter name"
          placeholder-text="Click here to enter name"
        />
      </validation-provider>

      <div class="tw-relative tw-mt-6">
        <base-button class="button" @perform-button-action="onSaveSampleGroup" :is-disabled="invalid && isDisabled">
          Save Sample Group
        </base-button>
      </div>
    </validation-observer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import { differenceBy, uniqBy, get as lodashGet, values, keys, has, pick, map, differenceWith, isEqual } from 'lodash-es'

import BaseButton from 'app/components/base-button.vue'
import BaseInputText from 'app/components/base-input-text.vue'
import HelpBanner from 'app/components/help-banner.vue'
import ContainersList from 'modules/shipment/components/containers-list.vue'

import SampleGroupsCollection from 'collections/samplegroups.js'
import SamplesCollection from 'collections/samples.js'
import SampleGroupSamplesCollection from 'collections/samplegroupsamples.js'
import ContainerModel from 'models/container.js'
import SampleGroup from 'models/samplegroup.js'
import BaseInputSelect from 'app/components/base-input-select.vue'
import Shipments from 'collections/shipments'
import ComboBox from 'app/components/combo-box.vue';
import CustomTableComponent from 'app/components/custom-table-component.vue'
import CustomTableRow from 'app/components/custom-table-row.vue'
import ValidContainerGraphic from 'modules/types/mx/samples/valid-container-graphic.vue'
import SampleGroupMixin from 'modules/samples/components/sample-group-mixin'
import PuckTableView from 'modules/samples/components/puck-table-view.vue'

export default {
  name: 'sample-group-edit',
  props: {
    gid: Number
  },
  mixins: [SampleGroupMixin],
  components: {
    'puck-table-view': PuckTableView,
    'valid-container-graphic': ValidContainerGraphic,
    'custom-table-component': CustomTableComponent,
    'custom-table-row': CustomTableRow,
    'combo-box': ComboBox,
    'base-input-select': BaseInputSelect,
    'base-button': BaseButton,
    'base-input-text': BaseInputText,
    'containers-list': ContainersList,
    'help-banner': HelpBanner,
    'validation-observer': ValidationObserver,
    'validation-provider': ValidationProvider
  },
  data() {
    return {
      groupName: '',
      lockName: !!this.gid,
      containerHeaders: [
        { title: 'Name', key: 'NAME', columnClass: 'tw-w-4/12 tw-py-2 tw-pl-2' },
        { title: 'Container Type', key: 'CONTAINERTYPE', columnClass: 'tw-w-3/12 tw-py-2 tw-pl-2' },
        { title: 'BarCode', key: 'BARCODE', columnClass: 'tw-w-3/12 tw-py-2 tw-pl-2' }
      ],
      sampleGroupName: null,
      containerSelected: false,
      selectedContainerName: '',
      samples: [],
      sampleGroup: null,
      selectedContainerType: {},
      sampleKeys: [
        'BLSAMPLEID',
        'CONTAINER',
        'CRYSTAL',
        'CRYSTALID',
        'DIMENSION1',
        'DIMENSION2',
        'DIMENSION3',
        'LOCATION',
        'PROTEIN',
        'SAMPLE',
        'BARCODE',
        'CONTAINERID'
      ],
      initialSamplesInGroup: [],
      initialSampleInGroupModels: null,
      sampleGroupId: null,
      containerModel: null,
      queryParams: {},
      shipmentsCollection: null,
      shipments: [],
      shipmentId: '',
      selectedContainerId: '',
      ready: false
    };
  },
  computed: {
    ...mapGetters({
      selectedSamplesInGroups: ['sampleGroups/getSelectedSampleGroups'],
      proposal: ['proposal/currentProposal']
    }),
    flattenedSamplesInGroup() {
      return Object.values(this.selectedSamplesInGroups).flat()
    },
    isDisabled() {
      const hasChanged = differenceWith(this.flattenedSamplesInGroup, this.initialSamplesInGroup, isEqual)
      return hasChanged.length < 1
    },
    proposalObject() {
      return this.$store.getters['proposal/currentProposalModel'].toJSON()
    }
  },
  created: function () {
    this.getContainerTypes()
    this.sampleGroup = new SampleGroupsCollection()
    this.containerSamples = new SamplesCollection()
    this.containerModel = new ContainerModel()
    this.shipmentsCollection = new Shipments()

    this.fetchShipmentsForProposal()
    this.sampleGroupId = this.gid
    if (this.sampleGroupId) {
      this.getSampleGroupInformation()
    } else {
      this.initialSampleInGroupModels = new SampleGroupSamplesCollection()
      // The database does not allow some characters like ':' and '.' so we replace them with '-'
    }
  },
  methods: {
    objectKeys: keys,
    async onSaveSampleGroup() {
      try {
        this.$store.commit('loading', true)
        await this.saveSampleGroupName()
        let result

        const totalSamples = this.flattenedSamplesInGroup
        const samples = totalSamples.reduce((acc, sample) => {
          if (typeof sample.BLSAMPLEID === 'undefined') return acc

          if (!this.sampleGroupId) {
            acc.push(sample)
          }
          
          if (this.sampleGroupId && typeof sample.BLSAMPLEGROUPID === 'undefined') {
            acc.push({ ...sample, BLSAMPLEGROUPID: this.sampleGroupId })
          }

          return acc
        }, [])

        const deletedSamples = differenceBy(this.initialSamplesInGroup, totalSamples, 'BLSAMPLEID')
        if (deletedSamples.length > 0) await this.deleteUnselectedSamplesFromGroup(deletedSamples)
        
        if (samples.length > 0) {
          const sampleGroupSamplesCollection = new SampleGroupSamplesCollection(samples, { sampleGroupId: this.sampleGroupId })
          result = await this.$store.dispatch('saveCollection', { collection: sampleGroupSamplesCollection })
        }

        if (result) {
          const savedSamples = result.toJSON()
          this.sampleGroupId = savedSamples[0].BLSAMPLEGROUPID
          let message = 'Saved samples to group - ' + this.groupName
          this.$store.commit('notifications/addNotification', {title: 'Success', message: message, level: 'success'})
        }

        await this.getSampleGroupInformation()

        if (!this.gid) {
          await this.$router.replace({ path: `/samples/groups/edit/id/${this.sampleGroupId}` })
        }
      } catch (error) {
        this.$store.commit('notifications/addNotification', { title: 'Error', message: error.message, level: 'error' })
      } finally {
        this.$store.commit('loading', false)
      }
    },
    async onContainerSelected(item) {
      try {
        if (!this.cachedContainerList[item.CONTAINERID]) {
          this.cachedContainerList[item.CONTAINERID] = item
        }
        this.containerSelected = false
        this.$store.commit('loading', true)
  
        this.selectedContainerType = this.getContainerTypeForContainer(item)
        this.selectedContainerName =  this.generateContainerTitle(item)
        this.selectedContainerId = item.CONTAINERID
        this.containerSamples.queryParams.cid = item.CONTAINERID
        this.containerSamples.queryParams.per_page = 999
  
        const samplesData = await this.$store.dispatch('getCollection', this.containerSamples)
  
        this.samples = samplesData.toJSON()
      } finally {
        this.$store.commit('loading', false)

        this.containerSelected = true
      }
    },
    async saveSampleGroupName(loading = false) {
      const validField = await this.$refs.sampleGroupName.validate()
      if (validField) {
        let attributes = null
        let sampleGroupModel = null

        if (this.sampleGroupId) {
          sampleGroupModel = new SampleGroup({ BLSAMPLEGROUPID: this.sampleGroupId })
          attributes = { NAME: this.groupName }
        } else {
          sampleGroupModel = new SampleGroup({ NAME: this.groupName })
        }

        const result = await this.$store.dispatch('saveModel', {
          model: sampleGroupModel,
          attributes
        })

        const { BLSAMPLEGROUPID } = result.toJSON()

        this.sampleGroupId = BLSAMPLEGROUPID
      }
    },
    addSelectedCells(cellsLocation) {
      const fullSampleDetails = this.getFullSamplesDetails(cellsLocation)
      const selectedContainerSamples = lodashGet(this.selectedSamplesInGroups, this.selectedContainerId, [])
      const updatedSelectedContainerSamples = uniqBy(selectedContainerSamples.concat(fullSampleDetails), 'BLSAMPLEID')

      this.$store.commit('sampleGroups/setSelectedSampleGroups', { [this.selectedContainerId]: updatedSelectedContainerSamples })
    },
    deselectCells(cellsLocation) {
      const fullSampleDetails = this.getFullSamplesDetails(cellsLocation)
      const selectedContainerSamples = lodashGet(this.selectedSamplesInGroups, this.selectedContainerId)
      const updatedSelectedContainerSamples = differenceBy(selectedContainerSamples, fullSampleDetails, 'BLSAMPLEID')

      this.$store.commit('sampleGroups/setSelectedSampleGroups', { [this.selectedContainerId]: updatedSelectedContainerSamples })
    },
    getFullSamplesDetails(cellsLocation) {
      return cellsLocation.reduce((samples, location) => {
        const sample = this.samples.find(sample => Number(sample.LOCATION) === Number(location))
        if (typeof sample !== 'undefined') {
          samples.push({
            ...pick(sample, this.sampleKeys),
            SAMPLE: sample.NAME,
            VALID: 1
          })
        }

        return samples

      }, [])
    },
    // Remove when we start persisting the vuex store
    async getSampleGroupInformation() {
      await this.fetchSampleGroupName()
      const sampleGroupSamplesCollection = new SampleGroupSamplesCollection(null, { state: { pageSize: 9999 }, sampleGroupId: this.sampleGroupId })
      const groupSamples = await this.$store.dispatch('getCollection', sampleGroupSamplesCollection)
      this.initialSampleInGroupModels = groupSamples

      const { samplesByContainer, initialSamples }  = groupSamples.toJSON().reduce((acc, curr) => {
        if (typeof curr.CONTAINERID === 'undefined') {
          return acc
        }

        acc.initialSamples.push({
          ...pick(curr, this.sampleKeys),
          BLSAMPLEGROUPID: curr.BLSAMPLEGROUPID,
          VALID: 1
        })

        if (has(acc.samplesByContainer, curr.CONTAINERID)) {
          acc.samplesByContainer[curr.CONTAINERID].push({
            ...pick(curr, this.sampleKeys),
            BLSAMPLEGROUPID: curr.BLSAMPLEGROUPID,
            VALID: 1
          })
        } 
        else {
          acc.samplesByContainer[curr.CONTAINERID] = [{
            ...pick(curr, this.sampleKeys),
            BLSAMPLEGROUPID: curr.BLSAMPLEGROUPID,
            VALID: 1
          }]
        }

        return acc
      }, {
        initialSamples: [],
        samplesByContainer: {}
      })
      this.initialSamplesInGroup = initialSamples
      await this.fetchContainersInformation(samplesByContainer)
      this.$store.commit('sampleGroups/setSelectedSampleGroups', samplesByContainer)
    },
    extractSampleNamesFromList(list, property) {
      const names = list.slice(0, 3).map(item => item[property]).join(', ')
      return list.length > 3 ? `${names} ...` : names
    },
    async deleteUnselectedSamplesFromGroup(deletedSamples) {
      const deletedSampleIds = map(deletedSamples, 'BLSAMPLEID')
      const deletedModels = []

      this.initialSampleInGroupModels.each((model) => {
        if (model && deletedSampleIds.includes(model.get('BLSAMPLEID'))) {
          deletedModels.push(this.$store.dispatch('deleteModel', model))
        }
      })

      await Promise.allSettled(deletedModels)
    },
    formatSamplesInGroups() {
      return keys(this.selectedSamplesInGroups).map(item => ({
        NAME: this.generateContainerTitle(this.cachedContainerList[item]),
        CONTAINERID: item,
        SAMPLES: this.extractSampleNamesFromList(this.selectedSamplesInGroups[item], 'SAMPLE')
      }))
    },
    async fetchSampleGroupName() {
      if (!this.sampleGroupId) {
        this.groupName = ''
      } else {
        try {
          const sampleGroupModel = new SampleGroup({ BLSAMPLEGROUPID: this.sampleGroupId })
          const groupNameResult = await this.$store.dispatch('getModel', sampleGroupModel)
          this.groupName = groupNameResult.toJSON().NAME
        } catch (error) {
          let message = 'An error occurred while fetching sample group name'
          this.$store.commit('notifications/addNotification', { title: 'Error', message: message, level: 'error' })
          this.$store.commit('loading', false)
        }
      }
    },
    async fetchShipmentsForProposal() {
      this.shipmentsCollection = new Shipments(null, { state: { pageSize: 99999 } })
      const shipments = await this.$store.dispatch('getCollection', this.shipmentsCollection)
      this.shipments = [{ SHIPPINGID: '', SHIPPINGNAME: '' }, ...shipments.toJSON()]
    },
    unselectContainer() {
      this.selectedContainerType = {}
      this.selectedContainerName = ''
      this.selectedContainerId = ''
      this.containerSelected = false
    }
  },
  provide() {
    return {
      $shipmentId: () => this.shipmentId,
      $restrictLoading: () => true,
      $labelAsButtons: true,
      $displayHelpMessage: true
    }
  },
  beforeRouteLeave(to, from , next) {
    this.$store.commit('sampleGroups/resetSelectedSampleGroups')
    next()
  },
};
</script>
<style scoped>
>>> .name-label {
  @apply tw-font-normal tw-text-lg;
}
>>> .group-name {
  .btn-edit {
    @apply tw-font-normal tw-text-lg;
  }
}
.maven-pro-font {
  font-family: 'Maven Pro', sans-serif;
}
>>> .shipment-select .items-list, >>> .dewars-select .items-list {
  min-height: 40px;
  max-height: 100px;
  overflow-y: auto;
}
</style>
