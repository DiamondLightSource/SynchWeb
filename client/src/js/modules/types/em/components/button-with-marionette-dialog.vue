<template>
  <span>
    <toolbar-button
      :hint="hint"
      :icon="icon"
      :button-label="buttonLabel"
      :button-text="buttonText"
      :disabled="disabled"
      @click="open"
    />
    <dialog-marionette-view
      :m-view="mView"
      :options="mViewOptions"
      :show-dialog="showDialog"
      :title="dialogTitle"
      @confirm="close('confirm')"
      @cancel="close('cancel')"
    />
  </span>
</template>

<script>
import DialogMarionetteView from 'app/components/dialog-marionette-view.vue'
import ToolbarButton from 'modules/types/em/components/toolbar-button.vue'

export default {
    'name': 'ButtonWithMarionetteDialog',
    'components': {
        'toolbar-button': ToolbarButton,
        'dialog-marionette-view': DialogMarionetteView,
    },
    'props': {
        'icon': {
            'type': String,
            'required': true,
        },
        'buttonLabel': {
            'type': String,
            'default': '',
        },
        'buttonText': {
            'type': String,
            'required': true,
        },
        'dialogTitle': {
            'type': String,
            'required': true,
        },
        'hint': {
            'type': String,
            'required': true,
        },
        'mView': {
            'type': [Function, Promise],
            'required': true,
        },
        'mViewOptions': {
            'type': Object,
            'required': true,
        },
        'disabled': {
            'type': Boolean,
            'default': false,
        },
    },
    'data': function() {
        return {
            'showDialog': false,
        }
    },
    'methods': {
        'open': function() {
            this.$emit('open')
            this.showDialog = true
        },
        'close': function(event) {
            this.showDialog = false
            this.$emit(event)
        },
    },
}
</script>
