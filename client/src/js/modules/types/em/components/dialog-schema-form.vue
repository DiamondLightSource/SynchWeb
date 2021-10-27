<template>
  <dialog-modal
    :show-dialog="showDialog"
    :title="title"
    cancel-label="Cancel"
    :confirm-label="confirmLabel"
    :block-background-click="true"
    @confirm="postIt"
    @cancel="$emit('cancel')"
  >
    <div class="dialog-schema-form-error">
      {{ errorMessage }}
    </div>
    <form
      v-if="showDialog && formReady"
      novalidate
      class="dialog-schema-form"
    >
      <slot
        :schema="schema"
        :fields="formFields"
        :error-messages="errorMessages"
        :update="update"
      />
    </form>

    <template #middleButtons>
      <dialog-button
        level="warning"
        @click="setToDefaults"
      >
        Clear
      </dialog-button>
    </template>
  </dialog-modal>
</template>

<script>
import DialogButton from 'app/components/dialog-button.vue'
import DialogModal from 'app/components/dialog-modal.vue'

export default {
    'name': 'DialogSchemaForm',
    'components': {
        'dialog-button': DialogButton,
        'dialog-modal': DialogModal,
    },
    'props': {
        'showDialog': {
            'type': Boolean,
            'required': true,
        },
        'title': {
            'type': String,
            'required': true,
        },
        'postUrl': {
            'type': String,
            'required': true,
        },
        'schemaUrl': {
            'type': String,
            'required': true,
        },
        /* Normally the default values would come from the schema
           But those defaults can be overridden with these for edge-cases */
        'defaults': {
            'type': Object,
            'default': function() { return {} },
        },
        'confirmLabel': {
            'type': String,
            'required': true,
        },
    },
    'data': function() {
        return {
            'errorMessage': '',
            'errorMessages': {},
            'schema': {},
            'formFields': {},
        }
    },
    'computed': {
        'formReady': function() {
            return Object.keys(this.schema).length > 0
        },
    },
    'watch': {
        'defaults': function() {
            this.setToDefaults()
        }
    },
    'mounted': function() {
        this.$store.dispatch('em/api/fetch', {
            'url': this.schemaUrl,
            'humanName': this.title + ' Schema',
        }).then(
            (response) => {
                this.schema = response
                this.setToDefaults()
            }
        )
    },
    'methods': {
        'update': function(name, value) {
            this.formFields[name] = value
            this.$emit('update', {
                'name': name,
                'fields': this.formFields,
            })
        },
        'getADefault': function(name) {
            if (
                this.defaults !== null &&
                typeof this.defaults[name] != 'undefined'
            ) {
                return this.defaults[name]
            }
            if (typeof this.schema[name].default != 'undefined') {
                return this.schema[name].default
            }
            return ''
        },
        'convertType': function(type, value) {
            switch(type) {
            case 'string':
                return String(value)
            case 'real':
                return value ? parseFloat(value) : 0
            case 'integer':
                return value ? parseInt(value, 10) : 0
            case 'boolean':
                return ['true', '1', 'yes', true, 1].includes(value)
            default:
                throw 'type ' + type + ' not defined in convertType'
            }
        },
        'setToDefaults': function() {
            Object.keys(this.schema).forEach((name) => {
                const rules = this.schema[name]
                const schemaType = typeof rules.type == 'undefined' ?
                    'string' : rules.type
                this.$set(
                    this.formFields,
                    name,
                    this.convertType(
                        schemaType,
                        this.getADefault(name)
                    )
                )
            });
            console.log(this.title + 'fields set to defaults', this.formFields)
        },
        'postIt': function() {
            this.errorMessages = {}
            this.errorMessage = ''
            this.$store.dispatch('em/api/post', {
                'url': this.postUrl,
                'requestData': this.formFields,
                'humanName': this.title,
                'errorHandler': (payload) => {
                    switch(typeof payload) {
                    case 'object':
                        this.errorMessages = payload
                        return true // handled errors - don't show alert
                    case 'string':
                        this.errorMessage = payload
                        return true // handled errors - don't show alert
                    default:
                        return false // didn't handle error - show alert
                    }
                },
            }).then(
                (response) => {
                    this.$emit('posted', response)
                }
            )
        },
    },
}
</script>

<style scoped>
.dialog-schema-form {
    display: flex;
}
.dialog-schema-form-error {
    color: #f56565;
    font-weight: bold;
}
</style>
