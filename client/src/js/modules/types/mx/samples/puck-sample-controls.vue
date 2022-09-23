<template>
  <div class="la puck_controls">
    <a
      v-if="autofill"
      class="button autofill"
      href="#"
      title="Autofill puck"
      @click.prevent="$emit('autofill-container')"
    ><i class="fa fa-plus" /> Autofill Puck</a>

    <a
      class="button clonepuck"
      href="#"
      title="Clone entire puck from first sample"
      @click.prevent="$emit('clone-container', 0)"
    ><i class="fa fa-plus" /> Clone from First Sample</a>
    <a
      class="button clearpuck"
      href="#"
      title="Clear entire puck"
      @click.prevent="$emit('clear-container')"
    ><i class="fa fa-times" /> Clear Puck</a>

    <a
      v-if="extra"
      class="button extrainfo r"
      href="#"
      title="Show extra fields"
      @click.prevent="toggleExtra"
    ><i :class="['fa extra-state', extraToggle ? 'fa-plus' : 'fa-minus']" /> Extra Fields</a>
  </div>
</template>

<script>
export default {
  name: 'PuckControls',
  props: {
    visit: {
      type: String,
      default: ''
    },
    autofill: {
      type: Boolean,
      default: false
    },
    extra: {
      type: Boolean,
      default: false
    }
  },
  data: function() {
    return {
      extraToggle: true
    }
  },
  methods: {
    toggleExtra: function() {
      this.extraToggle = !this.extraToggle
      this.$emit('extra-puck', this.extraToggle)
    }
  }
}
</script>
