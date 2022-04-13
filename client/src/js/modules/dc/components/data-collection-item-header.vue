<template>
  <div v-if="headerTypes.includes(headerType)" class="tw-font-content-header">
    <button class="button tw-mr-1 tw-text-link-color" @click="$emit('add-to-project', dataCollection)" title="Add to Project"><i class="fa fa-book"></i></button>
    <button :class="['button', dataCollection['FLAG'] ? 'button-highlight': '', 'tw-mr-1', 'tw-text-link-color']" @click="$emit('add-to-favorites', dataCollection)" title="Click to add this data collection to the list of favourite data collections"><i class="fa fa-star-o"></i></button>
    <router-link v-if="dataCollection['DCC'] > 1" class="button tw-mr-1 tw-text-link-color" :to="`/dc/visit/${visitLink}/dcg/${dataCollection['DCG']}`" title="Permalink"><i class="fa fa-link"></i></router-link>
    <router-link class="button tw-mr-1 tw-text-link-color" :to="`/dc/visit/${visitLink}/id/${dataCollection['ID']}`" title="Permalink"><i class="fa fa-link"></i></router-link>
    <button v-if="dataCollection['COMMENTS']" @click="$emit('open-data-collection-comments', dataCollection)" class="button tw-font-bold tw-mr-1 tw-text-link-color" title="Comments"><i class="fa fa-comments"></i> {{ dataCollection['DCCC']}}</button>
    <button class="button tw-font-bold tw-mr-1 tw-text-link-color" @click="$emit('view-attachments', dataCollection)"><i class="fa fa-file"></i> {{ dataCollection['DCAC'] }}</button>
    <button class="button tw-mr-1 tw-text-link-color" title="Reprocess" @click="$emit('reprocess-data-collection', dataCollection)"><i class="fa fa-cog"></i></button>
    <button class="button tw-mr-1" title="Status Message" v-if="hasStatusMessage">
      <span v-if="dataCollectionErrors > 0" class="tw-mr-1"><i class="fa fa-exclamation-circle red"></i> {{ dataCollectionErrors }}</span>
      <span v-if="dataCollectionWarnings > 0" class="tw-mx-1"><i class="fa fa-exclamation-triangle orange"></i> {{ dataCollectionWarnings }}</span>
      <span v-if="dataCollectionInfo > 0" class="tw-ml-1"><i class="fa fa-info-circle green"></i> {{ dataCollectionInfo }}</span>
    </button>
    <span class="tw-flex-1 tw-mr-1">
      <span v-if="!isVisit">[<router-link :to="`/dc/visit/${visitLink}`">{{ visitLink }}</router-link>]{{ dataCollection['ST'] }} - </span>
      <button class="button tw-text-link-color" @click="$emit('toggle-file-path', dataCollectionIndex)"><i class="fa fa-caret-right"></i></button>&nbsp;<span>{{ filePath }}</span>
    </span>
    <span v-if="Number(dataCollection['ARCHIVED']) === 1" title="This data collection is archived and data is no longer available on disk"><i class="fa fa-archive r"></i></span>
  </div>

  <div v-else-if="headerType === 'load'">
    <h1>{{ dataCollection['ST'] }} - Robot {{ dataCollection['IMP'].toLowerCase() }} </h1>
    <p
      v-if="dataCollection['FILETEMPLATE'] && dataCollection['DIR'] !== 'null' && dataCollection['FILETEMPLATE'] !== dataCollection['DIR'] && dataCollection['DIR'] !== 'NR'"
      class="message alert tw-p-2 tw-mb-2 tw-rounded tw-bg-content-inactive">
      Barcode Mismatch - Sample: {{ dataCollection['FILETEMPLATE'] }} Read: {{ dataCollection['DIR'] }}
    </p>
  </div>

  <div v-else-if="headerType === 'edge'">
    <button class="button tw-mr-1 tw-text-link-color" @click="$emit('add-to-project', dataCollection)" title="Add to Project"><i class="fa fa-book"></i></button>
    <button :class="['button', dataCollection['FLAG'] ? 'button-highlight': '', 'tw-mr-1', 'tw-text-link-color']" @click="$emit('add-to-favorites', dataCollection)" title="Click to add this data collection to the list of favourite data collections"><i class="fa fa-star-o"></i></button>
    <router-link class="button tw-mr-1 tw-text-link-color" :to="`/dc/visit/${visitLink}/ty/edge/id/${dataCollection['ID']}`" title="Permalink"><i class="fa fa-link"></i></router-link>

    <span class="tw-flex-1 tw-mr-1">
      <span v-if="!isVisit">[<router-link :to="`/dc/visit/${visitLink}`">{{ visitLink }}</router-link>]{{ dataCollection['ST'] }} - </span>
      <span>{{ filePath }} Edge Scan</span>
    </span>
  </div>

  <div v-else-if="headerType === 'mca'">
    <button class="button tw-mr-1 tw-text-link-color" @click="$emit('add-to-project', dataCollection)" title="Add to Project"><i class="fa fa-book"></i></button>
    <button :class="['button', dataCollection['FLAG'] ? 'button-highlight': '', 'tw-mr-1', 'tw-text-link-color']" @click="$emit('add-to-favorites', dataCollection)" title="Click to add this data collection to the list of favourite data collections"><i class="fa fa-star-o"></i></button>
    <router-link class="button tw-mr-1 tw-text-link-color" :to="`/dc/visit/${visitLink}/ty/mca/id/${dataCollection['ID']}`" title="Permalink"><i class="fa fa-link"></i></router-link>

    <span class="tw-flex-1 tw-mr-1">
      <span v-if="!isVisit">[<router-link :to="`/dc/visit/${visitLink}`">{{ visitLink }}</router-link>]{{ dataCollection['ST'] }} - </span>
      <button class="button tw-text-link-color" @click="$emit('toggle-file-path', dataCollectionIndex)"><i class="fa fa-caret-right"></i></button>&nbsp;<span>{{ filePath }}</span>
    </span>
  </div>

  <div v-else-if="headerType === 'action'">
    <span class="tw-flex-1 tw-mr-1">
      <span v-if="!isVisit">[<router-link :to="`/dc/visit/${visitLink}`">{{ visitLink }}</router-link>]{{ dataCollection['ST'] }} - </span>
      <span>Sample {{ dataCollection['IMP'].toLowerCase() }}</span>
    </span>
  </div>
</template>
<script>
export default {
  name: 'data-collection-item-header',
  props: {
    dataCollectionIndex: {
      type: Number
    },
    headerType: {
      type: String,
      require: true
    },
    dataCollection: {
      type: Object,
      default: () => ({})
    },
    hasStatusMessage: {
      type: Boolean,
      default: false
    },
    dataCollectionErrors: {
      type: [Number, null],
      default: null
    },
    dataCollectionWarnings: {
      type: [Number, null],
      default: null
    },
    dataCollectionInfo: {
      type: [Number, null],
      default: null
    },
    visitLink: {
      type: String
    },
    filePath: {
      type: String
    },
    isVisit: {
      type: Boolean
    }
  },
  data() {
    return {
      headerTypes: ['grid', 'data']
    }
  },
}
</script>
<style></style>