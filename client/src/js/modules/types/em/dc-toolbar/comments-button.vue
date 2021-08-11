<template>
  <button-with-dialog
    icon-class="fa fa-comments"
    :button-label="count.toString()"
    :button-text="countLabel"
    dialog-title="Comments"
    hint="Comments"
    :m-view="mView"
    :m-view-options="mViewOptions"
  />
</template>

<script>
import DCCommentsView from 'modules/dc/views/dccomments'
import ButtonWithDialog from 'modules/types/em/dc-toolbar/button-with-dialog.vue'

export default {
    'name': 'CommentsButton',
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
        'count': function() {
            return parseInt(this.dataCollectionModel.get('DCCC'), 10)
        },
        'countLabel': function() {
            return 'Comment' + (this.count != 1 ? 's' : '')
        },
        'mView': function() {
            return DCCommentsView
        },
        'mViewOptions': function() {
            return { 'model': this.dataCollectionModel }
        },
    },
}
</script>

