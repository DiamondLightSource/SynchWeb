<template>
  <custom-list-item
    v-if="!isJson"
    width="100%"
  >
    <a :href="url">
      <i class="fa fa-file-pdf-o" />
      {{ attachment.RECORDTIMESTAMP }}"
    </a>
  </custom-list-item>
</template>

<script>
import attachment from 'modules/types/em/dc/ap/ice/attachment'
import CustomListItem from 'modules/types/em/components/custom-list-item.vue'

export default {
    'name': "PdfAttachment",
    'components': {
        'custom-list-item': CustomListItem,
    },
    'mixins': [attachment],
    'computed': {
        'url': function() {
            return this.$store.state.apiUrl + '/em/ice/pdf/' + this.attachment.ID
        },
        'itemText': function() {

        },
    },
}
</script>
