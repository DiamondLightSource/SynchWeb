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
        'fetchDataCollection': function() {
            this.clearTimeout()
            this.$store.commit('loading', true)
            this.$store.dispatch('em/api/fetch', {
                'url': 'dc/' + this.dataCollectionId,
                'humanName': 'Data Collection',
            }).then(
                (response) => {
                    this.dataCollection = response
                    if (this.dataCollection.archived == '0') {
                        this.timeout = setTimeout(
                            this.fetchDataCollection,
                            30000
                        )
                    }
                    this.fetchProcessingJobs()
                }
            ).finally(() => {
                this.$store.commit('loading', false)
            })
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
