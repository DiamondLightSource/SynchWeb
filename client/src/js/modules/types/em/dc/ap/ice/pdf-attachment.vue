<template>
  <li
    v-if="!isJson"
  >
    <a :href="url">
      <i class="fa fa-file-pdf-o" />
      {{ attachment.RECORDTIMESTAMP }}
    </a>
  </li>
</template>

<script>
import attachment from 'modules/types/em/dc/ap/ice/attachment'

export default {
    'name': "PdfAttachment",
    'mixins': [attachment],
    'computed': {
        'url': function() {
            return this.$store.state.apiUrl +
                '/em/ice/pdf/' + this.attachment.ID
        }
    },
}
</script>
