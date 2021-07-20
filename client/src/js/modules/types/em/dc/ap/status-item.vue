<template>
  <span>
    {{ title }}: {{ count }} <i
      class="fa icon"
      :alt="label"
      :class="icon"
    />
  </span>
</template>

<script>
export default {
    'name': 'ApStatusItem',
    'props': {
        'title': {
            'type': String,
            'required': true,
        },
        'status': {
            'type': Object,
            'required': true,
        },
    },
    'computed': {
        'statusValues': function() {
            return Object.values(this.status)
        },
        'count': function() {
            const length = this.statusValues.length
            this.$emit('counted', length)
            return length
        },
        'label': function() {
            if (this.statusValues.length == 0) {
                return 'N/A'
            }
            if (this.statusValues.includes(null)) {
                return 'Running'
            }
            if (this.statusValues.includes(0)) {
                return 'Failed'
            }
            return 'Completed'
        },
        'icon': function() {
            if (this.label == 'N/A') {
                return 'blue fa-question-circle'
            }
            if (this.label == 'Running') {
                return 'grey fa-cog fa-spin'
            }
            if (this.label == 'Failed') {
                return 'red fa-times'
            }
            return 'green fa-check'
        },
    },
}
</script>
