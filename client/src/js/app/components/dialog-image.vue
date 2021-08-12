<template>
  <dialog-modal
    :is-active="isActive"
    :title="title"
    @cancel="$emit('cancel')"
  >
    <img :src="src">
  </dialog-modal>
</template>

<script>
import DialogModal from 'app/components/dialog-modal.vue'

export default {
    'name': 'DialogImage',
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
        'src': {
            'type': String,
            'required': true,
        },
    },
}
</script>