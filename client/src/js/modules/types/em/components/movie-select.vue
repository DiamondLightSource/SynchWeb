<template>
  <div>
    Movie:

    <base-input-button
      :disabled="movieNumber <= 1"
      @click="movieNumber = 1"
    >
      <i class="fa fa-angle-double-left" />
    </base-input-button>

    <base-input-button
      :disabled="movieNumber <= 1"
      @click="movieNumber--"
    >
      <i class="fa fa-angle-left" />
    </base-input-button>

    <input
      v-model.number="movieNumber"
      type="text"
      :maxlength="maxlength"
      :size="maxlength"
      name="movie"
    >

    <base-input-button
      :disabled="movieNumber >= max"
      @click="movieNumber++"
    >
      <i class="fa fa-angle-right" />
    </base-input-button>

    <base-input-button
      :disabled="movieNumber >= max"
      @click="movieNumber = max"
    >
      <i class="fa fa-angle-double-right" />
    </base-input-button>

    <label>Show most recent
      <input
        v-model="showMostRecent"
        type="checkbox"
      >
    </label>
  </div>
</template>

<script>
import BaseInputButton from 'app/components/base-input-button.vue'

export default {
    'name': "MovieSelect",
    'components': {
        'base-input-button': BaseInputButton,
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
