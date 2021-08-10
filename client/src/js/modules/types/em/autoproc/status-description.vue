<template>
  <div>
    {{ status }}
    <i
      class="fa icon"
      :alt="status"
      :class="icon"
    />
  </div>
</template>

<script>
export default {
    'name': 'StatusDescription',
    'props': {
        'status': {
            'type': String,
            'required': true,
        },
    },
    'computed': {
        'icon': function() {
            return {
                'submitted': 'fa-spinner fa-spin',
                'queued': 'fa-spinner fa-spin',
                'running': 'fa-cog fa-spin',
                'failure': 'red fa-times',
                'success': 'green fa-check',
                '': 'blue fa-question-circle',
            }[this.status]
        },
    },
}
</script>
