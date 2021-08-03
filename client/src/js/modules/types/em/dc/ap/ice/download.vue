<template>
  <custom-list-item
    v-if="!attachment.hasPlot"
    width="100%"
  >
    <a
      href="#"
      @click.prevent="fetchFile"
    >
      <i
        v-if="attachment.extension == 'pdf'"
        class="fa fa-file-pdf-o"
      />
      {{ attachment.timeStamp }}
    </a>
  </custom-list-item>
</template>

<script>
import CustomListItem from 'modules/types/em/components/custom-list-item.vue'
import signUrl from 'modules/types/em/components/sign-url'

export default {
    'name': "Download",
    'components': {
        'custom-list-item': CustomListItem,
    },
    'mixins': [signUrl],
    'props': {
        'attachment': {
            'type': Object,
            'required': true,
        },
    },
    'methods': {
        'fetchFile': function() {
            const url = this.$store.state.apiUrl +
                '/em/attachment/' + this.attachment.id +
                '?prop=' + this.$store.state.proposal.proposal
            this.signUrl(url, function(signedUrl) {
                window.open(signedUrl, '_blank')
            })
        },
    },
}
</script>
