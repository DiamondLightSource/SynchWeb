<template>
  <div>
    Image:

    <flat-button
      :disabled="imageNumber <= 1"
      @click="imageNumber = 1"
    >
      <i class="fa fa-angle-double-left" />
    </flat-button>

    <flat-button
      :disabled="imageNumber <= 1"
      @click="imageNumber = imageNumber - 1"
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
      @click="imageNumber = imageNumber + 1"
    >
      <i class="fa fa-angle-right" />
    </flat-button>

    <flat-button
      :disabled="imageNumber >= max"
      @click="imageNumber = max"
    >
      <i class="fa fa-angle-double-right" />
    </flat-button>

    <label>Show most recent
      <input
        v-model="showLatest"
        type="checkbox"
      >
    </label>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import FlatButton from 'app/components/flat-button.vue'

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
        'latest': {
            'type': String,
            'required': true,
        },
    },
    'data': function() {
        return {
            'imageNumber': this.latest,
            'showLatest': true,
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
        'remoteSelectedImage': function(newValue) {
            this.imageNumber = newValue
        },
        'imageNumber': function(newValue) {
            if (newValue != this.latest) {
                this.showLatest = false
            }

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
        this.$watch(
            () => {
                return {
                    'latest': this.latest,
                    'showLatest': this.showLatest,
                }
            },
            (newValue) => {
                if (newValue.showLatest) {
                    this.imageNumber = newValue.latest
                }
            }
        )
        this.$emit('changed', this.imageNumber)
    },
    'methods': {
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
                        this.imageNumber = newValue
                    }
                },
                1000
            )
        },
    },
}
</script>
