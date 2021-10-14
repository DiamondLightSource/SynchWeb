<template>
  <dialog-modal
    :show-dialog="showDialog"
    :title="title"
    cancel-label="Cancel"
    :confirm-label="confirmLabel"
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
  </dialog-modal>
</template>

<script>
import DialogModal from 'app/components/dialog-modal.vue'

export default {
    'name': 'DialogSchemaForm',
    'components': {
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
    'mounted': function() {
        this.$store.dispatch('em/fetch', {
            'url': this.schemaUrl,
            'humanName': this.title + ' Schema',
        }).then(
            (response) => {
                this.schema = response
                Object.keys(this.schema).forEach((name) => {
                    const schemaDefault = this.schema[name].default
                    this.$set(
                        this.formFields,
                        name,
                        typeof schemaDefault == 'undefined' ? '' : schemaDefault
                    )
                })
                console.log(
                    this.title + 'fields set to defaults', this.formFields
                )
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
        'postIt': function() {
            this.errorMessages = {}
            this.errorMessage = ''
            this.$store.dispatch('em/post', {
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
