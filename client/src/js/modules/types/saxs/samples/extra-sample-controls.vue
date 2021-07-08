<template>
  <div class="tw-flex tw-flex-row-reverse">
    <a class="button extrainfo r" href="#" title="Show extra fields" @click.prevent="$emit('toggle-extra')" ><i class="fa fa-plus"></i> Extra Fields</a>
  </div>
</template>

<script>
export default {
  name: 'ExtraControls',
}
</script>
