<template>
  <div>
    <div class="tw-bg-modal-header-background tw-py-1 tw-pl-4 tw-pr-2 tw-rounded-sm tw-flex tw-w-full tw-justify-between tw-items-center tw-relative">
      <p class="tw-font-bold tw-text-link-color">Add To Projects</p>
      <button
        class="tw-flex tw-items-center tw-border tw-rounded-sm tw-border-content-border tw-bg-white tw-text-content-page-color tw-p-1"
        @click="$emit('close-add-projects-modal')">
        <i class="fa fa-times"></i>
      </button>
    </div>
    <div class="tw-py-3 tw-px-4">
      <p>Item: <span class="tw-text-link-color">{{ item }}</span></p>
      <base-input-select
        class="tw-mt-4"
        :options="projectList"
        option-text-key="ACRONYM"
        option-value-key="PROJECTID"
        :value="selectedValue"
        label="Select a project:"
        default-text="select one"
        @input="$emit('update-selected-project', $event)"
      />
    </div>
  </div>
</template>

<script>
import BaseInputSelect from 'app/components/base-input-select.vue'

export default {
  name: "add-to-project",
  components: {BaseInputSelect},
  props: {
    item: {
      type: String,
      required: true
    },
    selectedValue: {
      type: [Number, String],
      default: ''
    },
    projectList: {
      type: Array,
      default: () => ([])
    },
  }
}
</script>

<style scoped>

</style>