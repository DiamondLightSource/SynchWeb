<template>
  <div
    v-if="isActive"
    class="background"
    @click.self="$emit('cancel')"
  >
    <div class="dialog-box">
      <header class="header">
        <h2 class="heading">{{ title }}</h2>
        <button
          aria-label="close"
          @click.prevent="$emit('cancel')"
        >
          <i class="fa fa-times" />
        </button>
      </header>

      <div class="body">
        <slot name="contents" />
      </div>

      <footer class="footer">
        <button
          v-if="confirmLabel"
          class="confirm dialog-button"
          @click="$emit('confirm')"
        >
          {{ confirmLabel }}
        </button>
        <button
          v-if="cancelLabel"
          class="cancel dialog-button"
          @click="$emit('cancel')"
        >
          {{ cancelLabel }}
        </button>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
    'name': 'DialogModal',
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
    /* needs a z-index to place it above div.form span.ferror which has
       position: relative; */
    z-index: 10;
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
}
.header,
.footer {
    display: flex;
    justify-content: flex-end;
}
.heading {
    flex-grow: 1;
}
.body {
    padding: 10px;
}
.dialog-button {
    width: 50%;
    color: #fff;
    padding: 5px;
    margin: 8px;
    border-radius: 5px;
    background-color: #4a5568;
    cursor: pointer;
}
.confirm:hover {
    background-color: #48bb78;
}
.cancel:hover {
    background-color: #f56565;
}
</style>
