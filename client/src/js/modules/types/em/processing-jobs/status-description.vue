<template>
  <div>
    <i
      :alt="status"
      :class="icon"
    />
    {{ status }}
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
                'submitted': 'fa fa-spinner fa-spin',
                'queued': 'fa fa-spinner fa-spin',
                'running': 'fa fa-cog fa-spin flat-yellow',
                'failure': 'fa fa-times flat-red',
                'success': 'fa fa-check  flat-green',
                '': 'fa fa-question-circle flat-blue',
            }[this.status]
        },
    },
}
</script>

<style scoped>
.fa {
    font-size: 18px;
    margin-right: 8px;
}
.flat-yellow {
    color: #fe3;
}
.flat-green {
    color: #4b7;
}
.flat-red {
    color: #e44;
}
.flat-blue {
    color: #49e;
}
.flat-amber {
    color: #fa0;
}
</style>
