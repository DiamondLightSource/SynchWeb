<template>
  <div
    v-if="attachment.hasPlot"
    class="ice-breaker-histogram"
    style="padding: 100px; text-align: center;"
    :style="proportionalHeight"
    :title="attachment.timeStamp"
  >
  </div>
</template>

<script>
import proportionalHeight from 'modules/types/em/components/proportional-height'

export default {
    'name': "Histogram",
    'mixins': [proportionalHeight],
    'props': {
        'attachment': {
            'type': Object,
            'required': true,
        },
    },
}
</script>

<style>
.ice-breaker-histogram {
    background: #dadada;
    overflow: hidden;
    width: 23.5%;
}
</style>
