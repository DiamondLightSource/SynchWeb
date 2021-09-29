<template>
  <span>
    <toolbar-button
      icon="fa fa-plus"
      button-text="Add data Collection"
      :show-text="showText"
      :hint="hint"
      :disabled="hint !== 'Add data collection'"
      @click="showDialog = true"
    />
    <data-collection-dialog
      :show-dialog="showDialog"
      @cancel="showDialog = false"
    />
  </span>
</template>

<script>
import ToolbarButton from 'modules/types/em/components/toolbar-button.vue'
import DataCollectionDialog from 'modules/types/em/dc-list/data-collection-dialog.vue'

export default {
    'name': 'NewDataCollection',
    'components': {
        'toolbar-button': ToolbarButton,
        'data-collection-dialog': DataCollectionDialog,
    },
    'props': {
        'showText': {
            'type': Boolean,
            'default': false,
        },
        'reason': {
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
        'hint': function () {
            return this.reason === '' ? 'Add data collection' :
                this.reason + ' - No more data collections possible'
        }
    },
}
</script>
