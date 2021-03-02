<template>
    <section id="notifications">
        <div class="tw-fixed tw-left-0 tw-right-0 tw-top-0 tw-z-10">
            <div class="notification">
                <transition-group name="notify" tag="ul">
                    <li v-for="item in notifications" :key="item.id" class="tw-w-full md:tw-w-2/3">
                        <notification-card :notification="item"></notification-card>
                    </li>
                </transition-group>
            </div>
        </div>
    </section>
</template>

<script>
import NotificationCard from 'app/components/notification-card.vue'

export default {
    name: 'Notification',

components: {
        'notification-card': NotificationCard
    },

    data: function() {
        return {
        }
    },
    filters: {
        // Simple filter to convert text to upper case
        upper: function (value) {
            if (!value) {
                return ''
            } else {
                return value.toString().toUpperCase()
            }
        }
    },
    watch: {
        // We deal with clearing the notifications after a given time (5s)
        notifications: function(val) {
            let self = this
            let ids = val.map(item => {return item.id})

            setTimeout(function() {
                ids.forEach(element => {
                    self.$store.commit('notifications/clearNotification', element)
                })
            }, 5000)
        }
    },
    computed: {
        notifications: function() {
            return this.$store.getters['notifications/notifications']
        },
    },
}
</script>

<style>
.notification ul {
    @apply tw-flex tw-flex-col tw-items-center tw-w-full;
}

.notify-enter-active, .notify-leave-active {
  transition: opacity 0.5s;
}
.notify-enter, .notify-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
