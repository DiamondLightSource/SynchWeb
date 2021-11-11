<template>
  <div>
    Image:

    <flat-button
      :disabled="imageNumber <= 1"
      @click="click(1)"
    >
      <i class="fa fa-angle-double-left" />
    </flat-button>

    <flat-button
      :disabled="imageNumber <= 1"
      @click="click(imageNumber - 1)"
    >
      <i class="fa fa-angle-left" />
    </flat-button>

    <input
      type="text"
      name="image"
      :maxlength="maxLength"
      :size="maxLength"
      :value="imageNumber"
      @input.prevent="typed"
    >

    <flat-button
      :disabled="imageNumber >= max"
      @click="click(imageNumber + 1)"
    >
      <i class="fa fa-angle-right" />
    </flat-button>

    <flat-button
      :disabled="imageNumber >= max"
      @click="click(max)"
    >
      <i class="fa fa-angle-double-right" />
    </flat-button>

    <label>Show most recent
      <input
        v-model="showMostRecent"
        type="checkbox"
      >
    </label>
  </div>
</template>

<script>
import FlatButton from 'app/components/flat-button.vue'
import { mapGetters } from 'vuex'

export default {
    'name': "ImageSelect",
    'components': {
        'flat-button': FlatButton,
    },
    'props': {
        'max': {
            'type': String,
            'required': true,
        },
    },
    'data': function() {
        return {
            //'inputBoxClass': '',
            'imageNumber': 0,
            'showMostRecent': true,
            'eventTimeout': null,
            'keyTimeout': null,
        }
    },
    'computed': {
        ...mapGetters({
            'remoteSelectedImage': 'em/selectedImage'
        }),
        'maxLength': function() {
            return this.max.toString().length
        },
    },
    'watch': {
        // eslint-disable-next-line no-unused-vars
        'max': function(newValue, oldValue) {
            this.selectMax()
        },
        // eslint-disable-next-line no-unused-vars
        'showMostRecent': function(newValue, oldValue) {
            this.selectMax()
        },
        'remoteSelectedImage': function() {
            this.click(this.remoteSelectedImage)
        },
        'imageNumber': function(
            newValue,
            oldValue  // eslint-disable-line no-unused-vars
        ) {
            // use a timeout so that the user can "hammer" the button
            // without submitting "a million" server requests
            if (this.eventTimeout !== null) {
                clearTimeout(this.eventTimeout)
            }
            this.eventTimeout = setTimeout(
                () => {
                    this.eventTimeout = null
                    this.$emit('changed', newValue)
                },
                500
            )
        },
    },
    'mounted': function() {
        this.selectMax()
    },
    'methods': {
        'click': function(newImageNumber) {
            this.showMostRecent = false
            this.imageNumber = newImageNumber
        },
        'typed': function(inputEvent) {
            // use a timeout so that the user can type multiple digits
            // without submitting pointless server requests
            if (this.keyTimeout !== null) {
                clearTimeout(this.keyTimeout)
            }
            this.keyTimeout = setTimeout(
                () => {
                    this.keyTimeout = null
                    const newValue = parseInt(inputEvent.srcElement.value, 10)
                    if (newValue > 0 && newValue <= this.max) {
                        this.click(newValue)
                    }
                },
                1000
            )
        },
        'selectMax': function() {
            if (this.showMostRecent) {
                this.imageNumber = this.max
            }
        },
    },
}
</script>
