<template>
    <!-- This is a placeholder to show dialog boxes from marionette views -->
    <div id="custom-dialog" class="tw-fixed tw-w-full tw-h-full tw-bg-transparent tw-top-0 tw-z-50 tw-left-0 tw-table tw-bottom-0">
      <div class="tw-table-cell">
        <div class="tw-flex tw-flex-col tw-justify-center tw-min-h-screen">
          <div :class="{
            [widthClass]: true,
            'tw-h-auto': true,
            'tw-m-auto': true,
            'tw-border-content-border': true,
            'tw-rounded-sm': true,
            'tw-border': true,
            'tw-bg-white': true
          }">
            <div class="tw-p-1">
              <slot></slot>
            </div>
            <div class="tw-border-t tw-border-content-border tw-p-3 tw-flex tw-w-full tw-justify-end">
              <button v-if="!hideOkButton" class="ui-button ui-corner-all ui-widget tw-mr-px" @click="$emit('perform-modal-action')">Ok</button>
              <button class="ui-button ui-corner-all ui-widget tw-ml-px" @click="$emit('close-modal-action')">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
export default {
    name: 'CustomDialogBox',
    props: {
      size: {
        type: String,
        default: 'default'
      },
      hideOkButton: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        application: null
      }
    },
    computed: {
        widthClass() {
            const widthObject = {
                small: 'small-modal',
                default: 'default-modal',
                large: 'large-modal',
                'x-large': 'x-large-modal'
            }

            return widthObject[this.size]
        }
    }
}
</script>
<style scoped>
.small-modal {
  width: 300px;
}
.default-modal {
  width: 500px;
}
.large-modal {
  width: 800px;
}
.x-large-modal {
  width: 1140px;
}
</style>