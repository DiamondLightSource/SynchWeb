<template>
  <section class="content">

    <dialog-box />

    <h1 class="no_mobile">
      Data Collection {{ dataCollectionId }} for {{ visit }} on {{ beamline }}
    </h1>

    <all-collections-link />

    <h1 style="background-color: #ffa; padding: 20px;">
      TODO: astigmatism, estimated focus &amp; estimated resolution graphs
    </h1>
    <div class="data_collection" type="data">
      <data-collection-header
        v-if="dataCollection !== null"
        :data-collection="dataCollection"
      />
    </div>


  </section>
</template>

<script>
import AllCollectionsLink from 'modules/types/em/dc/all-collections-link.vue'
import DataCollectionHeader from 'modules/types/em/dc/data-collection-header.vue'
import DataCollectionModel from 'models/datacollection.js'
import DialogBox from 'app/components/dialogbox.vue'
import EventBus from 'app/components/utils/event-bus.js'

export default {
    'name': 'EmDcList',
    'components': {
        'all-collections-link': AllCollectionsLink,
        'data-collection-header': DataCollectionHeader,
        'dialog-box': DialogBox,
    },
    'props': {
        'dataCollectionId': {
            'type': String,
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
        }
    },
    'computed': {
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
        this.fetchDataCollectionModel()
    },
    'methods': {
        'fetchDataCollectionModel': function() {
            const component = this
            const fetchParams = {
                'ID': this.collectionId,
                'prop': this.$store.state.proposal.proposal
            }
            // eslint-disable-next-line no-unused-vars
            const successCallback = function(model, response, options) {
                component.$store.commit('loading', false)
                component.dataCollection = response
                console.log('fetched data collection', component.dataCollection)
                component.fetchAutoProcessingCollection()
            }
            // eslint-disable-next-line no-unused-vars
            const errorCallback = function(model, response, options) {
                component.$store.commit('loading', false)
                console.log(response.responseJSON)
                component.$store.commit('notifications/addNotification', {
                    'title': 'Error',
                    'message': 'Could not retrieve data collection',
                    'level': 'error'
                })
            }
            const fetch = function() {
                component.$store.commit('loading', true)
                // component.$store.dispatch('getModel', model)
                // doesn't currently support 'data':
                // hence the use of model.fetch here
                component.dataCollectionModel.fetch({
                    'data': fetchParams,
                    'success': successCallback,
                    'error': errorCallback,
                })
            }
            fetch()
        },
    },
}
</script>
