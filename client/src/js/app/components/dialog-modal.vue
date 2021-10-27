<template>
  <div
    v-if="showDialog"
    class="background"
    @click.self="backgroundClick"
  >
    <div class="dialog-box">
      <header class="header">
        <div
          class="dialog-heading"
          v-html="title"
        />

        <flat-button
          level="danger"
          @click="$emit('cancel')"
        >
          <i class="fa fa-times" />
        </flat-button>
      </header>

      <div class="body">
        <slot />
      </div>

      <footer class="footer">
        <slot name="firstButtons" />

        <dialog-button
          v-if="confirmLabel"
          level="success"
          @click="$emit('confirm')"
        >
          {{ confirmLabel }}
        </dialog-button>

        <slot name="middleButtons" />

        <dialog-button
          v-if="cancelLabel"
          level="danger"
          @click="$emit('cancel')"
        >
          {{ cancelLabel }}
        </dialog-button>

        <slot name="lastButtons" />
      </footer>
    </div>
  </div>
</template>

<script>
import DialogButton from 'app/components/dialog-button.vue'
import FlatButton from 'app/components/flat-button.vue'

export default {
    'name': 'DialogModal',
    'components': {
        'dialog-button': DialogButton,
        'flat-button': FlatButton,
    },
    'props': {
        'showDialog': {
            'type': Boolean,
            'default': false,
        },
        'title': {
            'type': String,
            'required': true,
        },
        'cancelLabel': {
            'type': String,
            'default': '',
        },
        'confirmLabel': {
            'type': String,
            'default': '',
        },
        'blockBackgroundClick': {
            'type': Boolean,
            'default': false,
        },
    },
    'methods': {
        'backgroundClick': function() {
            if (!this.blockBackgroundClick) {
                this.$emit('cancel')
            }
        }
    },
}
</script>

<style scoped>
.background {
    z-index: 1; /* enough to make it "higher" than plotly */
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.75);
}
.dialog-box {
    box-shadow:
      0 10px 15px -3px rgb(0 0 0 / 10%),
      0  4px  6px -2px rgb(0 0 0 / 5%);
    padding: 1rem;
    border-radius: 0.5rem;
    background-color: #fff;
    color: #000;
}
.header,
.footer {
    display: flex;
    justify-content: flex-end;
}
.header {
    @apply tw-bg-gray-500 tw-text-black;
    border-radius: 0.25rem;
    padding-left: 10px;
    margin-left: 5px;
    margin-right: 5px;
}
.dialog-heading {
    flex-grow: 1;
    padding: 5px;
    font-weight: bold;
}
</style>
