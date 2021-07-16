<template>
  <li>
    {{ label }}:
    <span v-html="item" />
    <span v-if="label2">
      {{ label2 }}:
      <span v-html="item2" />
    </span>
  </li>
</template>

<script>
export default {
    'name': 'ListItem',
    'props': {
        'label': {
            'type': String,
            'required': true,
        },
        'item': {
            'type': String,
            'required': true,
        },
        'label2': {
            'type': String,
            'default': '',
        },
        'item2': {
            'type': String,
            'default': '',
        },
    },
}
</script>
