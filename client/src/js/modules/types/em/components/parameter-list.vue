<template>
  <ul :style="styleWidth">
    <slot />
  </ul>
</template>

<script>
export default {
    'name': 'ParameterList',
    'props': {
        'width': {
            'type': String,
            'default': '34%',
        },
    },
    'computed': {
        'styleWidth': function() {
            return 'width: ' + (this.width) + ';'
        },
    },
}
</script>

<style scoped>
ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    align-content: flex-start;
    justify-content: flex-start;
    flex-wrap: wrap;
    flex-direction: row;
}
</style>
