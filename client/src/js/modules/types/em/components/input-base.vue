<template>
  <div
    class="form-field"
    :class="extraClasses"
  >
    <!-- eslint-disable vue/no-v-html -->
    <label :for="id">
      <slot name="before" />
      <span v-html="label" />
    </label>

    <div class="error-message">
      {{ errorMessage }}
    </div>
    <!-- eslint-enable vue/no-v-html -->
    <div
      v-for="(description, index) in extraDescription"
      :key="index"
      class="form-note"
    >
      {{ description }}
    </div>
    <slot name="after" />
  </div>
</template>

<script>

export default {
    'name': 'RelionInput',
    'props': {
        'form': {
            'type': Object,
            'required': true,
        },
        'name': {
            'type': String,
            'required': true,
        },
        'helpText': {
            'type': Array,
            'default': function() { return [] },
        },
        'extraClass': {
            'type': String,
            'default': '',
        },
    },
    'computed': {
        'id': function() {
            return this.name + '-txt'
        },
        'errorMessage': function() {
            const errorMessage = this.form.errorMessages[this.name]
            return errorMessage ? errorMessage : ''
        },
        'extraDescription': function() {
            const extraDescription = this.form.schema[this.name].extraDescription
            return typeof extraDescription == 'undefined' ?
                this.helpText : extraDescription.concat(this.helpText)
        },
        'extraClasses': function() {
            return (
                this.extraClass + ' ' + (
                    this.errorMessage ? 'error' : ''
                )
            ).trim()
        },
        'label': function() {
            return this.form.schema[this.name].label
        }
    },
}
</script>

<style scoped>
label {
    display: block;
}
label * {
    vertical-align: middle;
}
.form-field {
    margin-top: 5px;
    vertical-align: middle;
}
.form-input {
    display: block;
}
.form-note {
    font-size: 10px;
}
.error input {
    background-color: #f56565;
}
.error .error-message {
    color: #f56565;
    font-weight: bold;
}
</style>
