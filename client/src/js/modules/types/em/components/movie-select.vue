<template>
  <div>
    Movie:

    <flat-button
      :disabled="movieNumber <= 1"
      @click="movieNumber = 1"
    >
      <i class="fa fa-angle-double-left" />
    </flat-button>

    <flat-button
      :disabled="movieNumber <= 1"
      @click="movieNumber--"
    >
      <i class="fa fa-angle-left" />
    </flat-button>

    <input
      v-model.number="movieNumber"
      type="text"
      :maxlength="maxlength"
      :size="maxlength"
      name="movie"
    >

    <flat-button
      :disabled="movieNumber >= max"
      @click="movieNumber++"
    >
      <i class="fa fa-angle-right" />
    </flat-button>

    <flat-button
      :disabled="movieNumber >= max"
      @click="movieNumber = max"
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

export default {
    'name': "MovieSelect",
    'components': {
        'flat-button': FlatButton,
    },
    'props': {
        'max': {
            'type': Number,
            'required': true,
        },
    },
    'data': function() {
        return {
            'movieNumber': 0,
            'showMostRecent': true,
            'timeout': null,
        }
    },
    'computed': {
        'maxlength': function() {
            return this.max.toString().length
        }
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
        // eslint-disable-next-line no-unused-vars
        'movieNumber': function(newValue, oldValue) {
            if (this.movieNumber < 1) {
                this.movieNumber = 1
            }
            if (this.movieNumber > this.max) {
                this.movieNumber = this.max
            }
            this.selectionChanged()
        },
    },
    'mounted': function() {
        this.selectMax()
    },
    'methods': {
        'selectMax': function() {
            if (this.showMostRecent) {
                this.movieNumber = this.max
            }
        },
        'selectionChanged': function() {
            const vm = this
            if (vm.timeout !== null) {
                clearTimeout(vm.timeout)
            }
            vm.timeout = setTimeout(
                function () {
                    vm.timeout = null
                    vm.$emit('changed', vm.movieNumber)
                },
                500
            )
        },
    },
}
</script>
