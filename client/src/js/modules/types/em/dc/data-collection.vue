<template>
  <section class="content">
    <h1 class="no_mobile">
      Data Collection {{ dataCollectionId }} for {{ visit }} on {{ beamline }}
    </h1>

    <toolbar />

    <h1 style="background-color: #ffa; padding: 20px;">
      TODO: astigmatism, estimated focus &amp; estimated resolution graphs
    </h1>

    <h1 class="message nou">
      <a
        class="button"
        :href="allCollectionsUrl"
      >View All Data Collections</a>
    </h1>

    <data-collection-header :data-collection="dataCollection" />
  </section>
</template>

<script>
import DataCollectionModel from 'models/datacollection.js'
import EventBus from 'app/components/utils/event-bus.js'
import DataCollectionHeader from 'modules/types/em/dc/data-collection-header.vue'

export default {
    'name': 'EmDcList',
    'components': {
        'data-collection-header': DataCollectionHeader,
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
        'allCollectionsUrl': function() {
            var url = '/dc'
            if (this.isVisit) {
                url = url + '/visit/' + this.$store.state.proposal.visit
            }
            return url
        },
    },
    'mounted': function() {
        this.$store.commit('proposal/setVisit', this.visit)
        const model = new DataCollectionModel({
            'ID': this.collectionId
        })
        const component = this
        const fetchDataCollectionModel = function() {
            component.$store.commit('loading', true)
            component.$store.dispatch('getModel', model).then(
                (model) => {
                    component.dataCollection = model.attributes
                    component.setBreadcrumbs()
                    console.log(model)
                    component.$store.commit('loading', false)
                },
                (error) => {
                    console.log(error)
                    component.$store.commit('loading', false)
                    component.$store.commit('notifications/addNotification', {
                        'title': 'Error',
                        'message': 'Could not retrieve data collection',
                        'level': 'error'
                    })
                }
            )
        }

        fetchDataCollectionModel()
    },
    'methods': {
        'setBreadcrumbs': function() {
            EventBus.$emit('bcChange', [
                { 'title': 'Data Collections', 'url': '/dc' },
                { 'title': this.dataCollection.BL },
                { 'title': this.visit, 'url': '/dc/visit/' + this.visit },
                { 'title': 'Data Collection ' + this.dataCollectionId }
            ])
        },
    },
}
</script>
