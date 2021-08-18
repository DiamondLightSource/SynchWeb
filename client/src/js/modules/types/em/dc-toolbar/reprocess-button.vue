<template>
  <button-with-function
    icon-class="fa fa-cog"
    button-text="Reprocess"
    :disabled="hintText != 'Run Relion processing'"
    :hint="hintText"
    @click="click"
  />
</template>

<script>
import ButtonWithFunction from 'modules/types/em/dc-toolbar/button-with-function.vue'

export default {
    'name': 'ReprocessesButton',
    'components': {
        'button-with-function': ButtonWithFunction,
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
    'methods': {
        'click': function() {
            this.$store.commit('em/showProcessingDialog', true)
        }
    },
}
</script>
