<template>
  <div class="la puck_controls">
    <a v-if="autofill" class="button autofill" @click.prevent="$emit('autofill-puck')" href="#" title="Autofill puck"><i class="fa fa-plus"></i> Autofill Puck</a>

    <a class="button clonepuck" @click.prevent="$emit('clone-puck')" href="#" title="Clone entire puck from first sample"><i class="fa fa-plus"></i> Clone from First Sample</a>
    <a class="button clearpuck" @click.prevent="$emit('clear-puck')" href="#" title="Clear entire puck"><i class="fa fa-times"></i> Clear Puck</a>

    <a v-if="extra" class="button extrainfo r" @click.prevent="toggleExtra" href="#" title="Show extra fields"><i :class="['fa extra-state', extraToggle ? 'fa-plus' : 'fa-minus']"></i> Extra Fields</a>
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