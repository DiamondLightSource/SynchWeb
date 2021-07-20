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
  </div>
</template>

<script>
export default {
    'name': "MovieSelect",
    'props': {
        'max': {
            'type': Number,
            'required': true,
        },
    },
    'data': function() {
        return {
            'movieNumber': 1, // TODO: Vee Validate
            'timeout': null,
        }
    },
    'watch': {
        'movieNumber': function() {
            this.movieNumberChanged()
        }
    },
    'mounted': function() {
        this.movieNumberChanged()
    },
    'methods': {
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
                1000
            )
        },
    },
}
</script>
