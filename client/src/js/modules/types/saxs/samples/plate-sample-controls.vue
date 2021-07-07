<template>
      <div class="ra">
        <a href="#" class="button clone-plate" @click.prevent="$emit('clone-plate')" ><i class="fa fa-plus"></i> Plate</a>
        <a href="#" class="button clone-col" @click.prevent="$emit('clone-plate-column')" ><i class="fa fa-plus"></i> Column</a>
        <a href="#" class="button clone-row" @click.prevent="$emit('clone-plate-row')" ><i class="fa fa-plus"></i> Row</a>

        <a href="#" class="button clear-plate" @click.prevent="$emit('clear-plate')" title="Clear Plate"><i class="fa fa-times"></i> Plate</a>
        <a href="#" class="button clear-col" @click.prevent="$emit('clear-plate-column')" title="Clear Column"><i class="fa fa-times"></i> Column</a>
        <a href="#" class="button clear-row" @click.prevent="$emit('clear-plate-row')" title="Clear Row"><i class="fa fa-times"></i> Row</a>

        <a href="#" class="button clear" @click.prevent="$emit('clear-plate-sample')" title="Clear Sample"><i class="fa fa-times"></i></a>
    </div>
</template>

<script>
export default {
  name: 'PlateControls',
}
</script>