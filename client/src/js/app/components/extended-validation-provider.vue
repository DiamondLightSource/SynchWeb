<template>
  <validation-provider
    :ref="ref"
    v-slot="{ errors, dirty }"
    :rules="rules"
    :name="name"
    :tag="tag"
    :vid="vid"
    :slim="slim"
  >
    <div :class="{'tw-bg-dark-amber': dirty, [classNames]: true }">
      <slot
        :errors="errors"
        :input-changed="updateFieldFlags"
      />
    </div>
  </validation-provider>
</template>
<script>
import { ValidationProvider } from 'vee-validate';

export default {
  name: 'ExtendedValidationProvider',
  components: {
    'validation-provider': ValidationProvider
  },
  props: {
    name: {
      type: String,
      required: true
    },
    vid: {
      type: String,
      required: true
    },
    rules: {
      type: [Object, String],
      default: ''
    },
    tag: {
      type: String,
      default: 'span'
    },
    ref: {
      type: String,
      default: ''
    },
    classNames: {
      type: String,
      default: ''
    },
    slim: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    updateFieldFlags() {
      this.$refs[this.ref].setFlags({ dirty: true })
    }
  }
}
</script>
