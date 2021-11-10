<template>
  <div
    v-if="messages.length > 0"
    class="notification"
  >
    <notification-card :notification="notification" />
  </div>
</template>

<script>
import NotificationCard from 'app/components/notification-card.vue'

export default {
    'name': 'AnomalyMessage',
    'components': {
        'notification-card': NotificationCard,
    },
    'props': {
        'processingJob': {
            'type': Object,
            'required': true,
        },
    },
    'computed': {
        'notification': function() {
            return {
                'level': 'warning',
                'message': this.messages.join(' and '),
                'title': 'Data Anomaly',
            }
        },
        'messages': function() {
            var messages = []
            const movieCount = this.processingJob.movieCount
            for (const [field, title] of Object.entries({
                'mcCount': 'Motion Correction',
                'ctfCount': 'CTF',
                'pickCount': 'Picker',
            })) {
                const count = this.processingJob[field]
                if (count > movieCount) {
                    messages.push(title + ' has ' + count + ' entries')
                }
            }
            if (messages.length > 0) {
                messages.unshift('There are only ' + movieCount + ' movies')
            }
            return messages
        },
    },
}
</script>

<style scoped>
.notification {
    margin-top: 5px;
}
</style>
