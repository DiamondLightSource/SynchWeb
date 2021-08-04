<template>
  <button
    :disabled="disabled"
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
        }
    },
}
</script>

<style scoped>
button {
    border-width: 1px;
    border-style: solid;
    border-color: #e2e2e2;
    padding: 5px;
    border-radius: 3px;
    background: linear-gradient(#ededed, #dedede);
    color: #666;
}

button:hover:enabled {
    background: linear-gradient(#dedede, #ededed);
    color: #000;
}

button:disabled, button[disabled] {
  background-color: #ddd;
  color: #bbb;
}
</style>
