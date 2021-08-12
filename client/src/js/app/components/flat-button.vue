<template>
  <button
    class="flat-button"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script>
export default {
    'name': "FlatButton",
}
</script>

<style scoped>
.flat-button {
    padding: 5px;
    border-radius: 5px;
    color: #000;
    background-color: #bbb;
    cursor: pointer;
}
.flat-button.highlight {
    background-color: #fe3;
    color: #000;
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
    background-color: #666;
    color: #fff;
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
