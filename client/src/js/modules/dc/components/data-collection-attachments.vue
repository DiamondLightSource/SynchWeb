<template>
  <div class="tw-w-full">
    <div class="tw-bg-modal-header-background tw-py-1 tw-pl-4 tw-pr-2 tw-rounded-sm tw-flex tw-w-full tw-justify-between tw-items-center tw-relative">
      <p class="tw-font-bold tw-text-link-color">Attachments</p>
      <button
          class="tw-flex tw-items-center tw-border tw-rounded-sm tw-border-content-border tw-bg-white tw-text-content-page-color tw-p-1"
          @click="$emit('close-modal')">
        <i class="fa fa-times"></i>
      </button>
    </div>

    <div class="tw-w-full content tw-px-2">
      <h1 class="tw-mb-2">Attachments</h1>

      <p class="help tw-mb-2">This page lists all attachments for the selected data collection</p>

      <div class="tw-w-full">
        <custom-table-component
          :data-list="attachments"
          table-class="tw-w-full"
          max-table-height="500px"
          :unset-hover="false">
          <template v-slot:tableHeaders>
            <td class="tw-w-5/12 tw-py-2 tw-pl-3">File</td>
            <td class="tw-w-3/12 tw-py-2 tw-pl-2">Type</td>
            <td class="tw-w-4/12 tw-py-2 tw-pl-2">Action</td>
          </template>

          <template v-slot:slotData="{ dataList }">
            <custom-table-row
              :class="['tw-w-full', rowIndex % 2 === 0 ? 'tw-bg-table-body-background' : 'tw-bg-table-body-background-odd']"
              v-for="(result, rowIndex) in dataList"
              :key="rowIndex"
              :result="result"
              :row-index="rowIndex">
              <template v-slot:default="{ result, rowIndex }">
                <td class="tw-w-5/12 tw-py-2 tw-pl-3">{{ result['FILEFULLPATH'] }}</td>
                <td class="tw-w-3/12 tw-py-2 tw-pl-2">{{ result['FILETYPE'] }}</td>
                <td class="tw-w-4/12 tw-py-2 tw-pl-2">
                  <span class="tw-w-full">
                    <a class="button tw-mr-1 tw-pointer" @click="downloadAttachment(result)"> <i class="fa fa-download"></i> Download</a>
                    <a v-if="result['FILETYPE'] === 'log'" class="button tw-ml-1  tw-pointer" @click="downloadLog(result)"> <i class="fa fa-download"></i> Download Log</a>
                    <router-link v-else-if="result['FILETYPE'] === 'recip'" class="button tw-ml-1" :to="`/dc/rsv/${result['DATACOLLECTIONID']}`"> <i class="fa fa-search"></i>Reciprocal Space Viewer</router-link>
                  </span>
                </td>
              </template>
            </custom-table-row>
          </template>
        </custom-table-component>
      </div>
    </div>
  </div>
</template>

<script>
import CustomTableComponent from 'app/components/custom-table-component.vue'
import CustomTableRow from 'app/components/custom-table-row.vue'

export default {
  name: "data-collection-attachments",
  components: {
    'custom-table-row': CustomTableRow,
    'custom-table-component': CustomTableComponent,

  },
  props: {
    attachments: {
      type: Array,
      default: () => ([])
    }
  },
  data() {
    return {
      url: ''
    }
  },
  methods: {
    async signAttachmentDownload(selectedAttachment) {
      this.url = `/download/attachment/id/${selectedAttachment['DATACOLLECTIONID']}/aid/${selectedAttachment['DATACOLLECTIONFILEATTACHMENTID']}`
      return await this.$store.dispatch('saveDataToApi', {
        url: '/download/sign',
        data: {
          validity: this.url
        },
        requestType: 'signing attachment file download'
      })
    },
    async downloadAttachment(selectedAttachment) {
      const response = await this.signAttachmentDownload(selectedAttachment)
      const fileName = selectedAttachment['FILENAME']

      const downloadData = await this.$store.dispatch('fetchDataFromApi', {
        url: `${this.url}?token=${response.token}`,
        requestType: 'fetch download data'
      })

      const file = window.URL.createObjectURL(new Blob([downloadData]))
      const documentUrl = document.createElement('a')
      documentUrl.href = file
      documentUrl.setAttribute('download', fileName)
      document.body.appendChild(documentUrl)
      documentUrl.click()
    },
    async downloadLog(selectedAttachment) {
      const response = await this.signAttachmentDownload(selectedAttachment)

      const fileName = selectedAttachment['FILENAME']

      const downloadData = await this.$store.dispatch('fetchDataFromApi', {
        url: `${this.url}?token=${response.token}`,
        requestType: 'fetch download data'
      })
    },
  }
}
</script>

<style scoped>

</style>