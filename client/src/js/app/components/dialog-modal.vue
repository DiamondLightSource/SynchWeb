<template>
  <div
    v-if="isActive"
    class="background"
    @click.self="$emit('cancel')"
  >
    <div class="dialog-box">
      <header class="header">
        <h2 class="heading">
          {{ title }}
        </h2>
        <button
          aria-label="close"
          @click.prevent="$emit('cancel')"
        >
          <i class="fa fa-times" />
        </button>
      </header>

      <div class="body">
        <slot />
      </div>

      <footer class="footer">
        <flat-button
          v-if="confirmLabel"
          class="green"
          @click="$emit('confirm')"
        >
          {{ confirmLabel }}
        </flat-button>

        <flat-button
          v-if="cancelLabel"
          class="red"
          @click="$emit('cancel')"
        >
          {{ cancelLabel }}
        </flat-button>
      </footer>
    </div>
  </div>
</template>

<script>
import FlatButton from 'app/components/flat-button.vue'

export default {
    'name': 'DialogModal',
    'components': {
        'flat-button': FlatButton,
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
        'cancelLabel': {
            'type': String,
            'default': '',
        },
        'confirmLabel': {
            'type': String,
            'default': '',
        },
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
.flat-button {
    width: 50%;
    margin: 8px;
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
.heading {
    flex-grow: 1;
}
</style>
