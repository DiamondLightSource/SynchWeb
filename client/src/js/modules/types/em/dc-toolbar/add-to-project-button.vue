<template>
  <button-with-marionette-dialog
    icon="fa fa-book"
    button-text="Add to Project"
    dialog-title="Add to project"
    hint="Add to project"
    :m-view="mView"
    :m-view-options="mViewOptions"
  />
</template>

<script>
import AddToProjectView from 'modules/projects/views/addto'
import ButtonWithMarionetteDialog from 'modules/types/em/dc-toolbar/button-with-marionette-dialog.vue'

export default {
    'name': 'AddToProjectButton',
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
            return AddToProjectView
        },
        'mViewOptions': function() {
            return {
                'name': this.dataCollectionModel.get('DIR') +
                    this.dataCollectionModel.get('FILETEMPLATE'),
                'type': 'dc',
                'iid': this.dataCollectionModel.get('DCG')
            }
        },

    },
}
</script>
