// Module to deal with Notifications
const notification = {
  namespaced: true,
  state: {
    // Notifications and events
    notifications: [],
    persist: {}
  },
  mutations: {
    // Payload is object with title, message, level attributes.
    // Creates an id which will be used by notification component to clear after a time interval
    addNotification(state, payload) {
      let notification = payload

      notification.id = Date.now() // Using number of miliseconds since 1970 as uid

      // Should this persist or be transient?
      if (notification.persist) {
        console.log("Store creating persistent notification " + JSON.stringify(notification))
        state.persist = notification
      }
      else state.notifications.push(notification)
    },
    clearNotifications(state) {
      console.log("Clearing notifications")
      state.notifications = []
    },
    clearNotification(state, id) {
      console.log("Store Clearing notification for id " + id)
      state.notifications = state.notifications.filter(notification => notification.id !== id)
    },
    clearPersistNotification(state) {
      console.log("Store Clearing persist notification ")
      state.persist = {}
    },
  },
  getters: {
    notifications: state => state.notifications,
  }
}

export default notification
