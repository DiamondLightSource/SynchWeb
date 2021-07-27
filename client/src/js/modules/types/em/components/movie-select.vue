<template>
  <div class="dcap">
    Movie:
    <a
      href="#"
      class="button prev"
      @click.prevent="prevMovie"
    ><i class="fa fa-angle-left" /></a>
    <input
      v-model.number="movieNumber"
      type="text"
      name="movie"
    >
    <a
      href="#"
      class="button next"
      @click.prevent="nextMovie"
    ><i class="fa fa-angle-right" /></a>
    <label>Show most recent
      <input
        v-model="showMostRecent"
        type="checkbox"
      >
    </label>
  </div>
</template>

<script>
export default {
    'name': "MovieSelect",
    'props': {
        'max': {
            // TODO: Vee Validate movieNumber form input!
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
    'watch': {
        // eslint-disable-next-line no-unused-vars
        'max': function(newValue, oldValue) {
            this.maxMovie()
        },
        // eslint-disable-next-line no-unused-vars
        'showMostRecent': function(newValue, oldValue) {
            this.maxMovie()
        },
        // eslint-disable-next-line no-unused-vars
        'movieNumber': function(newValue, oldValue) {
            this.movieNumberChanged()
        },
    },
    'mounted': function() {
        this.maxMovie()
    },
    'methods': {
        'maxMovie': function() {
            if (this.showMostRecent) {
                this.movieNumber = this.max
            }
        },
        'nextMovie': function() {
            // TODO: make button disableable
            if (this.movieNumber < this.max) {
                this.movieNumber = this.movieNumber + 1
            }
        },
        'prevMovie': function() {
            // TODO: make button disableable
            if (this.movieNumber > 0) {
                this.movieNumber = this.movieNumber - 1
            }
        },
        'movieNumberChanged': function() {
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
