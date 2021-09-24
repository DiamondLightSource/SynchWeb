<template>
  <dialog-form
    title="New Data Collection"
    confirm-label="Add"
    schema-url="dc/schema"
    :post-url="postUrl"
    :show-dialog="showDialog"
    @posted="addSuccess"
    @cancel="$emit('cancel')"
  >
    <template #default="form">
      <div class="dialog-form-section">
        <h3 class="dialog-form-section-heading">
          Files
        </h3>

        <input-select
          name="acquisitionSoftware"
          :form="form"
        />
        <input-text
          name="imageDirectory"
          :form="form"
        />

        <input-select
          name="imageSuffix"
          :form="form"
        />
      </div>

      <div class="dialog-form-section">
        <h3 class="dialog-form-section-heading">
          Other Stuff
        </h3>

        <input-select
          name="voltage"
          :form="form"
        />

        <input-checkbox
          name="phasePlate"
          :form="form"
        />

        <input-text
          name="pixelSizeOnImage"
          :form="form"
        />
      </div>
    </template>
  </dialog-form>
</template>

<script>
import { mapGetters } from 'vuex'
import DialogForm from 'modules/types/em/components/dialog-form.vue'
import InputCheckbox from 'modules/types/em/components/input-checkbox.vue'
import InputSelect from 'modules/types/em/components/input-select.vue'
import InputText from 'modules/types/em/components/input-text.vue'

export default {
    'name': 'DataCollectionDialog',
    'components': {
        'dialog-form': DialogForm,
        'input-checkbox': InputCheckbox,
        'input-select': InputSelect,
        'input-text': InputText,
    },
    'props': {
        'showDialog': {
            'type': Boolean,
            'required': true,
        },
    },
    'computed': {
        ...mapGetters('proposal', ['currentVisit']),
        'postUrl': function() {
            return 'dc/new/' + this.currentVisit
        },
    },
    'methods': {
        'addSuccess': function(response) {
            this.$emit('cancel')
            this.$store.commit('notifications/addNotification', {
                'title': 'Data Collection Added',
                'message': 'data collection Added (' + response.id + ') - TODO: redirect to it\'s page',
                'level': 'success'
            })
        },
    },
}
</script>
