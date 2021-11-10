<template>
  <li
    :title="helpText"
    :style="styleWidth"
  >
    <slot />
  </li>
</template>

<script>
export default {
    'name': 'CustomListItem',
    'props': {
        'width': {
            'type': String,
            'default': '50%',
        },
        'helpText': {
            'type': String,
            'default': '',
        },
    },
    'computed': {
        'styleWidth': function() {
            return 'width: ' + this.width + ';'
        }
    },
}
</script>

<style scoped>
li {
    box-sizing: border-box;
    display: block;
    padding-top: 8px;
    padding-right: 5px;
    padding-bottom: 8px;
    padding-left: 5px;
    background: #e6e6e6;
    border-width: 2px;
    border-style: solid;
    border-color: #efefef;
}
</style>
