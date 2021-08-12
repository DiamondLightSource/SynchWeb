<template>
  <button-with-marionette-dialog
    icon-class="fa fa-cog"
    button-text="Reprocess"
    dialog-title="Reprocesses"
    :disabled="dataCollectionModel.get('ARCHIVED') == '1'"
    hint="Reprocess"
    :m-view="mView"
    :m-view-options="mViewOptions"
  />
</template>

<script>
import ButtonWithMarionetteDialog from 'modules/types/em/dc-toolbar/button-with-marionette-dialog.vue'
import ReprocessView from 'modules/dc/views/reprocess2'

export default {
    'name': 'ReprocessesButton',
    'components': {
        'button-with-marionette-dialog': ButtonWithMarionetteDialog,
    },
    'props': {
        'dataCollectionModel': {
            'type': Object,
            'required': true,
        },
    },
    'computed': {
        'mView': function() {
            // TODO: this view has a template for EM
            // TODO: but it'd probably be better to use James' /relion/ stuff
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
