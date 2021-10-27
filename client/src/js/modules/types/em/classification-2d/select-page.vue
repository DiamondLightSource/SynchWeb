<template>
  <span class="pageButtons">
    Page {{ value }} of {{ max }}
    <flat-button
      :disabled="value <= 1"
      @click="$emit('input', 1)"
    >
      <i class="fa fa-angle-double-left" />
    </flat-button>

    <flat-button
      :disabled="value <= 1"
      @click="$emit('input', value - 1)"
    >
      <i class="fa fa-angle-left" />
    </flat-button>

    <flat-button
      :disabled="value >= max"
      @click="$emit('input', value + 1)"
    >
      <i class="fa fa-angle-right" />
    </flat-button>

    <flat-button
      :disabled="value >= max"
      @click="$emit('input', max)"
    >
      <i class="fa fa-angle-double-right" />
    </flat-button>
  </span>
</template>

<script>
import FlatButton from 'app/components/flat-button.vue'

export default {
    'name': "SelectPage",
    'components': {
        'flat-button': FlatButton,
    },
    'props': {
        'max': {
            'type': Number,
            'required': true,
        },
        'value': {
            'type': Number,
            'required': true,
        }
    },
}
</script>

<style scoped>
.page-buttons {
    margin-left: 5px;
}
</style>
