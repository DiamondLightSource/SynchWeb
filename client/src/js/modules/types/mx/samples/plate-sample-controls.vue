<template>
  <!--
    These controls are designed to be used where a container type has multiple sample positions (drops) within each well.
    Could also be used where there is a grid of sample positions rather than a single row of sample positions or a puck.
  -->
  <div class="tw-mb-2">
    <div class="tw-flex tw-flex-wrap tw-w-full tw-mb-2">
      <button class="button" @click.prevent="$emit('clone-container')" ><i class="fa fa-plus"></i> Plate</button>
      <button class="button" @click.prevent="$emit('clone-container-column')" ><i class="fa fa-plus"></i> Column</button>
      <button class="button" @click.prevent="$emit('clone-container-row')" ><i class="fa fa-plus"></i> Row</button>

      <button class="button" @click.prevent="$emit('clear-container')" title="Clear Plate"><i class="fa fa-times"></i> Plate</button>
      <button class="button" @click.prevent="$emit('clear-container-column')" title="Clear Column"><i class="fa fa-times"></i> Column</button>
      <button class="button" @click.prevent="$emit('clear-container-row')" title="Clear Row"><i class="fa fa-times"></i> Row</button>

      <button class="button" @click.prevent="$emit('clear-container-sample')" title="Clear Sample"><i class="fa fa-times"></i> Clear Sample</button>
    </div>
    <button v-if="extra" class="button" title="Show extra fields" @click.prevent="toggleExtra" ><i :class="['fa extra-state', extraToggle ? 'fa-minus' : 'fa-plus']"></i> Extra Fields</button>
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
