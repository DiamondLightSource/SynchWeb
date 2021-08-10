<template>
  <processing-section
    section-title="Ice Breaker"
    :data-available="attachments.length > 0"
  >
    <parameter-list width="15%">
      <template v-for="(attachment, key) in attachments">
        <download
          v-if="key != 'id' && attachment.chartData === null"
          :key="attachment.id + 'p'"
          :attachment="attachment"
        />
      </template>
    </parameter-list>

    <template v-for="(attachment, key) in attachments">
      <plotly-dialog
        v-if="key != 'id' && attachment.chartData !== null"
        :key="attachment.id + 'h'"
        :title="attachment.chartData.titleText"
        :layout="attachment.chartData.layout"
        :chart-data="attachment.chartData.data"
      />
    </template>
  </processing-section>
</template>

<script>
import Download from 'modules/types/em/ice/download.vue'
import ParameterList from 'modules/types/em/components/parameter-list.vue'
import PlotlyDialog from 'modules/types/em/components/plotly-dialog.vue'
import ProcessingSection from 'modules/types/em/components/processing-section.vue'
import ViewModel from 'modules/types/em/ice/view-model.js'

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
        return ViewModel.defaultData()
    },
    'mounted': function() {
        this.fetchData()
    },
    'methods': {
        'fetchData': function() {
            // If this job has not yet run, autoProcProgramId "doesn't exist"
            if (!this.autoProcProgramId) {
                return
            }
            ViewModel.fetch(this.$store, this.autoProcProgramId).then(
                (attachments) => { this.attachments = attachments }
            )
        },
    },
}
</script>
