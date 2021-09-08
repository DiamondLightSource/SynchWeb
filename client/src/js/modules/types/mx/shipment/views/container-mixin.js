import Users from "collections/users";
import ProcessingPipelines from 'collections/processingpipelines'
import SpaceGroupList from 'utils/sgs.js'
import CenteringMethodList from 'utils/centringmethods.js'
import AnomalousList from 'utils/anoms.js'
import ExperimentKindsList from 'utils/experimentkinds.js'
import DistinctProteins from "js/modules/shipment/collections/distinctproteins";
import ExperimentTypes from "js/modules/shipment/collections/experimenttypes";
import ContainerRegistry from "js/modules/shipment/collections/containerregistry";
import ContainerTypes from "js/modules/shipment/collections/containertypes";
import SampleGroups from "js/collections/samplegroups";

const INITIAL_CONTAINER_TYPE = {
  CONTAINERTYPEID: 0,
  CAPACITY: 0,
  DROPPERWELLX: null,
  DROPPERWELLY: null,
  DROPHEIGHT: null,
  DROPWIDTH: null,
  WELLDROP: -1,
  WELLPERROW: null,
}

export default {
  data() {
    return {
      anomalousList: AnomalousList.list,

      centeringMethods: CenteringMethodList.list,
      containerType: {},
      containerTypes: [],
      containerTypesCollection: null,
      containerRegistryCollection: null,
      containerState: {},

      experimentTypes: [],
      experimentTypesCollection: null,
      experimentKindList: [],

      containerRegistry: [],
      containerRegistryId: '',
      processingPipeline: '',
      processingPipelines: [],

      users: [],
      usersCollection: null,

      sampleGroupsCollection: null,
      sampleGroups: [],
      spaceGroups: SpaceGroupList.list,
      sampleGroupsAndMembers: []
    }
  },
  methods: {
    async getUsers() {
      this.usersCollection = new Users(null, { state: { pageSize: 9999 }})
      this.usersCollection.queryParams.all = 1
      this.usersCollection.queryParams.pid = this.$store.state.proposal.proposalModel.get('PROPOSALID')

      const result = await this.$store.dispatch('getCollection', this.usersCollection)
      this.users = result.toJSON()
      // Set plate owner to current user
      this.containerState.PERSONID = this.$store.state.user.personId
    },
    async getProcessingPipelines() {
      let processingPipelinesCollection = new ProcessingPipelines()

      processingPipelinesCollection.queryParams.pipelinestatus = 'optional'
      processingPipelinesCollection.queryParams.category = 'processing'

      const result = await this.$store.dispatch('getCollection', processingPipelinesCollection)
      this.processingPipelines = result.toJSON()
    },
    async getProteins() {
      this.proteinsCollection = new DistinctProteins()
      // If we want to only allow valid samples
      if (app.options.get('valid_components') && !app.staff) {
        this.proteinsCollection.queryParams.external = 1
      }

      this.gProteinsCollection = new DistinctProteins()
      const result = await this.$store.dispatch('getCollection', this.proteinsCollection)
      this.proteins = result.toJSON()
      this.proteinsLoaded = true
    },
    async getExperimentTypes() {
      this.experimentTypesCollection = new ExperimentTypes()

      const result = await this.$store.dispatch('getCollection', this.experimentTypesCollection)
      const proposalExperimentTypes = result.where({ PROPOSALTYPE: this.$store.state.proposal.proposalType })
      this.experimentTypes = proposalExperimentTypes.map(type => type.toJSON())
      this.containerState.EXPERIMENTTYPEID = this.experimentTypes.length > 0 ? this.experimentTypes[0]['EXPERIMENTTYPEID'] : ''
    },
    async getContainerRegistry() {
      this.containerRegistryCollection = new ContainerRegistry(null, { state: { pageSize: 9999 }})
      const result = await this.$store.dispatch('getCollection', this.containerRegistryCollection)
      this.containerRegistry = [{ CONTAINERREGISTRYID: null, BARCODE: ""}, ...result.toJSON()]
    },
    async getContainerTypes() {
      this.containerTypesCollection = new ContainerTypes()

      this.containerFilter = [this.$store.state.proposal.proposalType]

      const result = await this.$store.dispatch('getCollection', this.containerTypesCollection)
      this.containerTypes = result.toJSON()
      // Do we have valid start state?
      if (this.containerTypes.length) {
        let initialContainerType = result.findWhere({PROPOSALTYPE: this.containerFilter[0]})
        this.containerState.CONTAINERTYPEID = initialContainerType ? initialContainerType.get('CONTAINERTYPEID') : ''
      }

      if (this.container) {
        let containerTypeModel = result.findWhere({NAME: this.container.CONTAINERTYPE})

        if (containerTypeModel) {
          this.containerType = Object.assign(INITIAL_CONTAINER_TYPE, containerTypeModel.toJSON())
        }
      }
    },
    formatExperimentKindList() {
      for (const [key, value] of Object.entries(ExperimentKindsList.list)) {
        this.experimentKindList.push({ value, text: key })
      }
    },
    async getSampleGroups() {
      this.sampleGroupsCollection = new SampleGroups(null, { state: { pageSize: 9999 }})

      const result = await this.$store.dispatch('getCollection', this.sampleGroupsCollection)
      this.sampleGroupsAndMembers = result.groups().toJSON()
      this.sampleGroups = result.groups().toJSON().map((group, index) => ({
        value: group.BLSAMPLEGROUPID,
        text: group.NAME || `Sample Group ${index}`
      }))
    }
  },
  computed: {
    containerFilter: function() {
      return [this.$store.state.proposal.proposalType]
    },
  },
  provide() {
    return {
      $spaceGroups: this.spaceGroups,
      $centeringMethods: this.centeringMethods,
      $anomalousList: this.anomalousList,
      $experimentKindList: this.experimentKindList,
      $sampleLocation: () => this.sampleLocation,
      $sampleGroups: () => this.sampleGroups,
      $sampleGroupsAndMembers: () => this.sampleGroupsAndMembers,
      $allowUDC: () => this.containerState.ALLOWUDC
    }
  }
}