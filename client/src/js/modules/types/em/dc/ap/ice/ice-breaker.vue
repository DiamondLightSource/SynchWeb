<template>
  <processing-section
    section-title="Ice Breaker"
    :data-available="attachments !== null"
  >
    <parameter-list width="15%">
      <template v-for="(attachment, key) in attachments">
        <download
          v-if="key != 'id' && !attachment.hasChart"
          :key="attachment.id + 'p'"
          :attachment="attachment"
        />
      </template>
    </parameter-list>

    <template v-for="(attachment, key) in attachments">
      <plotly-dialog
        v-if="key != 'id' && attachment.hasChart"
        :key="attachment.id + 'h'"
        :title="attachment.chartData.titleText"
        :layout="attachment.chartData.layout"
        :chart-data="attachment.chartData.data"
      />
    </template>
  </processing-section>
</template>

<script>
import AttachmentsModel from 'modules/types/em/models/processing-attachments'
import Download from 'modules/types/em/dc/ap/ice/download.vue'
import ParameterList from '../../../components/parameter-list.vue'
import PlotlyDialog from 'modules/types/em/components/plotly-dialog.vue'
import ProcessingSection from 'modules/types/em/components/processing-section.vue'

export default {
    'name': "IceBreaker",
    'components': {
        'download': Download,
        'parameter-list': ParameterList,
        'plotly-dialog': PlotlyDialog,
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
