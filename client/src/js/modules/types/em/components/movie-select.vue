<template>
  <div>
    Movie:

    <flat-button
      :disabled="index < 1"
      @click="click(0)"
    >
      <i class="fa fa-angle-double-left" />
    </flat-button>

    <flat-button
      :disabled="index < 1"
      @click="click(index - 1)"
    >
      <i class="fa fa-angle-left" />
    </flat-button>

    <input
      type="text"
      name="movie"
      :maxlength="maxLength"
      :size="maxLength"
      :value="movieNumber"
      @input.prevent="typed"
    >

    <flat-button
      :disabled="index >= lastIndex"
      @click="click(index + 1)"
    >
      <i class="fa fa-angle-right" />
    </flat-button>

    <flat-button
      :disabled="index >= lastIndex"
      @click="click(lastIndex)"
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
    'name': "MovieSelect",
    'components': {
        'flat-button': FlatButton,
    },
    'props': {
        'movieList': {
            'type': Array,
            'required': true,
        },
    },
    'data': function() {
        return {
            'inputBoxClass': '',
            'index': 0,
            'showMostRecent': true,
            'eventTimeout': null,
            'keyTimeout': null,
        }
    },
    'computed': {
        ...mapGetters({
            'remoteSelectedMovie': 'em/selectedMovie'
        }),
        'lastIndex': function() {
            return this.movieList.length - 1
        },
        'maxLength': function() {
            return this.movieList.reduce(function(max, current) {
                const length = current.toString().length
                return length > max ? length : max
            }, 0)
        },
        'movieNumber': function() {
            return this.movieList[this.index]
        },
    },
    'watch': {
        // eslint-disable-next-line no-unused-vars
        'movieList': function(newValue, oldValue) {
            this.selectLatest()
        },
        // eslint-disable-next-line no-unused-vars
        'showMostRecent': function(newValue, oldValue) {
            this.selectLatest()
        },
        'remoteSelectedMovie': function() {
            this.click(this.remoteSelectedMovie)
        },
        'movieNumber': function(
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
        this.selectLatest()
    },
    'methods': {
        'click': function(newIndex) {
            this.showMostRecent = false
            this.index = newIndex
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
                    const newValue = parseInt(
                        inputEvent.srcElement.value, 10
                    ).toString()
                    const newIndex = this.movieList.indexOf(newValue)
                    const exists = newIndex >= 0
                    this.inputBoxClass = exists ? '' : 'invalid'
                    if (exists) {
                        this.click(newIndex)
                    }
                },
                1000
            )
        },
        'selectLatest': function() {
            if (this.showMostRecent) {
                this.index = this.lastIndex
            }
        },
    },
}
</script>
