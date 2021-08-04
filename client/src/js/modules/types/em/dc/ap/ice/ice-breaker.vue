<template>
  <processing-section
    section-title="Ice Breaker"
    :data-available="attachments !== null"
  >
    <parameter-list width="15%">
      <template v-for="attachment in attachments">
        <download
          v-if="!attachment.attributes.hasPlot"
          :key="attachment.attributes.id + 'p'"
          :attachment="attachment.attributes"
        />
      </template>
    </parameter-list>

    <template v-for="attachment in attachments">
      <histogram
        v-if="attachment.attributes.hasPlot"
        :key="attachment.attributes.id + 'h'"
        :attachment="attachment.attributes"
      />
    </template>
  </processing-section>
</template>

<script>
import AttachmentsCollection from 'modules/types/em/collections/processing-attachments'
import Download from 'modules/types/em/dc/ap/ice/download.vue'
import Histogram from 'modules/types/em/dc/ap/ice/histogram.vue'
import ParameterList from '../../../components/parameter-list.vue'
import ProcessingSection from 'modules/types/em/components/processing-section.vue'

export default {
    'name': "IceBreaker",
    'components': {
        'histogram': Histogram,
        'parameter-list': ParameterList,
        'download': Download,
        'processing-section': ProcessingSection,
    },
    'props': {
        'autoProcProgramId': {
            'type': Number,
            'required': true,
        },
    },
    'data': function() {
        return {
            'attachments': null,
        }
    },
    'computed': {
        'attachmentsCollection': function() {
            return new AttachmentsCollection(null, {
                'id': this.autoProcProgramId
            })
        },
    },
    'mounted': function() {
        this.fetchAttachments()
    },
    'methods': {
        'fetchAttachments': function() {
            this.$store.commit('loading', true)
            this.$store.dispatch('getCollection', this.attachmentsCollection).then(
                (attachmentsCollection) => {
                    this.attachments = attachmentsCollection.models
                    console.log('attachments', this.attachments)
                    this.$store.commit('loading', false)
                },
                () => {
                    this.$store.commit('notifications/addNotification', {
                        'title': 'Error',
                        'message': 'Could not retrieve data collections',
                        'level': 'error'
                    })
                    this.$store.commit('loading', false)

                }
            )
        },
    },
}
</script>
