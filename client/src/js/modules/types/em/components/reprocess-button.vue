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
        },
        'previousParameters': {
            'type': Object,
            'default': null,
        },
        'processingDisallowedReason': {
            'type': String,
            'default': '',
        }
    },
    'data': function() {
        return {
            'waiting': false,
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
    'mounted': function() {
        /* Deal with occasional race-condition where we end up with no
           previous parameters */
        this.$watch(
            function() {
                return {
                    'params': this.previousParameters,
                    'waiting': this.waiting,
                }
            },
            function(newVal) {
                if (Object.keys(newVal.params).length > 0 && newVal.waiting) {
                    this.showDialog(newVal.params)
                }
            }
        )
    },
    'methods': {
        'showDialog': function(payload) {
            this.waiting = false
            this.$store.commit('em/processing/showDialog', payload)
        },
        'click': function() {
            if (
                this.previousParameters === null ||
                Object.keys(this.previousParameters).length > 0
            ) {
                this.showDialog(this.previousParameters)
                return
            }

            this.waiting = true
            this.$emit('fetch')
        },
    },
}
</script>
