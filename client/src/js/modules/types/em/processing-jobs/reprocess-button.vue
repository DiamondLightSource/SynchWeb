<template>
  <div
    v-if="showButton"
    class="reprocess-button"
  >
    <reprocess-button />
  </div>
</template>

<script>
import ReprocessButton from 'modules/types/em/components/reprocess-button.vue'
import { mapGetters } from 'vuex'

export default {
    'name': 'ReprocessButton',
    'components': {
        'reprocess-button': ReprocessButton,
    },
    'props': {
        'status': {
            'type': String,
            'required': true,
        },
    },
    'computed': {
        ...mapGetters('em', [
            'processingAllowed',
        ]),
        'showButton': function() {
            return this.processingAllowed && [
                'success',
                'failure',
            ].includes(this.status)
        },
    },
}
</script>

<style>
.reprocess-button {
    margin-right: 5px;
}
</style>
