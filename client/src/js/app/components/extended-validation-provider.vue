<template>
  <validation-provider
    :ref="ref"
    :rules="rules"
    :name="name"
    :tag="tag"
    :vid="vid"
    v-slot="{ errors, flags: { changed } }"
    :slim="slim"
  >
    <div :class="{'tw-bg-dark-amber': changed, [classNames]: true }">
      <slot :errors="errors" :inputChanged="updateFieldFlags"></slot>
    </div>
  </validation-provider>
</template>
<script>
import { ValidationProvider } from 'vee-validate';

export default {
  name: 'extended-validation-provider',
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
      this.$refs[this.ref].setFlags({ changed: true })
    }
  }
}
</script>