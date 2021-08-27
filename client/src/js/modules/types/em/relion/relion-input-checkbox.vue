<template>
  <div
    class="relion-form-field"
    :class="extraClass"
  >
    <input
      :id="id"
      v-model="value"
      :name="name"
      type="checkbox"
    >
    <label :for="id">
      {{ label }}
    </label>
    <div
      v-for="description in extraDescription"
      class="relion-form-note"
    >
      {{ description }}
    </div>
  </div>
</template>

<script>
import relionInputMixin from 'modules/types/em/relion/relion-input-mixin'

export default {
    'name': 'RelionInputCheckbox',
    'mixins': [relionInputMixin],
    'props': {
        'extraClass': {
            'type': String,
            'default': '',
        },
    },
    'computed': {
        'id': function() {
            return this.name + '-ck'
        },
    },
}
</script>
