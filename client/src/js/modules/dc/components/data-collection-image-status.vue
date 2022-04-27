<template>
  <div class="tw-flex tw-w-full">
    <div class="tw-w-5/12 tw-p-1">
      <img :src="diffractionImageUrl" alt="diffraction image" :id="`data-collection-${imageData.id}-diffraction`" width="100%"/>
    </div>
    <div class="tw-w-7/12 tw-p-1">
      <data-collection-image-snapshots :images="snapShotImages"/>
    </div>
  </div>
</template>
<script>
import {mapGetters} from 'vuex'
import DataCollectionImageSnapshots from 'modules/dc/components/data-collection-image-snapshots.vue'
import XHRImage from 'utils/xhrimage'

export default {
  name: 'data-collection-image-status',
  components: {
    DataCollectionImageSnapshots
  },
  props: {
    dataCollectionType: {
      type: String,
      required: true
    },
    dataCollectionId: {
      type: Number,
      required: true
    },
    imageData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      snapShotImages: [],
      diffractionImageUrl: ''
    }
  },
  mounted() {
    this.lazyLoadSnapShotsImages()
  },
  methods: {
    lazyLoadSnapShotsImages() {
      const { SNS, DI, ID } = this.imageData

      if (typeof DI !== 'undefined' || DI !== null) {
        const link = `${this.apiUrl}/image/diff/id/${ID}`
        const image = new XHRImage()

        const imageUrl = (data) => {
          this.diffractionImageUrl = this.getImageResponse(data)
        }

        image.load(link, imageUrl)
      }


      if (SNS && SNS.length) {
        SNS.forEach((item, index) => {
          const imageData = new XHRImage()
          const imageUrl = (data) => {
            const url = this.getImageResponse(data)
            this.snapShotImages.push({
              id: index + 1,
              url: url
            })
          }
          imageData.load(`${this.apiUrl}/image/id/${ID}/f/1/n/${index + 1}`, imageUrl)
        })
      }
    },
    getImageResponse(data) {
      const responseHeaders = data.getAllResponseHeaders()
      const contentType = responseHeaders.match(/^Content-Type:\s*(.*?)$/mi)
      const response = data.response
      const mimeType = contentType[1] || 'image/png'
      const blob = new Blob([response], { type: mimeType })
      return window.URL.createObjectURL(blob)
    }
  },
  computed: {
    ...mapGetters({
      apiUrl: ['apiUrl']
    })
  }
}
</script>
<style scoped></style>