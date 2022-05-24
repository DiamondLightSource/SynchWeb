<template>
  <div class="content">
    <help-banner level='notify' message='To save the sample group, edit the name and click OK. To add samples to the group, select the relevant container and add sample locations to the group, then click "Save Sample Group" at the foot of the page.'/>

    <validation-observer ref="sampleGroupName" v-slot="{ invalid, errors }">
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
          :label="gid ? 'Editing Sample Group' : 'Create Sample Group'"
          :inline="true"
          placeholder-text="Click to edit and save name"
          @save="saveSampleGroupName(true)"
        />
        <p class="tw-text-sm maven-pro-font">(Click to edit and save name)</p>
      </validation-provider>
    </validation-observer>

    <div v-if="objectKeys(selectedSamplesInGroups).length > 0" class="content">
      <h1>Sample Group Containers</h1>
      <table-panel
        :headers="sampleGroupHeaders"
        :data="formatSamplesInGroups()"
        @row-clicked="getContainerFromSample"
      />
    </div>

    <div class="content">
      <h1>Containers</h1>
      <p class="tw-text-xs tw-mb-3">Select a shipment and dewar to see all associated containers</p>
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

        <div class="tw-ml-2">
          <p class="tw-mb-2">Dewar</p>
          <combo-box
            class="tw-w-48 tw-mb-4 dewars-select"
            :is-disabled="!shipmentId"
            :data="dewars"
            value-field="DEWARID"
            text-field="CODE"
            default-text="Select a Dewar"
            :input-index="1"
            v-model="dewarId"
          />
        </div>
      </div>
      <containers-list
        v-if="proposalObject.BEAMLINENAME"
        :showImaging="false"
        :tableHeaders="containerHeaders"
        :query-params="queryParams"
        @row-clicked="onContainerSelected"
      >
        <template slot="container-actions" slot-scope="{ row }">
          <router-link class="button button-notext atp" :to="`/containers/cid/${row.CONTAINERID}`">
            <i class="fa fa-info"></i> <span>See Details</span>
          </router-link>
        </template>
      </containers-list>
    </div>

    <container-graphic
      v-if="containerSelected"
      :selectedContainerName="selectedContainerName"
      :selectedContainerType="selectedContainer.CONTAINERTYPE"
      :samples="samples"
      :selectedSamples="selectedSamplesInGroups[selectedContainerName]"
      @unselect-cell="deselectCells"
      @cell-clicked="addSelectedCells"
    />

    <div class="tw-relative tw-mt-6" v-if="!isDisabled">
      <base-button
        class="button"
        @perform-button-action="onSaveSampleGroup"
      >
        Save Sample Group
      </base-button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import { differenceBy, uniqBy, get as lodashGet, values, keys, has, pick, map, differenceWith, isEqual } from 'lodash-es'
import ContainerGraphic from './ContainerGraphic.vue'

import Table from 'app/components/table.vue'
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
import Dewars from 'collections/dewars'
import ComboBox from 'app/components/combo-box.vue';

export default {
  name: 'sample-group-edit',
  props: {
    gid: Number
  },
  components: {
    'combo-box': ComboBox,
    'base-input-select': BaseInputSelect,
    'table-panel': Table,
    'container-graphic': ContainerGraphic,
    'base-button': BaseButton,
    'base-input-text': BaseInputText,
    'containers-list': ContainersList,
    'help-banner': HelpBanner,
    'validation-observer': ValidationObserver,
    'validation-provider': ValidationProvider
  },
  data: function () {
    return {
      groupName: '',
      lockName: !!this.gid,
      sampleGroupHeaders: [
        { title: 'Container', key: 'NAME' },
        { title: 'Samples', key: 'SAMPLES' },
      ],
      containersBodyColumns: ['NAME', 'CONTAINERTYPE', 'BARCODE'],
      containerHeaders: [
        { title: 'Name', key: 'NAME' },
        { title: 'Container Type', key: 'CONTAINERTYPE' },
        { title: 'BarCode', key: 'BARCODE' }
      ],
      sampleGroupName: null,
      containerSelected: false,
      selectedContainerName: '',
      samples: [],
      sampleGroup: null,
      selectedContainer: {},
      objectValues: values,
      objectKeys: keys,
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
      sampleGroupSamples: null,
      containerModel: null,
      sampleGroupNameModel: null,
      queryParams: {},
      beamLineTypesContainerType: {
        'i02-2': 'plate',
      },
      shipmentsCollection: null,
      dewarsCollection: null,
      shipments: [],
      dewars: [],
      shipmentId: '',
      dewarId: ''
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
    },

  },
  created: function () {
    this.sampleGroup = new SampleGroupsCollection()
    this.containerSamples = new SamplesCollection()
    this.sampleGroupSamples = new SampleGroupSamplesCollection()
    this.containerModel = new ContainerModel()
    this.shipmentsCollection = new Shipments()
    this.dewarsCollection = new Dewars()
  },
  mounted() {
    this.fetchShipmentsForProposal()
    this.sampleGroupId = this.gid
    if (this.sampleGroupId) {
      this.getSampleGroupInformation()
    } else {
      this.initialSampleInGroupModels = this.sampleGroupSamples
      // The database does not allow some characters like ':' and '.' so we replace them with '-'
    }
  },
  methods: {
    async onSaveSampleGroup() {
      try {
        this.$store.commit('loading', true)
        let result

        const totalSamples = this.flattenedSamplesInGroup
        const samples = totalSamples.reduce((acc, sample) => {
          if (typeof sample.BLSAMPLEID === 'undefined') return acc

          if (!this.sampleGroupId) {
            acc.push(sample)
          }
          
          if (this.gid && typeof sample.BLSAMPLEGROUPID === 'undefined') {
            acc.push({ ...sample, BLSAMPLEGROUPID: this.gid })
          }

          return acc
        }, [])

        const deletedSamples = differenceBy(this.initialSamplesInGroup, totalSamples, 'BLSAMPLEID')
        if (deletedSamples.length > 0) await this.deleteUnselectedSamplesFromGroup(deletedSamples)
        
        if (samples.length > 0) {
          this.sampleGroupSamples.reset(samples)
          this.sampleGroupSamples.newType = !this.sampleGroupId
          result = await this.$store.dispatch('saveCollection', { collection: this.sampleGroupSamples })
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
        this.containerSelected = false
        this.$store.commit('loading', true)
  
        this.selectedContainer = item
        this.selectedContainerName =  item.NAME ? item.NAME : `${item.CONTAINERID} - ${item.BARCODE}`
        this.containerSamples.queryParams.cid = item.CONTAINERID
        this.containerSamples.queryParams.per_page = 999
  
        const samplesData = await this.$store.dispatch('getCollection', this.containerSamples)
  
        this.samples = samplesData.toJSON()
        this.$store.commit('loading', false)
      } catch (error) {
        this.$store.commit('loading', false)
      } finally {
        this.containerSelected = true
      }
    },
    async saveSampleGroupName(loading = false) {
      try {
        const validField = await this.$refs.sampleGroupName.validate()
        if (validField) {
          if (loading) this.$store.commit('loading', loading)
          let attributes = null

          if (this.sampleGroupId) {
            attributes = { BLSAMPLEGROUPID: this.sampleGroupId, NAME: this.groupName }
          } else {
            this.sampleGroupNameModel = new SampleGroupNameModel({ NAME: this.groupName }, {})
            this.sampleGroupNameModel.ignoreSamples = true
          }

          await this.$store.dispatch('saveModel', {
            model: this.sampleGroupNameModel,
            attributes
          })

          const { BLSAMPLEGROUPID } = this.sampleGroupNameModel.toJSON()

          this.sampleGroupId = BLSAMPLEGROUPID
          await this.$router.replace({ path: `/samples/groups/edit/id/${this.sampleGroupId}` })
        }
      } catch (error) {
        let message = `An error occurred while saving the sample group name. ${error.message}`
        this.$store.commit('notifications/addNotification', { title: 'Error', message: message, level: 'error' })
      } finally {
        this.$store.commit('loading', false)
      }
    },
    addSelectedCells(cellsLocation) {
      const fullSampleDetails = this.getFullSamplesDetails(cellsLocation)
      const selectedContainerSamples = lodashGet(this.selectedSamplesInGroups, this.selectedContainerName, [])
      const updatedSelectedContainerSamples = uniqBy(selectedContainerSamples.concat(fullSampleDetails), 'BLSAMPLEID')

      this.$store.commit('sampleGroups/setSelectedSampleGroups', { [this.selectedContainerName]: updatedSelectedContainerSamples })
    },
    deselectCells(cellsLocation) {
      const fullSampleDetails = this.getFullSamplesDetails(cellsLocation)
      const selectedContainerSamples = lodashGet(this.selectedSamplesInGroups, this.selectedContainerName)
      const updatedSelectedContainerSamples = differenceBy(selectedContainerSamples, fullSampleDetails, 'BLSAMPLEID')

      this.$store.commit('sampleGroups/setSelectedSampleGroups', { [this.selectedContainerName]: updatedSelectedContainerSamples })
    },
    getFullSamplesDetails(cellsLocation) {
      return cellsLocation.reduce((samples, location) => {
        const sample = this.samples.find(sample => Number(sample.LOCATION) === Number(location))
        if (typeof sample !== 'undefined') {
          samples.push({
            ...pick(sample, this.sampleKeys),
            SAMPLE: sample.NAME
          })
        }

        return samples

      }, [])
    },
    // Remove when we start persisting the vuex store
    async getSampleGroupInformation() {
      await this.fetchSampleGroupName()
      this.sampleGroupSamples.queryParams = { BLSAMPLEGROUPID: this.sampleGroupId, page: 1, per_page: 9999, total_pages: 1 }
      const groupSamples = await this.$store.dispatch('getCollection', this.sampleGroupSamples)
      this.initialSampleInGroupModels = groupSamples

      const { samplesByContainer, initialSamples }  = groupSamples.toJSON().reduce((acc, curr) => {
        if (typeof curr.CONTAINER === 'undefined') {
          return acc
        }

        acc.initialSamples.push({
          ...pick(curr, this.sampleKeys),
          BLSAMPLEGROUPID: curr.BLSAMPLEGROUPID
        })

        if (has(acc.samplesByContainer, curr.CONTAINER)) {
          acc.samplesByContainer[curr.CONTAINER].push({
            ...pick(curr, this.sampleKeys),
            BLSAMPLEGROUPID: curr.BLSAMPLEGROUPID
          })
        } 
        else {
          acc.samplesByContainer[curr.CONTAINER] = [{ ...pick(curr, this.sampleKeys), BLSAMPLEGROUPID: curr.BLSAMPLEGROUPID }]
        }

        return acc
      }, {
        initialSamples: [],
        samplesByContainer: {}
      })
      this.initialSamplesInGroup = initialSamples
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
    async getContainerFromSample(row) {
      const { CONTAINERID } = this.selectedSamplesInGroups[row.NAME][0]
      if (CONTAINERID) {
        try {
          this.$store.commit('loading', true)
          this.containerModel = new ContainerModel({ CONTAINERID })
          const container = await this.$store.dispatch('getModel', this.containerModel)
          await this.onContainerSelected(container.toJSON())
          this.$store.commit('loading', false)
        } catch (error) {
          this.$store.commit('loading', false)
        }
      }
    },
    formatSamplesInGroups() {
      return keys(this.selectedSamplesInGroups).map(item => ({
        NAME: item, SAMPLES: this.extractSampleNamesFromList(this.selectedSamplesInGroups[item], 'SAMPLE')
      }))
    },
    async fetchSampleGroupName() {
      if (!this.sampleGroupId) {
        this.groupName = ''
      } else {
        try {
          const sampleGroupModel = new SampleGroup({ BLSAMPLEGROUPID: this.sampleGroupId })
          const groupNameResult = await this.$store.dispatch(
            'getModel',
              sampleGroupModel
          )
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
    async fetchDewarsByShipmentId() {
      this.dewarsCollection = new Dewars(null, { id: this.shipmentId, state: { pageSize: 99999 } })
      const dewars = await this.$store.dispatch('getCollection', this.dewarsCollection)
      this.dewars = [{ DEWARID: '', CODE: '' }, ...dewars.toJSON()]
    },
  },
  provide() {
    return {
      $tableActions: 'Action',
      $dewarId: () => this.dewarId,
      $restrictLoading: () => true
    }
  },
  beforeRouteLeave(to, from , next) {
    this.$store.commit('sampleGroups/resetSelectedSampleGroups')
    next()
  },
  watch: {
    shipmentId(newValue) {
      if (newValue) {
        this.fetchDewarsByShipmentId()
      }
    }
  }
};
</script>
<style scoped>
>>> .name-label {
  @apply tw-font-normal tw-text-2xl ;
}
>>> .group-name {
  .btn-edit {
    @apply tw-font-normal tw-text-2xl ;
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
