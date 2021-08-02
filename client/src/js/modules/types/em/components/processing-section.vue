<template>
  <div class="processing-section">
    <h2>{{ sectionTitle }}</h2>

    <div class="top-bar">
      <slot name="controls" />
    </div>

    <div
      class="detail-container"
    >
      <template v-if="dataAvailable">
        <slot />
      </template>

      <p v-else>
        {{ notAvailableMessage }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
    'name': 'ProcessingSection',
    'props': {
        'dataAvailable': {
            'type': Boolean,
            'required': true,
        },
        'notAvailableMessage': {
            'type': String,
            'default': 'No data available',
        },
        'sectionTitle': {
            'type': String,
            'required': true,
        },
    },
}
</script>

<style scoped>
.processing-section {
    padding-top: 1%;
    padding-bottom: 0;
    padding-right: 1%;
    padding-left: 1%;
}
.top-bar {
    padding-top: 5px;
    padding-bottom: 5px;
}
.detail-container {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    flex-direction: row;
    padding: 10px;
    border-radius: 6px;
    margin-bottom: 15px;
    background: #efefef;
    border: 1px solid #e2e2e2;
}
</style>
