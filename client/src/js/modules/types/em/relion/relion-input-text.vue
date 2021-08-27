<template>
  <div class="relion-form-field">
    <label
      :for="id"
      v-html="label"
    />
    <div
      v-for="description in extraDescription"
      class="relion-form-note"
    >
      {{ description }}
    </div>
    <input
      :id="id"
      v-model="value"
      type="text"
      :name="name"
      :class="error ? 'relion-form-input ferror' : 'relion-form-input'"
    >
    <div
      v-if="error"
      class="ferror relion-form-error"
    >
      {{ error }}
    </div>
  </div>
</template>

<script>
import relionInputMixin from 'modules/types/em/relion/relion-input-mixin'

export default {
    'name': 'RelionInputText',
    'mixins': [relionInputMixin],
    'props': {
        'error': {
            'type': String,
            'default': '',
        },
    },
    'computed': {
        'id': function() {
            return this.name + '-txt'
        },
    },
}
</script>
