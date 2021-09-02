<template>
  <div :title="containerTitle">
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
      :title="containerTitle"
      @click="show"
    >
      <div class="preview-heading">
        {{ title }}
      </div>
      <slot name="previewContent" />
    </div>
  </div>
</template>

<script>
import DialogModal from 'app/components/dialog-modal.vue'
import proportionalHeight from 'modules/types/em/components/proportional-height'

export default {
    'name': "DialogWithPreview",
    'components': {
        'dialog-modal': DialogModal,
    },
    'mixins': [proportionalHeight],
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
        'containerTitle': function() {
            return 'Click to view ' + this.title
        },
    },
    'methods': {
        'maxSizeStyle': function(widthProperty, heightProperty) {
            return widthProperty + ': ' + (
                window.innerWidth - window.innerWidth / 10
            ) + 'px; ' + heightProperty + ': ' + (
                window.innerHeight - window.innerHeight / 5
            ) + 'px;'
        },
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
