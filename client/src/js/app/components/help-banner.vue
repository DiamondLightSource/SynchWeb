<template>
	<p :class="bannerClass(level)">{{this.message}}</p>
</template>

<script>

export default {
	name: 'help-banner',
	props: {
		message: {
			type: String,
			default: ''
		},
		level: {
			type: String,
			default: ''
		},
    // Should this help banner toggle with OnHelp setting?
    toggleHelp: {
      type: Boolean,
      default: false
    }
	},
	methods: {
    bannerClass: function(level) {
      let classes = this.toggleHelp ? 'help ' : 'help-banner '

      if (level === 'notify') {
        classes += 'tw-bg-content-active tw-text-body-color'
      } else if (level === 'alert') {
        classes += 'tw-bg-content-inactive tw-text-body-color'
      } else {
        classes += 'tw-text-content-help-color tw-bg-content-help-background'
      }
      console.log("Help classes for level " + this.level + " = " + classes)
      return classes
    }
  }
}
</script>

<style scoped>
.help-banner {
	padding: 1%;
	margin-bottom: 1%;
	border-radius: 5px;
}

</style>