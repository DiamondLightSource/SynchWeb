<template>
    <section id="notifications">
        <div class="tw-fixed tw-left-0 tw-right-0 tw-top-0 tw-z-10">
            <div class="notification">
                <transition-group name="notify" tag="ul">
                    <li v-for="item in notifications" :key="item.id" class="notify-item"
                        :class="notificationClass(item.level)">
                        <!-- <span class="tw-font-bold">{{item.level | upper}}: </span> -->
                        <span class="tw-font-bold">{{item.title | upper}} </span>
                        <span class="tw-font-normal">{{item.message}}</span>
                    </li>
                </transition-group>
            </div>
        </div>
    </section>
</template>

<script>

export default {
    name: 'Notification',

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
                    self.$store.commit('clear_notification', element)   
                })
            }, 5000)
        }
    },
    computed: {
        notifications: function() {
            return this.$store.getters.notifications
        },
    },
    methods: {
        // Determine classes to set based on message level
        notificationClass: function(level) {
            let classes = ""

            if (level === 'success') {
                classes += 'tw-border-green-500 tw-bg-green-200'
            } else if (level === 'info') {
                classes += 'tw-border-blue-500 tw-bg-blue-200'
            } else if (level === 'warning') {
                classes += 'tw-border-yellow-500 tw-bg-yellow-200'
            } else if (level === 'error') {
                classes += 'tw-border-red-500 tw-bg-red-200'
            } else {
                classes += 'tw-border-gray-500 tw-bg-gray-200'
            }
            return classes
        },
    },
}
</script>

<style>
.notification ul {
    @apply tw-flex tw-flex-col tw-items-center tw-w-full;
}
.notify-item {
    @apply tw-rounded tw-shadow tw-p-4 tw-w-full tw-font-bold tw-border-2;
}
@screen md {
    .notify-item {
        @apply tw-w-1/2;
    }
}

.notify-enter-active, .notify-leave-active {
  transition: opacity 0.5s;
}
.notify-enter, .notify-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
