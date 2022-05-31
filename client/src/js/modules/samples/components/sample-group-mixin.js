import ContainerTypes from "js/modules/shipment/collections/containertypes";

export default {
  data() {
    return {
      cachedContainerList: {},
      containerTypes: [],
      sampleGroupByContainers: {},
      sampleGroupContainers: {},
    }
  },
  methods: {
    async getContainerTypes() {
      const containerTypesCollection = new ContainerTypes()
      const result = await this.$store.dispatch('getCollection', containerTypesCollection)
      this.containerTypes = result.toJSON().filter(item => item['PROPOSALTYPE'] === this.$store.state.proposal.proposalType)
    },
    async fetchContainersInformation(containers) {
      for (let containerId in containers) {
        if (!this.cachedContainerList[containerId]) {
          this.cachedContainerList[containerId] = await this.$store.dispatch('fetchDataFromApi', {
            url: `/shipment/containers/${containerId}`,
            requestType: `fetching container with id: ${containerId}`
          })
        }
      }
    },
    async groupSamplesByContainer(samples) {
      samples.forEach(sample => {
        if (!this.sampleGroupByContainers[sample['CONTAINERID']]) this.sampleGroupByContainers[sample['CONTAINERID']] = []

        this.sampleGroupByContainers[sample['CONTAINERID']].push(sample)
      })

      await this.fetchContainersInformation(this.sampleGroupByContainers)

      for (let containerId in this.sampleGroupByContainers) {
        const length = this.cachedContainerList[containerId].CAPACITY
        const addedSamples = this.sampleGroupByContainers[containerId]
        const containerSamples = Array.from({ length }, (_, i) => {
          const sampleInPosition = addedSamples.find(added => +added['LOCATION'] - 1 === i)
          if (sampleInPosition) return { ...sampleInPosition, VALID: 1 }
          return {
            BLSAMPLEID: null,
            LOCATION: (i + 1).toString(),
            CRYSTALID: -1,
          }
        })

        this.$set(this.sampleGroupContainers, containerId, containerSamples)
      }


    },
    getContainerTypeForContainer(container) {
      const containerType = this.containerTypes.find(type => type['NAME'].toLowerCase() === container['CONTAINERTYPE'].toLowerCase())

      return containerType ? containerType : {}
    },
    generateContainerTitle(container) {
      const containerType = this.getContainerTypeForContainer(container)
      return containerType['NAME'].toLowerCase() === 'puck'
        ? container['NAME']
        : container['BARCODE']
    },
  },
  provide() {
    return {
      $displayTextInDrop: false
    }
  }
}