<template>
  <div class="tw-w-full">
    <div class="tw-bg-modal-header-background tw-py-1 tw-pl-4 tw-pr-2 tw-rounded-sm tw-flex tw-w-full tw-justify-between tw-items-center tw-relative">
      <p class="tw-font-bold tw-text-link-color">Attachments</p>
      <button
          class="tw-flex tw-items-center tw-border tw-rounded-sm tw-border-content-border tw-bg-white tw-text-content-page-color tw-p-1"
          @click="$emit('close-modal')">
        <i class="fa fa-times"></i>
      </button>
    </div>

    <div class="tw-w-full content">
      <h1 class="tw-mb-2">Attachments</h1>

      <p class="help tw-mb-2">This page lists all attachments for the selected data collection</p>

      <div class="tw-w-full">

      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "data-collection-attachments"
}
</script>

<style scoped>

</style>