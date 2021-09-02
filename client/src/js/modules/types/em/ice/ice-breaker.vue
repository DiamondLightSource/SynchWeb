<template>
  <processing-section
    section-title="Ice Breaker"
    :data-available="attachments.length > 0"
  >
    <parameter-list width="15%">
      <template v-for="(attachment, key) in attachments">
        <download
          v-if="attachment.chartData === null"
          :key="attachment.id + 'p'"
          :attachment="attachment"
        />
      </template>
    </parameter-list>

    <template v-for="(attachment, key) in attachments">
      <dialog-plotly
        v-if="attachment.chartData !== null"
        :key="attachment.id + 'h'"
        :title="attachment.chartData.titleText"
        :layout="attachment.chartData.layout"
        :chart-data="attachment.chartData.data"
        width="400px"
      />
    </template>
  </processing-section>
</template>

<script>
import DialogPlotly from 'modules/types/em/components/dialog-plotly.vue'
import Download from 'modules/types/em/ice/download.vue'
import ParameterList from 'modules/types/em/components/parameter-list.vue'
import ProcessingSection from 'modules/types/em/components/processing-section.vue'

export default {
    'name': "IceBreaker",
    'components': {
        'dialog-plotly': DialogPlotly,
        'download': Download,
        'parameter-list': ParameterList,
        'processing-section': ProcessingSection,
    },
    'props': {
        'autoProcProgramId': {
            'type': Number,
            'required': true,
        },
    },
    'data': function() {
        return { 'attachments': [] }
    },
    'mounted': function() {
        // If this job has not yet run, autoProcProgramId "doesn't exist"
        if (!this.autoProcProgramId) {
            return
        }
        this.$store.dispatch('em/fetch', {
            'url': '/em/attachments/' + this.autoProcProgramId,
            'humanName': 'Ice Breaker attachments',
        }).then(
            (response) => {
                this.attachments = response.map(this.parseSingleAttachment)
            }
        )
    },
    'methods': {
        'parseSingleAttachment': function(attachment) {
            const fileName = attachment.file
            const json = attachment.JSON
            return {
                'id': attachment.autoProcProgramAttachmentId,
                'timeStamp': attachment.recordTimeStamp,
                'fileName': fileName,
                'extension': fileName.split('.').pop(),
                'fileType': attachment.fileType,
                'chartData': json ? this.parseSingleChart(json) : null,
            }
        },
        'parseSingleChart': function(json) {
            if (!json) {
                return ''
            }
            const chartData = JSON.parse(json)
            const layout = chartData.layout
            // layout and data elements for plotly charts are passed between
            // components as JSON... If left as plain objects or arrays, Vue will
            // "pollute" them with observers... and when we're looking at arrays
            // with thousands of elements that has a huge impact
            return {
                'layout': {
                    'barmode': layout.barmode,
                    'xaxis': layout.xaxis,
                    'yaxis': layout.yaxis,
                    'margin': { 'l': 50, 'r': 10, 'b': 50, 't': 10 },
                },
                'data': chartData.data,
                'titleText': layout.title.text
            }
        },
    },
}
</script>
