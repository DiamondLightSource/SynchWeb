<template>
    <div v-if="!closed && message" id="motd-banner" class="tw-hidden md:tw-flex tw-my-4 tw-p-4 tw-bg-content-active tw-rounded tw-flex tw-justify-between">
        <p class="tw-text-md">{{message}}</p>
        <i @click="closed = true" class="fa fa-times"/>
    </div>
    <!-- Spacer for cases we have no message of the day -->
    <div v-else class="tw-mb-4"/>
</template>

<script>
export default {
    name: 'motd',
    props:  {
        'message': String
    },
    data: function() {
        return {
            closed: false
        }
    }
}
</script>