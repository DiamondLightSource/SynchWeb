<template>
  <button
    :disabled="disabled"
    :class="type"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script>
export default {
    'name': "BaseInputButton",
    'props': {
        'disabled': {
            'type': Boolean,
            'default': false,
        },
        'type': {
            'type': String,
            'default': 'normal',
            'validator': function(value) {
                return [
                    'normal',
                    'success',
                    'danger',
                ].indexOf(value) !== -1
            },
        },
    },
}
</script>

<style scoped>
button {
    /*border-width: 1px;
    border-style: solid;
    border-color: #e2e2e2;*/
    padding: 5px;
    border-radius: 3px;
}
.normal {
    background: linear-gradient(#ededed, #dedede);
    color: #666;
}
.normal:hover:enabled {
    background: linear-gradient(#dedede, #ededed);
    color: #000;
}
.normal:disabled, .normal[disabled] {
    color: #bbb;
}

.success {
    background: linear-gradient(#82d180, #28a745);
    color: #555;
}
.success:hover:enabled {
    background: linear-gradient(#28a745, #82d180);
    color: #fff;
}
.success:disabled, .success[disabled] {
  color: #888;
}

.danger {
    background: linear-gradient(#ef4444, #dc3545);
    color: #555;
}
.danger:hover:enabled {
    background: linear-gradient(#dc3545, #ef4444);
    color: #fff;
}
.danger:disabled, .danger[disabled] {
  color: #999;
}
</style>
