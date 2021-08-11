<template>
  <button-with-dialog
    icon-class="fa fa-book"
    button-text="Add to Project"
    dialog-title="Add to project"
    hint="Add to project"
    :m-view="mView"
    :m-view-options="mViewOptions"
  />
</template>

<script>
import AddToProjectView from 'modules/projects/views/addto'
import ButtonWithDialog from 'modules/types/em/dc-toolbar/button-with-dialog.vue'

export default {
    'name': 'AddToProjectButton',
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
