<template>
  <dialog-modal
    :is-active="isActive"
    :title="title"
    :cancel-label="cancelLabel"
    :confirm-label="confirmLabel"
    @cancel="$emit('cancel')"
    @confirm="$emit('confirm')"
  >
    <template #contents>
      <p>
        {{ message }}
      </p>
    </template>
  </dialog-modal>
</template>

<script>
import DialogModal from 'app/components/dialog-modal.vue'

export default {
    'name': 'DialogConfirmation',
    'components': {
        'dialog-modal': DialogModal,
    },
    'props': {
        'isActive': {
            'type': Boolean,
            'default': false,
        },
        'title': {
            'type': String,
            'required': true,
        },
        'message': {
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