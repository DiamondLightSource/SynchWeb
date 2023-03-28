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
        state.persist = notification
      }
      else state.notifications.push(notification)
    },
    clearNotifications(state) {
      state.notifications = []
    },
    clearNotification(state, id) {
      state.notifications = state.notifications.filter(notification => notification.id !== id)
    },
    clearPersistNotification(state) {
      state.persist = {}
    },
  },
  getters: {
    notifications: state => state.notifications,
  }
}

export default notification
