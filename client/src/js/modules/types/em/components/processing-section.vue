<template>
  <div class="processing-section">
    <div class="ps-header">
      <h2 class="ps-title">
        {{ sectionTitle }}
      </h2>

      <div class="ps-controls">
        <base-input-button @click="hidden = !hidden">
          <i :class="hideIconClass" />
        </base-input-button>
      </div>
    </div>

    <div v-if="! hidden">
      <div class="top-bar">
        <slot name="controls" />
      </div>

      <div class="detail-container">
        <template v-if="dataAvailable">
          <slot />
        </template>

        <p v-else>
          {{ notAvailableMessage }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import BaseInputButton from 'app/components/base-input-button.vue'

export default {
    'name': 'ProcessingSection',
    'components': {
        'base-input-button': BaseInputButton,
    },
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
        'defaultHidden': {
            'type': Boolean,
            'default': false,
        }
    },
    'data': function() {
        return {
            'hidden': this.defaultHidden
        }
    },
    'computed': {
        'hideIconClass': function() {
            return 'fa fa-angle-' + (this.hidden ? 'up' : 'down')
        },
    }
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
    padding: 10px;
    border-radius: 6px;
    margin-bottom: 15px;
    background: #efefef;
    border-width: 1px;
    border-style: solid;
    border-color: #e2e2e2;
}
.ps-controls {
    margin-left: 10px;
}
.detail-container,
.ps-header {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    flex-direction: row;
}
.ps-title {
    flex-grow: 1;
}
</style>
