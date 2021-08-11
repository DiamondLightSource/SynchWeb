<template>
  <dialog-modal
    :is-active="isActive"
    :title="title"
    cancel-label=""
    confirm-label="Close"
    @cancel="$emit('cancel')"
    @confirm="$emit('confirm')"
  >
    <template #contents>
      <marionette-wrapper
        :mview="mView"
        :options="options"
        preloaded
      />
    </template>
  </dialog-modal>
</template>

<script>
import DialogModal from 'app/components/dialog-modal.vue'
import MarionetteWrapper from 'app/views/marionette/marionette-wrapper.vue'

export default {
    'name': 'DialogMarionetteView',
    'components': {
        'dialog-modal': DialogModal,
        'marionette-wrapper': MarionetteWrapper,
    },
    'props': {
        'mView': {
            'type': [Function, Promise],
            'required': true,
        },
        'options': {
            'type': Object,
            'required': true,
        },
        'isActive': {
            'type': Boolean,
            'default': false,
        },
        'title': {
            'type': String,
            'required': true,
        },
        'cancelLabel': {
            'type': String,
            'default': 'Cancel',
        },
        'confirmLabel': {
            'type': String,
            'default': 'Confirm',
        },
    },
}
</script>