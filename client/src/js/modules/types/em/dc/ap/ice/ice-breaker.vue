<template>
  <processing-section
    section-title="Ice Breaker"
    :data-available="attachments !== null"
  >
    <parameter-list width="15%">
      <template v-for="(attachment, key) in attachments">
        <download
          v-if="key != 'id' && !attachment.hasPlot"
          :key="attachment.id + 'p'"
          :attachment="attachment"
        />
      </template>
    </parameter-list>

    <template v-for="(attachment, key) in attachments">
      <histogram
        v-if="key != 'id' && attachment.hasPlot"
        :key="attachment.id + 'h'"
        :attachment="attachment"
      />
    </template>
  </processing-section>
</template>

<script>
import AttachmentsModel from 'modules/types/em/models/processing-attachments'
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
        'attachmentsModel': function() {
            return new AttachmentsModel({ 'id': this.autoProcProgramId })
        },
    },
    'mounted': function() {
        this.fetchAttachments()
    },
    'methods': {
        'fetchAttachments': function() {
            if (!this.autoProcProgramId) {
                return
            }
            this.$store.commit('loading', true)
            this.$store.dispatch('getModel', this.attachmentsModel).then(
                (attachmentsModel) => {
                    this.attachments = attachmentsModel.attributes
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
