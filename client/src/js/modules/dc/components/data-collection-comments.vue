<template>
  <div class="tw-w-full">
    <div class="tw-bg-modal-header-background tw-py-1 tw-pl-4 tw-pr-2 tw-rounded-sm tw-flex tw-w-full tw-justify-between tw-items-center tw-relative">
      <p class="tw-font-bold tw-text-link-color">Data Collection Comments</p>
      <button
        class="tw-flex tw-items-center tw-border tw-rounded-sm tw-border-content-border tw-bg-white tw-text-content-page-color tw-p-1"
        @click="$emit('close-modal')">
        <i class="fa fa-times"></i>
      </button>
    </div>

    <div class="tw-w-full tw-p-2 content">
      <h1 class="tw-text-2xl">Comments for {{ dataCollection['ST'] }} - {{ dataCollection['DIR'] }}{{ dataCollection['FILETEMPLATE'] }}</h1>

      <div class="content">
        <h1>Add a Comment</h1>
        <validation-provider v-slot="{ errors, valid }" tag="div" :rules="{ required: true }">
          <base-input-text-area
            label="Comment (Markdown Supported)"
            v-model="newComment['COMMENTS']"
            outer-class="tw-w-3/4 tw-flex tw-items-start"
            inputClass="tw-flex-grow tw-rounded tw-border tw-ml-2"
            :rows="8"/>

          <button class="button tw-px-4 tw-py-2" @click="addNewComment" :disabled="!valid">Add Comment</button>
        </validation-provider>
      </div>

      <div class="tw-w-full tw-p-2 content" v-if="comments.length > 0">
        <h1>Comments:</h1>
        <div :class="[commentIndex % 2 === 0 ? 'tw-bg-table-body-background-odd' : 'tw-bg-table-body-background-odd', 'tw-p-3', 'tw-rounded', 'tw-my-1']" v-for="(comment, commentIndex) in comments" :key="commentIndex">
          <p class="tw-font-bold tw-text-link-color tw-mb-2">{{ comment['GIVENNAME'] }} {{ comment['FAMILY NAME']}} said on {{ formatDate(comment['CREATETIME'])}}</p>
          <div class="" v-html="comment['COMMENTSMD']"></div>
        </div>
      </div>

      <div v-else class="tw-w-full tw-p-2" >
        <p class="tw-text-link-color">No comments yet</p>
      </div>
    </div>
  </div>
</template>

<script>
import { DateTime } from 'luxon'
import { ValidationProvider } from 'vee-validate'
import BaseInputTextArea from 'app/components/base-input-textarea.vue'
import DataCollectionComment from 'modules/dc/models/dccomment'

export default {
  name: 'data-collection-comments',
  components: {
    'base-input-text-area': BaseInputTextArea,
    'validation-provider': ValidationProvider
  },
  props: {
    dataCollection: {
      type: Object,
      required: true,
      default: () => ({})
    },
    comments: {
      type: Array,
      default: () => ([])
    },
    proposalUsers: {
      type: Array,
      default: () => ([])
    }
  },
  data() {
    return {
      newComment: {
        COMMENTS: '',
        PERSONID: +this.$store.getters['user/getPersonId'],
        DATACOLLECTIONID: +this.dataCollection['ID']
      },
      commentModel: new DataCollectionComment()
    }
  },
  methods: {
    formatDate(date) {
      return DateTime.fromFormat(date, 'dd-MM-yyyy HH:mm:ss', { zone: 'Europe/London' }).toLocaleString(DateTime.DATETIME_FULL)
    },
    async addNewComment() {
      this.commentModel.set(this.newComment)
      this.$emit('save-new-comment', this.commentModel)
    }
  }
}
</script>

<style scoped>

</style>