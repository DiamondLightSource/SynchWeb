<!--
This component displays notifications - styling the border and background based on the message level
It is designed to work with transient notifications and for a persistent notification that may contain a link
It uses slots for title and header so it can be overridded by a parent component
-->
<template>
    <div class="tw-hidden md:tw-flex tw-mx-4 tw-p-4 tw-rounded tw-justify-between tw-border-2" :class="notificationClass(notification.level)">
        <div class="tw-flex">
            <slot name="title">
                <p class="tw-font-bold">{{notification.title}}</p>
            </slot>
            <slot name="message">
                <p v-html="notification.message" class="tw-pl-2"></p>
            </slot>
        </div>
        <div class="tw-flex">
            <!-- Placeholder for any buttons, icons etc. -->
            <slot name="actions"></slot> 
        </div>
    </div>
</template>

<script>
export default {
    name: 'notification-card',
    props: {
        'notification': Object // with level, message, title properties
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
    }
}
</script>