<template>
  <button-with-dialog
    icon-class="fa fa-cog"
    button-text="Reprocess"
    dialog-title="Reprocesses"
    hint="Reprocess"
    :m-view="mView"
    :m-view-options="mViewOptions"
  />
</template>

<script>
import ButtonWithDialog from 'modules/types/em/dc-toolbar/button-with-dialog.vue'
import ReprocessView from 'modules/dc/views/reprocess2'

export default {
    'name': 'ReprocessesButton',
    'components': {
        'button-with-dialog': ButtonWithDialog,
    },
    'props': {
        'dataCollectionModel': {
            'type': Object,
            'required': true,
        },
    },
    'computed': {
        'mView': function() {
            return ReprocessView
        },
        'mViewOptions': function() {
            return {
                'model': this.dataCollectionModel,
                'visit': this.visit,
            }
        },
    },
}
</script>
