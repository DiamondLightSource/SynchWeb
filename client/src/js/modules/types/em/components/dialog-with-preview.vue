<template>
  <div>
    <dialog-modal
      v-if="showDialog"
      :show-dialog="showDialog"
      :title="title"
      @cancel="close"
    >
      <slot name="dialogContent" />
    </dialog-modal>

    <div
      class="preview-container"
      :title="previewHint"
      @click="show"
    >
      <div
        class="preview-heading"
        v-html="title"
      />
      <slot name="previewContent" />
    </div>
  </div>
</template>

<script>
import DialogModal from 'app/components/dialog-modal.vue'

export default {
    'name': "DialogWithPreview",
    'components': {
        'dialog-modal': DialogModal,
    },
    'props': {
        'title': {
            'type': String,
            'required': true,
        },
    },
    'data': function() {
        return {
            'showDialog': false,
        }
    },
    'computed': {
        'previewHint': function() {
            return 'Click to view ' + this.title
        },
    },
    'methods': {
        'show': function() {
            this.showDialog = true
        },
        'close': function() {
            this.showDialog = false
        },
    },
}
</script>

<style scoped>
.preview-heading {
    text-align: center;
    font-weight: bold;
    margin-bottom: 5px;
}
.preview-container {
    background-color: #fff;
    padding: 5px;
    border-radius: 6px;
}
</style>
