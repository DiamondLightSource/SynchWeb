<template>
  <section class="content">
    <h1 class="no_mobile">
      Data Collection {{ dataCollectionId }} for {{ visit }} on {{ beamline }}
    </h1>

    <h1 class="nou">
      <flat-button @click="$router.push('/dc/visit/' + visit)">
        View All Data Collections
      </flat-button>
    </h1>

    <div
      v-if="dataCollection !== null"
      class="data-collection"
    >
      <relion-dialog :data-collection="dataCollection" />

      <toolbar
        :data-collection="dataCollection"
        :processing-disallowed-reason="processingDisallowedReason"
        @fetch="fetchDataCollection"
      />

      <parameter-list-with-schema
        schema-name="Data Collection Schema"
        schema-url="dc/schema/"
        :parameters="dataCollection"
      />

      <processing-job
        v-for="processingJob in processingJobs"
        :key="processingJob.autoProcProgramId"
        :processing-job="processingJob"
        :collection-active="dataCollection.archived != '1'"
        :processing-allowed="processingDisallowedReason == ''"
        :default-hidden="processingJobs.length > 1"
      />
    </div>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import EventBus from 'app/components/utils/event-bus.js'
import FlatButton from 'app/components/flat-button.vue'
import ParameterListWithSchema from 'modules/types/em/components/parameter-list-with-schema.vue'
import ProcessingJob from 'modules/types/em/processing-jobs/processing-job.vue'
import RelionDialog from 'modules/types/em/relion/relion-dialog.vue'
import Toolbar from 'modules/types/em/dc/toolbar.vue'

export default {
    'name': 'EmDcList',
    'components': {
        'flat-button': FlatButton,
        'parameter-list-with-schema': ParameterListWithSchema,
        'processing-job': ProcessingJob,
        'relion-dialog': RelionDialog,
        'toolbar': Toolbar,
    },
    'props': {
        'dataCollectionId': {
            'type': Number,
            'required': true,
        },
        'visit': {
            'type': String,
            'required': true,
        }
    },
    'data': function() {
        return {
            'dataCollection': null,
            'processingJobs': [],
            'timeout': null,
        }
    },
    'computed': {
        ...mapGetters({
            'processingDialogVisible': 'em/processing/dialogVisible',
        }),
        'beamline': function() {
            return this.dataCollection ? this.dataCollection.beamLineName : ''
        },
        'processingDisallowedReason': function() {
            const prefix = "Relion processing can't be run because "
            if (this.dataCollection.archived == '1') {
                return prefix + 'this data collection is archived'
            }
            const blockingStatus = this.processingJobs.reduce(
                function(result, job) {
                    const status = job.processingStatusDescription
                    return [
                        'submitted',
                        'queued',
                        'running'
                    ].includes(status) ? status : result
                },
                ''
            )
            if (blockingStatus) {
                return prefix +
                    'there is already a job ' + blockingStatus +
                    ' on this data collection'
            }
            return ''
        },
    },
    'watch': {
        'dataCollection': function() {
            if (!this.dataCollection) {
                return
            }
            EventBus.$emit('bcChange', [
                { 'title': 'Data Collections', 'url': '/dc' },
                { 'title': this.dataCollection.beamLineName },
                { 'title': this.visit, 'url': '/dc/visit/' + this.visit },
                { 'title': 'Data Collection ' + this.dataCollectionId }
            ])
        },
    },
    'mounted': function() {
        this.$store.commit('proposal/setVisit', this.visit)
        this.fetchDataCollection()
    },
    'beforeDestroy': function() {
        this.clearTimeout()
    },
    'methods': {
        'clearTimeout': function() {
            if (this.timeout !== null) {
                clearTimeout(this.timeout)
                this.timeout = null;
                console.log('cleared dataCollection fetch timer', this.timeout)
            }
        },
        'setTimeout': function() {
            if (this.dataCollection.archived == '0') {
                console.log('set timeout for dataCollection reload')
                this.timeout = setTimeout(
                    this.fetchDataCollection,
                    30000
                )
            }
        },
        'fetchDataCollection': function() {
            this.clearTimeout()
            if (this.processingDialogVisible) {
                /*  There's nothing to be gained from updating the
                    dataCollection whilst the processing dialog is visible.
                    Quite the reverse, updating the data collection can
                    update the defaults for the processing dialog, which will
                    overwrite the user's choices and become rather frustrating
                */
                console.log('skipping dataCollection update - processing dialog is visible')
                this.setTimeout()
                return
            }

            this.$store.dispatch('em/api/fetch', {
                'url': 'dc/' + this.dataCollectionId,
                'humanName': 'Data Collection',
            }).then(
                (response) => {
                    this.dataCollection = response
                    this.fetchProcessingJobs()
                    this.setTimeout()
                }
            )
        },
        'fetchProcessingJobs': function() {
            this.$store.dispatch('em/api/fetch', {
                'url': 'jobs/' + this.dataCollectionId +
                    '?currentPage=1&pageSize=500', // TODO
                'humanName': 'Processing jobs',
            }).then(
                (response) => {
                    this.processingJobs = response.data
                }
            )
        },
    },
}
</script>

<style scoped>
/* data_collection (with an underscore) will bind to "old-style" styles
   and mess up some of the "new-style" styles, we're using here */
.data-collection {
    padding: 10px;
    border-radius: 6px;
    margin-bottom: 15px;
    background: #efefef;
    border-width: 1px;
    border-style: solid;
    border-color: #e2e2e2;
}
</style>
