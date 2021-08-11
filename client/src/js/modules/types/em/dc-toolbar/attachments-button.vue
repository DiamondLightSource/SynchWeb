<template>
  <button-with-dialog
    icon-class="fa fa-file"
    :button-label="count.toString()"
    :button-text="countLabel"
    dialog-title="Attachments"
    hint="Attachments"
    :m-view="mView"
    :m-view-options="mViewOptions"
  />
</template>

<script>
import AttachmentsView from 'modules/dc/views/attachments'
import ButtonWithDialog from 'modules/types/em/dc-toolbar/button-with-dialog.vue'

export default {
    'name': 'AttachmentsButton',
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
            return parseInt(this.dataCollectionModel.get('DCAC'), 10)
        },
        'countLabel': function() {
            return 'Attachment' + (this.count != 1 ? 's' : '')
        },
        'mView': function() {
            return AttachmentsView
        },
        'mViewOptions': function() {
            return this.dataCollectionModel.get('DCC') > 1 ?
                { 'dcg': this.dataCollectionModel.get('DCG') } :
                { 'id': this.dataCollectionModel.get('ID') }
        },
    },
}
</script>


