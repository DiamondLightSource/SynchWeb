<template>
  <div class="tw-w-full">
    <div class="tw-bg-modal-header-background tw-py-1 tw-pl-4 tw-pr-2 tw-rounded-sm tw-flex tw-w-full tw-justify-between tw-items-center tw-relative">
      <p class="tw-font-bold tw-text-link-color">Reprocess Data</p>
      <button
          class="tw-flex tw-items-center tw-border tw-rounded-sm tw-border-content-border tw-bg-white tw-text-content-page-color tw-p-1"
          @click="$emit('close-modal')">
        <i class="fa fa-times"></i>
      </button>
    </div>

    <div class="tw-w-full">
      <p class="help tw-mt-2" v-if="helpStatus">
        Select data sets to reintegrate by selecting a number of images in the DISTL plot. Provide unit cell parameters, space group, and high resolution cut off as needed.
      </p>

      <div class="tw-w-full tw-flex tw-justify-end tw-mt-2">
        <router-link :to="`/mc/visit/${visitNumber}`" class="button"><i class="fa fa-diamond"></i> Multi Crystal</router-link>
      </div>

      <div class="tw-w-full tw-flex tw-bg-table-pages-color tw-mt-2 tw-items-center tw-py-2 tw-px-1 tw-rounded">
        <base-input-checkbox outer-class="tw-w-48 tw-flex tw-items-center" v-model="processedIndividually" label="Process Individually" label-class="tw-ml-1"/>
        <div class="tw-flex tw-flex-1 tw-justify-between tw-items-center">
          <base-input-select
            v-model="selectedPipeline"
            initial-text="select a pipeline"
            label="Pipeline: "
            :options="pipelinesList"
            option-value-key=""
            option-text-key=""
            outer-class="tw-mx-1"
          />

          <div class="tw-flex tw-items-center">
            <base-input-text v-model="resolution" label="High Res: " outer-class="tw-mx-1 tw-flex" label-class="tw-mr-1 tw-flex tw-items-center"/>
            <span>&#197;</span>
          </div>

          <div class="tw-flex tw-items-center tw-justify-end">
            <button class="tw-mx-1 button" @click="openSpaceGroupOrCell">Space Group / Cell</button>
            <button class="tw-mx-1 button" @click="openOptions">Options</button>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import BaseInputCheckbox from 'app/components/base-input-checkbox.vue'
import BaseInputSelect from 'app/components/base-input-select.vue'
import BaseInputText from 'app/components/base-input-text.vue'

export default {
  name: 'data-collection-reprocess',
  components: {
    'base-input-text': BaseInputText,
    'base-input-select': BaseInputSelect,
    'base-input-checkbox': BaseInputCheckbox
  },
  props: {
    visitNumber: {
      type: String,
    }
  },
  data() {
    return {
      processedIndividually: false,
      pipelinesList: [],
      selectedPipeline: '',
      resolution: ''
    }
  },
  computed: {
    ...mapGetters({
      helpStatus: ['getHelpStatus']
    }),
    IDDataCollectionModel() {},
    IDDataCollections() {}
  },
  methods: {
    openSpaceGroupOrCell() {},
    openOptions() {}
  }
}
</script>

<style scoped>

</style>