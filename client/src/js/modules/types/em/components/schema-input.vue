<template>
  <div
    class="form-field"
    :class="extraClasses"
  >
    <label :for="id">
      <input
        v-if="type == 'checkbox'"
        :id="id"
        v-model="value"
        :name="name"
        type="checkbox"
      >

      {{ label }}
    </label>

    <div class="error-message">
      {{ errorMessage }}
    </div>

    <div
      v-for="(description, index) in extraDescription"
      :key="index"
      class="form-note"
    >
      {{ description }}
    </div>

    <select
      v-if="type == 'select'"
      :id="id"
      v-model="value"
      :name="name"
      class="form-input"
    >
      <option
        v-for="option in selectOptions"
        :key="option['value']"
        :value="option['value']"
      >
        {{ option['display'] }}
      </option>
    </select>

    <input
      v-if="type == 'text' "
      :id="id"
      v-model="value"
      type="text"
      :name="name"
      :disabled="disabled"
      :title="hint"
      class="form-input"
    >
  </div>
</template>

<script>
export default {
    'name': 'SchemaInput',
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
            return this.name + '-' + this.type
        },
        'rules': function() {
            const rules = this.form.schema[this.name]
            if (typeof rules == 'undefined') {
                throw 'no schema section available for ' + this.name
            }
            return rules
        },
        'type': function() {
            if (this.rules.type == 'boolean') {
                return 'checkbox'
            }
            if (typeof this.rules.options != 'undefined') {
                return 'select'
            }
            return 'text'
        },
        'errorMessage': function() {
            const errorMessage = this.form.errorMessages[this.name]
            return errorMessage ? errorMessage : ''
        },
        'extraDescription': function() {
            return typeof this.rules.extraDescription == 'undefined' ?
                this.helpText :
                this.rules.extraDescription.concat(this.helpText)
        },
        'extraClasses': function() {
            return (this.extraClass + ' ' + (
                this.errorMessage ? 'error' : ''
            )).trim()
        },
        'label': function() {
            return (
                this.rules.label + (
                    this.rules.unit ? ' (' + this.rules.unit + ')' : ''
                )
            ).trim()
        },
        'value': {
            'get': function() {
                return this.form.fields[this.name]
            },
            'set': function(newValue) {
                this.form.update(this.name, newValue)
            }
        },
        'selectOptions': function() {
            const displayOptions = this.rules.displayOptions
            const simpleOptions = typeof displayOptions == 'undefined'
            const options = this.rules.options
            if (typeof options == 'undefined') {
                throw 'INPUT-SELECT - Schema for ' +
                    this.name + ' has no options field'
            }
            return options.map(function(option, index) {
                return {
                    'display': simpleOptions ? option : displayOptions[index],
                    'value': option
                }
            })
        },
        'hint': function() {
            const min = typeof this.rules.minValue == 'undefined' ? '' :
                ('Minimum: ' + this.rules.minValue)
            const max = typeof this.rules.maxValue == 'undefined' ? '' :
                ('Maximum: ' + this.rules.maxValue)
            return (min + ' ' + max).trim()
        },
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
