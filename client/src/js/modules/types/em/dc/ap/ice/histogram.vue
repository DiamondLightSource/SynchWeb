<template>
  <div
    v-if="isJson"
    class="ice-breaker-histogram"
    style="padding: 100px; text-align: center;"
    :style="proportionalHeight"
  >
    TO DO: Histogram<br>
    <strong>{{ attachment.RECORDTIMESTAMP }}</strong>
  </div>
</template>

<script>
import attachment from 'modules/types/em/dc/ap/ice/attachment'
import proportionalHeight from 'modules/types/em/components/proportional-height'

export default {
    'name': "Histogram",
    'mixins': [
        attachment,
        proportionalHeight
    ],
}
</script>

<style>
.ice-breaker-histogram {
    background: #dadada;
    padding: 0;
    margin: 0.25%;
    overflow: hidden;
    width: 23.5%;
}
</style>
