<template>
  <toolbar-button
    icon="fa fa-cog"
    button-text="Relion Processing"
    :show-text="showText"
    :hint="hint"
    :disabled="processingDisallowed || waiting"
    @click="click"
  />
</template>

<script>
import ToolbarButton from 'modules/types/em/components/toolbar-button.vue'

export default {
    'name': 'ReprocessesButton',
    'components': {
        'toolbar-button': ToolbarButton,
    },
    'props': {
        'showText': {
            'type': Boolean,
            'default': false,
        'processingDisallowedReason': {
            'type': String,
            'default': '',
        }
    },
        }
    },
    'computed': {
        'processingDisallowed': function() {
            return this.processingDisallowedReason != ''
        },
        'hint': function() {
            return this.processingDisallowed ?
                this.processingDisallowedReason : 'Run Relion processing'
        },
    },
    'methods': {
        'click': function() {
            this.$store.commit('em/showProcessingDialog', true)
        }
    },
}
</script>
