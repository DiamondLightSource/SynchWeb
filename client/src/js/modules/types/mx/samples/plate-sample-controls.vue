<template>
  <!--
    These controls are designed to be used where a container type has multiple sample positions (drops) within each well.
    Could also be used where there is a grid of sample positions rather than a single row of sample positions or a puck.
  -->
  <div class="ra">
    <a href="#" class="button clone-plate" @click.prevent="$emit('clone-container')" ><i class="fa fa-plus"></i> Plate</a>
    <a href="#" class="button clone-col" @click.prevent="$emit('clone-container-column')" ><i class="fa fa-plus"></i> Column</a>
    <a href="#" class="button clone-row" @click.prevent="$emit('clone-container-row')" ><i class="fa fa-plus"></i> Row</a>

    <a href="#" class="button clear-plate" @click.prevent="$emit('clear-container')" title="Clear Plate"><i class="fa fa-times"></i> Plate</a>
    <a href="#" class="button clear-col" @click.prevent="$emit('clear-container-column')" title="Clear Column"><i class="fa fa-times"></i> Column</a>
    <a href="#" class="button clear-row" @click.prevent="$emit('clear-container-row')" title="Clear Row"><i class="fa fa-times"></i> Row</a>

    <a href="#" class="button clear" @click.prevent="$emit('clear-container-sample')" title="Clear Sample"><i class="fa fa-times"></i></a>

    <div v-if="extra" class="tw-flex tw-flex-row-reverse">
      <a class="button extrainfo r" href="#" title="Show extra fields" @click.prevent="toggleExtra" ><i :class="['fa extra-state', extraToggle ? 'fa-minus' : 'fa-plus']"></i> Extra Fields</a>
    </div>

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
