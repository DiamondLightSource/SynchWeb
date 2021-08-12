<template>
  <button
    :disabled="disabled"
    class="flat-button"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script>
export default {
    'name': "FlatButton",
    'props': {
        'disabled': {
            'type': Boolean,
            'default': false,
        },
    },
}
</script>

<style scoped>
.flat-button {
    padding: 5px;
    border-radius: 5px;
    color: #fff;
    background-color: #666;
    cursor: pointer;
}
.flat-button:disabled {
    background-color: #ccc;
    color: #fff;
}
.flat-button:hover:disabled {
    background-color: #ccc;
    color: #fff;
}
.flat-button:hover {
    background-color: #999;
    color: #000;
}
.flat-button.green:hover {
    background-color: #4b7;
}
.flat-button.red:hover {
    background-color: #e44;
}
.flat-button.blue:hover {
    background-color: #49e;
}
.flat-button.amber:hover {
    color: #000;
    background-color: #fa0;
}
</style>
