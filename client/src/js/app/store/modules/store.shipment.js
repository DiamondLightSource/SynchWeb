import Backbone from 'backbone'
import ContainerModel from 'models/container'
import formatDate from 'date-fns/format'


const shipmentModule = {
  namespaced: true,
  state: {
    container: {},
    containerModel: new ContainerModel()
  },
  getters: {},
  mutations: {},
  actions: {
    async queueContainer({ commit, state, rootState }, { CONTAINERID }) {
      // We want to pass in the container Id for now and then return the response to the component to do other changes.
      return new Promise( (resolve) => {
        Backbone.ajax({
          url: rootState.apiUrl + '/shipment/containers/queue',
          data: {
            CONTAINERID
          },
          success: function (resp) {
            resolve(resp)
          },
          error: function (resp) {
            throw new Error('Something went wrong queuing this container')
          }
        })
      })
    },
    async unQueueContainer({ commit, state, rootState }, { CONTAINERID }) {
      // We want to pass in the container Id for now and then return the response to the component to do other changes.
      return new Promise( (resolve) => {
        Backbone.ajax({
          url: rootState.apiurl+'/shipment/containers/queue',
          data: {
            CONTAINERID,
            UNQUEUE: 1,
          },
          success: function(resp) {
            resolve(resp)
          },
          error: function(resp) {
            throw new Error('Something went wrong unqueuing this container')
          }
        })
      })
    }
  }
}

export default shipmentModule