<template>
  <section class="content">
    <dialog-box />

    <h1 class="no_mobile">
      Data Collection {{ dataCollectionId }} for {{ visit }} on {{ beamline }}
    </h1>

    <all-collections-link />

    <div class="data-collection">
      <data-collection-toolbar
        v-if="dataCollection !== null"
        :data-collection="dataCollection"
        :data-collection-model="dataCollectionModel"
      />

      <data-collection-header
        v-if="dataCollection !== null"
        :data-collection="dataCollection"
      />

      <processing-job
        v-for="job in autoProcessing"
        :key="job.PROCESSINGJOBID + job.AUTOPROCPROGRAMID"
        :job="job"
        :data-collection-id="dataCollectionId"
      />
    </div>
  </section>
</template>

<script>
import AllCollectionsLink from 'modules/types/em/dc/all-collections-link.vue'
import ProcessingJobsCollection from 'modules/types/em/collections/processingjobs'
import DataCollectionHeader from 'modules/types/em/dc/data-collection-header.vue'
import DataCollectionModel from 'models/datacollection.js'
import DataCollectionToolbar from 'modules/types/em/dc/dc-toolbar.vue'
import DialogBox from 'app/components/dialogbox.vue'
import EventBus from 'app/components/utils/event-bus.js'
import ProcessingJob from 'modules/types/em/dc/ap/processing-job.vue'

export default {
    'name': 'EmDcList',
    'components': {
        'all-collections-link': AllCollectionsLink,
        'data-collection-header': DataCollectionHeader,
        'data-collection-toolbar': DataCollectionToolbar,
        'dialog-box': DialogBox,
        'processing-job': ProcessingJob,
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
            'autoProcessing': null,
        }
    },
    'computed': {
        'dataCollectionModel': function() {
            return new DataCollectionModel()
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
            if (this.dataCollection) {
                EventBus.$emit('bcChange', [
                    { 'title': 'Data Collections', 'url': '/dc' },
                    { 'title': this.dataCollection.BL },
                    { 'title': this.visit, 'url': '/dc/visit/' + this.visit },
                    { 'title': 'Data Collection ' + this.dataCollectionId }
                ])
            }
        },
    },
    'mounted': function() {
        this.$store.commit('proposal/setVisit', this.visit)
        this.fetchDataCollection()
    },
    'methods': {
        'fetchDataCollection': function() {
            const vm = this
            const fetchParams = {
                'ID': this.collectionId,
                'prop': this.$store.state.proposal.proposal
            }
            const successCallback = function(
                model, // eslint-disable-line no-unused-vars
                response,
                options // eslint-disable-line no-unused-vars
            ) {
                vm.$store.commit('loading', false)
                vm.dataCollection = response
                console.log('fetched data collection', vm.dataCollection)
                vm.fetchAutoProcessingCollection()
                // if (this.model.get('ACTIVE') == 1) {
                    // TODO: this was / should be (???) 10 seconds, not 30!
                    //setTimeout(fetch, 30 * 1000)
                //}
            }
            const errorCallback = function(
                model, // eslint-disable-line no-unused-vars
                response,
                options // eslint-disable-line no-unused-vars
            ) {
                vm.$store.commit('loading', false)
                console.log(response.responseJSON)
                vm.$store.commit('notifications/addNotification', {
                    'title': 'Error',
                    'message': 'Could not retrieve data collection',
                    'level': 'error'
                })
            }
            const fetch = function() {
                vm.$store.commit('loading', true)
                /* TODO: [SCI-9935]
                   vm.$store.dispatch('getModel', model)
                   doesn't currently support 'data': */
                vm.dataCollectionModel.fetch({
                    'data': fetchParams,
                    'success': successCallback,
                    'error': errorCallback,
                })
            }
            fetch()
        },
        'fetchAutoProcessingCollection': function() {
            const vm = this
            // eslint-disable-next-line no-unused-vars
            const successCallback = function(model, response, options) {
                vm.autoProcessing = response.data
                console.log('fetched autopProcessing', vm.autoProcessing)
                vm.$store.commit('loading', false)
            }
            // eslint-disable-next-line no-unused-vars
            const errorCallback = function(model, response, options) {
                console.log(response.responseJSON)
                vm.$store.commit('loading', false)
                vm.$store.commit('notifications/addNotification', {
                    'title': 'Error',
                    'message': 'Could not retrieve data collection',
                    'level': 'error'
                })
            }
            this.$store.commit('loading', true)
            this.processingJobsCollection.fetch({
                'success': successCallback,
                'error': errorCallback,
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
