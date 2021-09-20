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
      <relion-dialog />

      <data-collection-toolbar
        :data-collection-model="dataCollectionModel"
      />

      <data-collection-header :data-collection="dataCollection" />

      <processing-job
        v-for="job in processingJobs"
        :key="job.processingJobId + job.autoProcProgramId"
        :job="job"
      />
    </div>
  </section>
</template>

<script>
import DataCollectionHeader from 'modules/types/em/dc/data-collection-header.vue'
import DataCollectionModel from 'models/datacollection.js'
import DataCollectionToolbar from 'modules/types/em/dc-toolbar/dc-toolbar.vue'
import EventBus from 'app/components/utils/event-bus.js'
import FlatButton from 'app/components/flat-button.vue'
import ProcessingJob from 'modules/types/em/processing-jobs/processing-job.vue'
import RelionDialog from 'modules/types/em/relion/relion-dialog.vue'

export default {
    'name': 'EmDcList',
    'components': {
        'data-collection-header': DataCollectionHeader,
        'data-collection-toolbar': DataCollectionToolbar,
        'flat-button': FlatButton,
        'processing-job': ProcessingJob,
        'relion-dialog': RelionDialog,
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
        // Before removing this Backbone model, consider that there is still
        // some Marionette code operating on it in (e.g.) ../dc-toolbar/
        'dataCollectionModel': function() {
            return new DataCollectionModel({ 'ID': this.dataCollectionId })
        },
        'beamline': function() {
            return this.dataCollection ? this.dataCollection.BL : ''
        },
    },
    'watch': {
        'dataCollection': function() {
            if (!this.dataCollection) {
                return
            }
            EventBus.$emit('bcChange', [
                { 'title': 'Data Collections', 'url': '/dc' },
                { 'title': this.dataCollection.BL },
                { 'title': this.visit, 'url': '/dc/visit/' + this.visit },
                { 'title': 'Data Collection ' + this.dataCollectionId }
            ])
        },
        'processingJobs': function() {
            this.$store.commit('em/processingAllowedCheck', {
                'dataCollection': this.dataCollection,
                'processingJobs': this.processingJobs,
            })
        },
    },
    'mounted': function() {
        this.$store.commit('proposal/setVisit', this.visit)
        this.fetchDataCollection()
    },
    'beforeDestroy': function() {
        if (this.timeout !== null) {
            clearTimeout(this.timeout)
            this.timeout = null;
            console.log('cleared dataCollection fetch timer', this.timeout)
        }
    },
    'methods': {
        'fetchDataCollection': function() {
            this.$store.commit('loading', true)
            // Set a blank type to prevent url mangling by the Backbone model
            this.dataCollectionModel.set('TYPE', '')
            this.$store.dispatch('getModel', this.dataCollectionModel).then(
                (model) => {
                    this.dataCollection = model.attributes
                    console.log('fetched data collection', this.dataCollection)
                    if (this.dataCollection.ARCHIVED == '0') {
                        this.timeout = setTimeout(
                            this.fetchDataCollection,
                            30000
                        )
                    }
                    this.fetchProcessingJobs()
                },
                (error) => {
                    console.log('error fetching dataCollection', error)
                    this.$store.commit('notifications/addNotification', {
                        'title': 'Error',
                        'message': 'Could not retrieve data collection',
                        'level': 'error'
                    })
                }
            ).finally(() => {
                this.$store.commit('loading', false)
            })
        },
        'fetchProcessingJobs': function() {
            this.$store.dispatch('em/fetch', {
                'url': '/em/jobs/' + this.dataCollectionId +
                    '?currentPage=1&pageSize=500',
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
