<template>
  <section class="tw-mx-auto">
    <div class="tw-w-full tw-border tw-border-green-500 tw-m-1 tw-p-2">
      <h1 class="tw-text-xl">Samples to be added</h1>
      <div class="tw-flex">
        <p class="tw-text-lg ">{{selectedItems.join(', ')}}</p>
      </div>
    </div>

    <color-scheme @update-color-range-of-samples="updateColorRangeForPlate" class="tw-my-4"/>

    <div v-if="containerComponent && colorSchemeSelected" class="tw-w-full tw-border tw-border-green-500 tw-m-1 tw-p-3 tw-flex tw-flex-col">
      <h1 class="tw-text-xl">Container: {{ selectedContainerName }}</h1>
      <component v-bind:is="containerComponent"
        :container="geometry"
        :samples="samples.data"
        :scoreThreshold="scoreThreshold"
        :selectedDrops="selectedItems"
        :colorRange="samplesColorScheme"
        @unselect-cell="deselectCells"
        @cell-clicked="addSelectedCells"/>
    </div>
  </section>
</template>

<script>
import PlateView from './PlateView.vue'
import PuckView from './PuckView.vue'
import Containers from './Containers.vue'
import { difference, uniq } from 'lodash-es'
import ColorScheme from 'app/components/utils/ColorScheme.vue'

export default {
  name:"Containers",
  components: {
    'plate-view': PlateView,
    'puck-view': PuckView,
    'containers': Containers,
    'color-scheme': ColorScheme
  },
  props: {
    geometry: {
      type: Object
    },
    containerType: {
      type: String,
    },
    selectedContainerName: {
      type: String,
      default: ''
    }
  },

  computed: {
    containerComponent: function() {
      if (this.containerType == 'plate') return 'plate-view'
      if (this.containerType == 'puck') return 'puck-view'
      return null
    },
  },
  created: function() {},
  methods: {
    // Trick to rerender component if container geometry changes
    updatePlateView: function() {
      this.plateKey += 1;
    },
    onSave: function() {
      alert("Saving Sample Group: " + this.sampleGroupName)
    },
    addSelectedCells: function(cellsLocation) {
      this.selectedItems = uniq(this.selectedItems.concat(cellsLocation))
    },
    deselectCells(cellsLocation) {
      this.selectedItems = difference(this.selectedItems, cellsLocation)
    },
    updateColorRangeForPlate({selectedColorRange, threshold }) {
      this.samplesColorScheme = selectedColorRange
      this.scoreThreshold = threshold / 100
      this.colorSchemeSelected = true
    }
  },
  watch: {
    geometry: function(newVal) {},
    containerComponent: function(newVal) {},
  },
  data: function() {
    return {
      selectedItems: [],
      sampleGroupName: '',
      plateKey: 0,
      puckKey: 0,
      samplesColorScheme: null,
      // Sample data taken from a json response
      samples: {
        "total": 20,
        data: new Array(30).fill(0).map((item, index) => {
          return {
            "BLSAMPLEID": 399000 + getRandomIntegers(1000),
            "CRYSTALID": 333570 + getRandomIntegers(10),
            "SCREENCOMPONENTGROUPID": null,
            "PARENTSAMPLEID": null,
            "PARENTSAMPLE": null,
            "BLSUBSAMPLEID": null,
            "INSPECTIONS": "0",
            "PROP": "cm14451",
            "CODE": "",
            "LOCATION": 1 + getRandomIntegers(192),
            "ACRONYM": "therm",
            "PROTEINID": "121393",
            "SPACEGROUP": "",
            "COMMENTS": "",
            "NAME": "A2d1_s1",
            "SHIPMENT": "asdasd",
            "SHIPPINGID": "7237",
            "DEWARID": "8584",
            "DEWAR": "sadsdasd",
            "CONTAINER": "mycontainer",
            "CONTAINERID": "34917",
            "SCLOCATION": null,
            "SC": "0",
            "GR": "0",
            "DC": "0",
            "AI": "0",
            "AP": "0",
            "R": "0",
            "SCRESOLUTION": null,
            "SCCOMPLETENESS": null,
            "DCRESOLUTION": null,
            "DCCOMPLETENESS": null,
            "ANOMALOUSSCATTERER": "",
            "REQUIREDRESOLUTION": null,
            "CELL_A": null,
            "CELL_B": null,
            "CELL_C": null,
            "CELL_ALPHA": null,
            "CELL_BETA": null,
            "CELL_GAMMA": null,
            "PACKINGFRACTION": null,
            "DIMENSION1": null,
            "DIMENSION2": null,
            "DIMENSION3": null,
            "SHAPE": null,
            "THEORETICALDENSITY": null,
            "CRYSTAL": null,
            "PROTEIN": "therm",
            "LOOPTYPE": null,
            "CENTRINGMETHOD": null,
            "EXPERIMENTKIND": null,
            "CONTAINERQUEUEID": null,
            "QUEUEDTIMESTAMP": null,
            "COMPONENTNAMES": null,
            "COMPONENTDENSITIES": null,
            "COMPONENTIDS": null,
            "COMPONENTACRONYMS": null,
            "COMPONENTGLOBALS": null,
            "COMPONENTAMOUNTS": null,
            "COMPONENTTYPESYMBOLS": null,
            "VOLUME": null,
            "SYMBOL": null,
            "ABUNDANCE": null,
            "RECORDTIMESTAMP": "09-10-2020",
            "RADIATIONSENSITIVITY": null,
            "ENERGY": null,
            "USERPATH": null,
            "SCORE": Math.random(),
            "VALID": 1
          }
        })
      },
      colorSchemeSelected: false,
      scoreThreshold: 0,
    }
  }
}

function getRandomIntegers(max) {
  return Math.floor(Math.random() * Math.floor(max))
}
</script>