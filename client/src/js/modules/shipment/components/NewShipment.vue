<template>
  <div class="content">
    <h1>Add Shipment</h1>

    <div>
      <form>
        <label>Shipment Name</label>
        <input type="text" v-model="name">
      </form>
      <p>Shipment name: {{name}}</p>
    </div>

    <div class="">
      <div v-if="false">
        <p>Form elements</p>

        <input type="checkbox" id="checkbox" v-model="showAll">
        <label for="checkbox">Show All Container Types</label>

        <select v-model="containerSelected">
          <option disabled value="">Please select a container type</option>
          <option v-for="container in filteredContainerTypes" :key="container.CONTAINERTYPEID">{{container.NAME}}</option>
        </select>

        <select v-model="containerSelected">
          <option disabled value="">Please select a container type</option>
          <optgroup v-for="(group, index) in nestedContainerTypes" :key="index" :label="group.name">
            <option v-for="container in group.containerTypes" :key="container.CONTAINERTYPEID">{{container.NAME}}</option>
          </optgroup>
        </select>
      </div>

        <scm-shipment-form />

    </div>
  </div>
</template>

<script>
import ContainerTypes from 'modules/shipment/collections/containertypes'
import ContainerGraphic from 'modules/shipment/components/ContainerGraphic.vue'
import SCMShipmentForm from './SCMShipmentForm.vue'
export default {
  name: "new-shipment",

  components: {
    'container-graphic': ContainerGraphic,
    'scm-shipment-form': SCMShipmentForm
  },
  data() {
    return {
      name: '',
      containerGeometry: {
        capacity: 0,
        columns: 0,
        drops: {
          x: 0,
          y: 0,
          w: 0,
          h: 0
        },
        well: null
      },
      containerType: 'puck',
      containerTypesCollection: null,
      containerTypes: [],
      containerSelected: '',
      proposalFilter: [this.$store.state.proposal.proposalType],
      showAll: false,
    }
  },
  watch: {
    showAll: function(newVal) {
      console.log("Filter options changed")
      if (newVal) this.proposalFilter = this.proposalTypesFilter
      else this.proposalFilter = [this.$store.state.proposal.proposalType]
    }
  },
  computed: {
    filteredContainerTypes: function() {
      return this.containerTypes.filter(container => {
        if (this.proposalFilter.length > 0)
          return this.proposalFilter.includes(container.PROPOSALTYPE)
        else return true
      })
    },
    proposalTypesFilter: function() {
      let types = this.containerTypes.map( container => container.PROPOSALTYPE )
      let unique = types.filter( (value, index, self) => self.indexOf(value) === index )
      return unique
    },
    // Build a nested set of container types based on the proposal type
    // [ { group: 'scm', containers: [ {name: ... }]}]
    nestedContainerTypes: function() {
      let groups = []
      for (var i=0; i<this.proposalFilter.length; i++) {
        // Find all containers with this proposal Type
        let proposalType = this.proposalFilter[i]
        let containers = this.containerTypes.filter(container => container.PROPOSALTYPE === proposalType)
        groups.push({name: proposalType, containerTypes: containers})
      }
      console.log("Nested Containers = " + JSON.stringify(groups))
      return groups
    },
  },
  created: function() {
    this.containerTypesCollection = new ContainerTypes()
    // If we want to get all types, not just active ones
    // this.containerTypes.queryParams.all = 1
  },
  mounted: function() {
    this.getContainerTypes().then( (collection) => {
            console.log("Yippee")
            this.containerTypes = collection.toJSON()
        }, (error) => {
            console.log("Error getting collection " + error.msg)
        })
  },
  methods: {
    getContainerTypes: function() {
      // Wrap the backbone request into a promise so we can wait for the result
      return new Promise((resolve) => {
          this.containerTypesCollection.fetch({
              success: function(response) {
                  console.log("New Shipment got container types: " + JSON.stringify(response))
                  resolve(response)
              },
              error: function() {
                  reject({msg: 'Couldn\'t fetch container type list'})
              },
          })
      })
    },

  }

}
</script>