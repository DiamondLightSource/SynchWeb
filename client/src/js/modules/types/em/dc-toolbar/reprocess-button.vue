<template>
  <button-with-dialog
    icon-class="fa fa-cog"
    button-text="Reprocess"
    dialog-title="Run Relion Processing"
    :disabled="hintText != 'Run Relion processing'"
    :hint="hintText"
  >
    <relion-form :data-collection="dataCollection" />
  </button-with-dialog>
</template>

<script>
import ButtonWithDialog from 'modules/types/em/dc-toolbar/button-with-dialog.vue'
import RelionForm from 'modules/types/em/relion/relion-form.vue'

export default {
    'name': 'ReprocessesButton',
    'components': {
        'button-with-dialog': ButtonWithDialog,
        'relion-form': RelionForm
    },
    'props': {
        'dataCollection': {
            'type': Object,
            'required': true,
        },
        'autoProcessing': {
            'type': Array,
            'required': true,
        },
    },
    'computed': {
        'hintText': function () {
            if (this.dataCollection.ARCHIVED == '1') {
                return "Relion processing can't be run because this data collection is archived";
            }

            const blockingStatus = this.autoProcessing.reduce(function(result, job) {
                const status = job.PROCESSINGSTATUSDESCRIPTION
                return ['submitted', 'queued', 'running'].includes(status) ?
                    status : result
            }, '')
            if (blockingStatus) {
                return "Relion processing can't be run because there is already a job " +
                    blockingStatus + ' on this data collection'
            }

            return 'Run Relion processing';
        }
    },
}
</script>
