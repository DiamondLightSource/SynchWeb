
<!--
Placeholder for puck view - replace when click and select within PuckView is supported
-->
<template>
    <div>
        <help-banner level="alert" message="Pucks are not currently supported with this interface"/>
    </div>
</template>


<script>
import HelpBanner from 'app/components/help-banner.vue'

export default {
    name: 'MockPuckView',
    components: {
      'help-banner': HelpBanner
    },
}

</script>
