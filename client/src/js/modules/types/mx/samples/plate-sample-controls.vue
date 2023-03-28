<template>
  <!--
    These controls are designed to be used where a container type has multiple sample positions (drops) within each well.
    Could also be used where there is a grid of sample positions rather than a single row of sample positions or a puck.
  -->
  <div class="tw-mb-2">
    <div class="tw-flex tw-flex-wrap tw-w-full tw-mb-2">
      <button
        class="button"
        title="Clone Plate"
        @click.prevent="$emit('clone-container')"
      >
        <i class="fa fa-plus" /> Plate
      </button>
      <button
        class="button"
        title="Clone Column"
        @click.prevent="$emit('clone-container-column')"
      >
        <i class="fa fa-plus" /> Column
      </button>
      <button
        class="button"
        title="Clone Row"
        @click.prevent="$emit('clone-container-row')"
      >
        <i class="fa fa-plus" /> Row
      </button>

      <button
        class="button"
        title="Clear Plate"
        @click.prevent="$emit('clear-container')"
      >
        <i class="fa fa-times" /> Plate
      </button>
      <button
        class="button"
        title="Clear Column"
        @click.prevent="$emit('clear-container-column')"
      >
        <i class="fa fa-times" /> Column
      </button>
      <button
        class="button"
        title="Clear Row"
        @click.prevent="$emit('clear-container-row')"
      >
        <i class="fa fa-times" /> Row
      </button>

      <button
        class="button"
        title="Clear Sample"
        @click.prevent="$emit('clear-container-sample')"
      >
        <i class="fa fa-times" /> Clear Sample
      </button>
    </div>
    <button
      v-if="extra"
      class="button"
      title="Show extra fields"
      @click.prevent="toggleExtra"
    >
      <i :class="['fa extra-state', extraToggle ? 'fa-minus' : 'fa-plus']" /> Extra Fields
    </button>
  </div>
</template>

<script>
export default {
  name: 'PlateControls',
  props: {
    extra: {
      type: Boolean,
      default: false
    }
  },
  data: function() {
    return {
      extraToggle: false
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
<style scoped>
.button {
  @apply button tw-text-link-color tw-mx-1;
}
</style>
