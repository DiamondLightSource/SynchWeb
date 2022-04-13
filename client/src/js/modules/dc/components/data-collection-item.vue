<template>
  <div class="tw-w-full tw-p-3 tw-rounded-md tw-mb-4 tw-bg-content-fill-color tw-border tw-border-content-help-color">
    <div class="tw-flex tw-w-full tw-font-content-header">
      <data-collection-item-header
        :is-visit="!!visitLink"
        :header-type="dataCollection['TYPE'].toLowerCase()"
        :data-collection="dataCollection"
        :data-collection-index="dataCollectionIndex"
        :data-collection-errors="dataCollectionErrors"
        :data-collection-warnings="dataCollectionWarnings"
        :data-collection-info="dataCollectionInfo"
        :hasStatusMessage="hasStatusMessage"
        :visit-link="visitLink"
        :file-path="filePath"
        v-on:toggle-file-path="toggleFilePath"
        v-on="$listeners"
      />
    </div>

    <div class="tw-w-full tw-flex sm:tw-flex-row tw-flex-col tw-mt-1">
      <slot name="fields-slot"
        :sample="sample"
        :kappaPhiChiValues="kappaPhiChiValues"
        :hasKappaPhiOrChi-="hasKappaPhiOrChi"
        :rotationAxisSymbol="rotationAxisSymbol"
        :flux="flux"
        :axisStart="axisStart"
        :axisRange="axisRange"
        :overlap="overlap"
        :numberOfImages="numberOfImages"
        :firstImage="firstImage"
        :resolution="resolution"
        :wavelength="wavelength"
        :exposureYime="exposureTime"
        :transmission="transmission"
        :dct="dct"
        :comments="comments"
        :state="state"
        :bsx="bsx"
        :bsy="bsy"
        :boxSizeX="boxSizeX"
        :boxSizeY="boxSizeY"
        :sampleId="sampleId"
        :spos="spos"
        :san="san"
        :directory="directory"
      >
      </slot>
      <slot name="images-slots"></slot>
      <slot name="chart-slot"></slot>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import DataCollectionField from 'modules/dc/components/data-collection-field.vue'
import DataCollectionItemHeader from 'modules/dc/components/data-collection-item-header.vue'
export default {
  name: 'data-collection-item',
  components: {
    DataCollectionItemHeader,
    DataCollectionField
  },
  props: {
    dataCollection: {
      type: Object,
      default: () => ({})
    },
    dataCollectionIndex: {
      type: Number,
      default: 0
    },
    dataCollectionMessageStatus: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      displayFullPath: false,
    }
  },
  methods: {
    toggleFilePath() {
      this.displayFullPath = !this.displayFullPath
    }
  },
  computed: {
    ...mapGetters({
      currentProposal: ['proposal/currentProposal']
    }),
    visitLink() {
      return `${this.currentProposal}-${this.dataCollection['VN']}`
    },
    sampleId() {
      return this.dataCollection['BLSAMPLEID']
    },
    hasStatusMessage() {
      return this.dataCollectionErrors || this.dataCollectionWarnings || this.dataCollectionInfo
    },
    dataCollectionErrors() {
      return Number(this.dataCollectionMessageStatus['ERRORS'])
    },
    dataCollectionWarnings() {
      return Number(this.dataCollectionMessageStatus['WARNINGS'])
    },
    dataCollectionInfo() {
      return Number(this.dataCollectionMessageStatus['INFOS'])
    },
    directory() {
      return this.dataCollection['DIR']
    },
    fullDirectory() {
      return this.dataCollection['DIRFULL']
    },
    filePath() {
      const directory = this.displayFullPath ? this.fullDirectory : this.directory
      return `${directory}${this.dataCollection['FILETEMPLATE']}`
    },
    kappaPhiChiValues() {
      const kappaValue = this.dataCollection['KAPPA'] ? `&kappa;: ${this.dataCollection['KAPPA']}&#8304;` : ''
      const phiValue = this.dataCollection['PHI'] ? `&phi;: ${this.dataCollection['PHI']}&#8304;` : ''
      const chiValue = this.dataCollection['CHISTART'] ? `&chi;: ${this.dataCollection['CHISTART']}&#8304;` : ''
      return `<span v-html="${kappaValue} ${phiValue} ${chiValue}"></span>`
    },
    hasKappaPhiOrChi() {
      return Number(this.dataCollection['KAPPA']) !== 0 || Number(this.dataCollection['PHI']) || Number(this.dataCollection['CHISTART'])
    },
    rotationAxisSymbol() {
      return `&${this.dataCollection['ROTATIONAXIS']};`
    },
    sample() {
      return this.dataCollection['SAMPLE']
    },
    flux() {
      return this.dataCollection['FLUX']
    },
    axisStart() {
      return this.dataCollection['AXISSTART']
    },
    axisRange() {
      return this.dataCollection['AXISRANGE']
    },
    overlap() {
      return this.dataCollection['OVERLAP']
    },
    numberOfImages() {
      return this.dataCollection['NUMIMG']
    },
    firstImage() {
      return Number(this.dataCollection['SI'])
    },
    resolution() {
      return this.dataCollection['RESOLUTION']
    },
    wavelength() {
      return this.dataCollection['WAVELENGTH']
    },
    exposureTime() {
      return this.dataCollection['EXPOSURETIME']
    },
    transmission() {
      return this.dataCollection['TRANSMISSION']
    },
    dct() {
      return this.dataCollection['DCT']
    },
    comments() {
      return this.dataCollection['COMMENTS']
    },
    state() {
      return this.dataCollection['STATE']
    },
    bsx() {
      return this.dataCollection['BSX']
    },
    bsy() {
      return this.dataCollection['BSY']
    },
    boxSizeX() {
      return (this.dataCollection['DX_MM']*1000).toFixed(0)
    },
    boxSizeY() {
      return (this.dataCollection['DY_MM']*1000).toFixed(0)
    },
    san() {
      return this.dataCollection['SAN']
    },
    spos() {
      return this.dataCollection['SPOS']
    }
  }
}
</script>
<style scoped></style>