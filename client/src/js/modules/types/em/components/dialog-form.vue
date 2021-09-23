<template>
  <dialog-modal
    :show-dialog="showDialog"
    :title="title"
    cancel-label="Cancel"
    :confirm-label="confirmLabel"
    @confirm="postIt"
    @cancel="$emit('cancel')"
  >
    <form
      v-if="showDialog && formReady"
      novalidate
      class="dialog-form"
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
    'name': 'DialogForm',
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
            console.log(this.formFields, this.formFields['wantCalculate'])
            this.formFields[name] = value
            this.$emit('update', {
                'name': name,
                'fields': this.formFields,
            })
        },
        'postIt': function() {
            this.$store.dispatch('em/post', {
                'url': this.postUrl,
                'requestData': this.formFields,
                'humanName': 'Relion Job',
                'errorHandler': (responseText) => {
                    var errorMessages
                    try {
                        errorMessages = JSON.parse(responseText).message.invalid
                    } catch (error) {
                        return false // didn't handle error - show alert
                    }
                    if (typeof errorMessages == 'object') {
                        this.errorMessages = errorMessages
                        return true // handled errors - don't show alert
                    }
                    return false // didn't handle error - show alert
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

<style>
.dialog-form {
    display: flex;
}
.dialog-form-section {
    margin: 5px;
    background-color: #e6e6e6;
    padding: 8px;
}
.dialog-form-section-heading {
    font-weight: bold;
}
</style>
