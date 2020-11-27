<template>
    <div v-if="!closed" id="motd-banner" class="tw-hidden md:tw-flex tw-mx-4 tw-my-4 tw-p-4 tw-bg-green-300 tw-rounded tw-border tw-border-green-600 tw-flex tw-justify-between">
        <p class="tw-text-md">{{message}}</p>
        <i @click="closed = true" class="fa fa-times"/>
    </div>
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