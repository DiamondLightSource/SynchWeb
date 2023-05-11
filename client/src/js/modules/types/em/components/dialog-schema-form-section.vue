<template>
  <div class="dialog-schema-form-section">
    <h3 v-if="heading">
      {{ heading }}
    </h3>
    <slot />
  </div>
</template>

<script>
export default {
    'name': 'DialogSchemaFormSection',
    'props': {
        'heading': {
            'type': String,
            'default': '',
        },
    },
}
</script>

<style lang="scss" scoped>
.dialog-schema-form-section {
    margin: 5px;
    background-color: #e6e6e6;
    padding: 8px;
    h3 {
      font-weight: bold;
    }
}
</style>
