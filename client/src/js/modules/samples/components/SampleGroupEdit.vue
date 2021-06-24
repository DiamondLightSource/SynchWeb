<template>
  <div class="content">
    <h1 v-if="gid">Edit Sample Group</h1>
    <h1 v-else>Add Sample Group</h1>

    <help-banner level='notify' message='To save the sample group, edit the name and click OK. To add samples to the group, select the relevant container and add sample locations to the group, then click "Save Sample Group" at the foot of the page.'/>

    <base-input-text
      outerClass="tw-mb-4 tw-py-4"
      labelClass="tw-mr-3 tw-py-8 tw-font-bold"
      inputClass="tw-rounded tw-border tw-w-64 tw-py-1 tw-px-3 tw-text-gray-700 tw-leading-tight focus:tw-outline-none focus:tw-border-blue-500"
      :value="groupName"
      id="name"
      label="Group Name"
      :inline="true"
      @input="changeGroupName"
      @save="saveSampleGroupName(true)"
    />

    <div v-if="objectKeys(selectedSamplesInGroups).length > 0" class="content">
      <h1>Sample Group {{ sampleGroupName }}</h1>
      <table-panel
        :headers="sampleGroupHeaders"
        :data="formatSamplesInGroups()"
        @row-clicked="getContainerFromSample"
      >
      </table-panel>
    </div>

    <div class="content">
      <h1>Containers</h1>
      <containers-list
        :showImaging="false"
        :tableHeaders="containerHeaders"
        @row-clicked="onContainerSelected"
      >
        <template slot-scope="{ row }" slot="actions">
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

    <div class="tw-relative tw-mt-6">
      <base-button
        class="button"
        :isDisabled="isDisabled"
        @perform-button-action="onSaveSampleGroup"
      >
        Save Sample Group
      </base-button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { differenceBy, uniqBy, get as lodashGet, values, keys, has, pick, each, map } from 'lodash-es'
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
import SampleGroupNameModel from 'models/samplegroupname.js'

export default {
  name: 'sample-group-edit',
  props: {
    gid: Number
  },
  components: {
    'table-panel': Table,
    'container-graphic': ContainerGraphic,
    'base-button': BaseButton,
    'base-input-text': BaseInputText,
    'containers-list': ContainersList,
    'help-banner': HelpBanner
  },
  data: function () {
    return {
      groupName: '',
      lockName: this.gid ? true : false,
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
      sampleGroupNameModel: null
    };
  },
  computed: {
    ...mapGetters({
      selectedSamplesInGroups: ['sampleGroups/getSelectedSampleGroups'],
      proposal: ['proposal/currentProposal']
    }),
    isDisabled() {
      return !has(this.selectedSamplesInGroups, this.selectedContainerName)
    }
  },
  created: function () {
    this.sampleGroup = new SampleGroupsCollection()
    this.containerSamples = new SamplesCollection()
    this.sampleGroupSamples = new SampleGroupSamplesCollection()
    this.containerModel = new ContainerModel()
  },
  mounted() {
    this.sampleGroupId = this.gid
    if (this.sampleGroupId) {
      this.getSampleGroupInformation()
    } else {
      this.initialSampleInGroupModels = this.sampleGroupSamples
      // The database does not allow some characters like ':' and '.' so we replace them with '-'
      this.groupName = this.assignDefaultSampleGroupName()
    }
  },
  methods: {
    assignDefaultSampleGroupName() {
      return `${this.proposal} Sample Group (${new Date().toISOString().replace(/:|\./g, '-')})`
    },
    async onSaveSampleGroup() {
      try {
        this.$store.commit('loading', true)
        let result

        const totalSamples = Object.values(this.selectedSamplesInGroups).flat()
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
          this.$router.replace({ path: `/samples/groups/edit/id/${this.sampleGroupId}` })
        }
      } catch (error) {
        this.$store.commit('notifications/addNotification', { title: 'Error', message: error.message, level: 'error' })
      } finally {
        this.$store.commit('loading', false)
      }
    },
    async onContainerSelected(item) {
      try {
        this.$store.commit('loading', true)
  
        this.selectedContainer = item
        this.selectedContainerName = `${item.CONTAINERID} - ${item.BARCODE}`
        this.containerSamples.queryParams.cid = item.CONTAINERID
        this.containerSamples.queryParams.per_page = 999
  
        const samplesData = await this.$store.dispatch('getCollection', this.containerSamples)
  
        this.samples = samplesData.toJSON()
        this.containerSelected = true
        this.$store.commit('loading', false)
      } catch (error) {
        this.$store.commit('loading', false)
      }
    },
    async saveSampleGroupName(loading = false) {
      try {
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
        this.$router.replace({ path: `/samples/groups/edit/id/${this.sampleGroupId}` })

        if (loading) this.$store.commit('loading', false)

      } catch (error) {
        let message = 'An error occurred while saving the sample group name.'
        this.$store.commit('notifications/addNotification', { title: 'Error', message: message, level: 'error' })
        this.$store.commit('loading', false)
      }
    },
    changeGroupName(value) {
      this.groupName = value
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
      this.fetchSampleGroupName()
      this.sampleGroupSamples.queryParams = { BLSAMPLEGROUPID: this.sampleGroupId, page: 1, per_page: 9999, total_pages: 0 }
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

        const containerName = `${curr.CONTAINERID} - ${curr.BARCODE}`
        if (has(acc.samplesByContainer, containerName)) {
          acc.samplesByContainer[containerName].push({
            ...pick(curr, this.sampleKeys),
            BLSAMPLEGROUPID: curr.BLSAMPLEGROUPID
          })
        } 
        else {
          acc.samplesByContainer[containerName] = [{ ...pick(curr, this.sampleKeys), BLSAMPLEGROUPID: curr.BLSAMPLEGROUPID }]
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
      const { CONTAINERID } = this.selectedSamplesInGroups[row.name][0]
      if (CONTAINERID) {
        try {
          this.$store.commit('loading', true)
          this.containerModel = new ContainerModel({ CONTAINERID })
          const container = await this.$store.dispatch('getModel', this.containerModel)
          this.onContainerSelected(container.toJSON())
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
        this.groupName = this.assignDefaultSampleGroupName()
      } else {
        try {
          this.sampleGroupNameModel = new SampleGroupNameModel({ BLSAMPLEGROUPID: this.sampleGroupId })
          this.sampleGroupNameModel.ignoreSamples = true
          const groupNameResult = await this.$store.dispatch(
            'getModel',
            this.sampleGroupNameModel
          )
          this.groupName = groupNameResult.toJSON().NAME
        } catch (error) {
          let message = 'An error occurred while fetching sample group name'
          this.$store.commit('notifications/addNotification', { title: 'Error', message: message, level: 'error' })
          this.$store.commit('loading', false)
        }
      }
    }
  },
  provide() {
    return {
      $tableActions: 'Action'
    }
  }
};
</script>
