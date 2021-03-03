<!--
This panel shows a short message that should persist on the main page
For example when a new container is created, the message can include a link to go to the new container
When the navigation changes, the persistent notification will be reset via the watcher
-->
<template>
    <div v-if="notification.message" id="notification-panel">
        <notification-card :notification="notification">
            <template v-slot:actions>
                <i @click.prevent="onClose" class="fa fa-times"/>
            </template>
        </notification-card>
    </div>
</template>

<script>
import NotificationCard from 'app/components/notification-card.vue'

export default {
    name: 'notification-persist',
    components: {
        'notification-card': NotificationCard
    },
    data: function() {
        return {
            closed: false
        }
    },
    computed: {
        notification: function() {
            return this.$store.state.notifications.persist
        }
    },
    watch: {
        $route (to, from){
            //Reset persist message
            this.$store.commit('notifications/clearPersistNotification')
        }
    },
    methods: {
        onClose: function() {
            this.$store.commit('notifications/clearPersistNotification')
        }
    }
}
</script>