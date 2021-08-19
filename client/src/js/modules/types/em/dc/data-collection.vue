<template>
  <section class="content">
    <h1 class="no_mobile">
      Data Collection {{ dataCollectionId }} for {{ visit }} on {{ beamline }}
    </h1>

    <h1 class="message nou">
      <a
        class="button"
        :href="'/dc/visit/' + visit"
      >View All Data Collections</a>
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
        :key="job.PROCESSINGJOBID + job.AUTOPROCPROGRAMID"
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
import ProcessingJob from 'modules/types/em/processing-jobs/processing-job.vue'
import ProcessingJobsCollection from 'modules/types/em/collections/processingjobs'
import RelionDialog from 'modules/types/em/relion/relion-dialog.vue'

export default {
    'name': 'EmDcList',
    'components': {
        'data-collection-header': DataCollectionHeader,
        'data-collection-toolbar': DataCollectionToolbar,
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
        }
    },
    'computed': {
        'dataCollectionModel': function() {
            return new DataCollectionModel({ 'ID': this.dataCollectionId })
        },
        'processingJobsCollection': function() {
            return new ProcessingJobsCollection(null, {
                'state': {
                    'currentPage': 1, // TODO: pagination
                    'pageSize': 15, // TODO: pagination
                    'dataCollection': this.dataCollectionId,
                }
            })
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
    'methods': {
        'fetchDataCollection': function() {
            const vm = this
            vm.$store.commit('loading', true)
            // prevent url mangling by the Backbone model
            this.dataCollectionModel.set('TYPE', '')
            vm.$store.dispatch('getModel', this.dataCollectionModel).then(
                function(model) {
                    vm.dataCollection = model.attributes
                    console.log('fetched data collection', vm.dataCollection)
                    if (vm.dataCollection.ARCHIVED == '0') {
                        // TODO: this was / should be (???) 10 seconds, not 30!
                        setTimeout(vm.fetchDataCollection, 30 * 1000)
                    }
                    vm.fetchProcessingJobsCollection()

                },
                function(error) {
                    console.log('error fetching dataCollection', error)
                    vm.$store.commit('notifications/addNotification', {
                        'title': 'Error',
                        'message': 'Could not retrieve data collection',
                        'level': 'error'
                    })
                }
            ).finally(function() {
                vm.$store.commit('loading', false)
            })
        },
        'fetchProcessingJobsCollection': function() {
            const vm = this
            vm.$store.commit('loading', true)
            vm.$store.dispatch(
                'getCollection', this.processingJobsCollection
            ).then(
                function(result) {
                    vm.processingJobs = result.map(function(jobModel) {
                        return jobModel.attributes
                    })
                    console.log('fetched processing jobs', vm.processingJobs)
                },
                function(error) {
                    console.log('error fetching processing jobs', error)
                    vm.$store.commit('notifications/addNotification', {
                        'title': 'Error',
                        'message': 'Could not retrieve processing jobs',
                        'level': 'error'
                    })
                }
            ).finally(function() {
                vm.$store.commit('loading', false)
            })
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
