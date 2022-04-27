<template>
  <div class="tw-w-full tw-flex">
    <div v-if="enableSlideShow" class="tw-w-1/12 tw-flex tw-justify-center tw-items-center">
      <a class="tw-text-white" @click.stop="showPreviousImage"><i class="fa fa-caret-left fa-2x"></i> </a>
    </div>
    <div v-for="(image, imageIndex) in images" :key="imageIndex" :id="`snapshot-image-${imageIndex}`" class="tw-flex-1 tw-hidden">
      <div class="tw-flex tw-w-full tw-justify-center">
        <img :src="image.url" :alt="`Crystal Snapshot ${image.id}`" />
      </div>
      <div v-if="enableSlideShow" class="tw-w-full tw-flex tw-justify-between" >
        <p class="tw-text-white">Crystal Snapshot {{ image.id }}</p>
        <p class="tw-text-white">{{ currentImageIndex + 1 }} of {{ images.length }}</p>
      </div>
    </div>
    <div v-if="enableSlideShow" class="tw-w-1/12 tw-flex tw-justify-center tw-items-center">
      <a class="tw-text-white" @click.stop="showNextImage"><i class="fa fa-caret-right fa-2x"></i> </a>
    </div>
  </div>
</template>

<script>
export default {
  name: "data-collection-image-snapshots",
  props: {
    images: {
      type: Array,
      default: () => ([])
    },
    enableSlideShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      currentImageIndex: 0
    }
  },
  mounted() {
    this.startImageDisplay()
  },
  methods: {
    startImageDisplay() {
      if (this.images.length > 0) {
        $('#snapshot-image-0').removeClass('tw-hidden')
      }
    },
    showPreviousImage() {
      $(`#snapshot-image-${this.currentImageIndex}`).addClass('tw-hidden')

      const lastImageIndex = this.images.length - 1
      let newImageIndex = -1
      if (this.currentImageIndex === 0) {
        newImageIndex = lastImageIndex
      } else {
        newImageIndex = this.currentImageIndex - 1
      }

      $(`#snapshot-image-${newImageIndex}`).addClass('tw-hidden')
      this.currentImageIndex = newImageIndex
    },
    showNextImage() {
      $(`#snapshot-image-${this.currentImageIndex}`).addClass('tw-hidden')

      const lastImageIndex = this.images.length - 1
      let nextImageIndex = -1
      if (this.currentImageIndex === lastImageIndex) {
        nextImageIndex = 0
      } else {
        nextImageIndex = this.currentImageIndex + 1
      }

      $(`#snapshot-image-${nextImageIndex}`).addClass('tw-hidden')
      this.currentImageIndex = nextImageIndex
    }
  },
  watch: {
    images: {
      deep: true,
      immediate: true,
      handler: 'startImageDisplay'
    }
  }
}
</script>

<style scoped>

</style>