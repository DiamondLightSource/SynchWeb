<template>
  <div class="dc-toolbar">
    <span class="button_holder">
      <add-to-project-button :data-collection-model="dataCollectionModel" />

      <favourite-button :data-collection-model="dataCollectionModel" />

      <!-- DCG Link -->

      <permalink-button :data-collection-model="dataCollectionModel" />

      <comments-button :data-collection-model="dataCollectionModel" />

      <attachments-button :data-collection-model="dataCollectionModel" />

      <reprocess-button
        :data-collection="dataCollectionModel.attributes"
        :auto-processing="autoProcessing"
      />
    </span>

    <!-- if you're using this outside EM you will need to check if
         the current page is a collection or a visit here -->
    <span class="date">
      [<a href="visitHref">{{ visit }}</a>]
      {{ startTime }}
    </span>

    <span class="spacer"> - </span>

    <display-path :data-collection-model="dataCollectionModel" />

    <i
      v-if="dataCollectionModel.get('ARCHIVED') == '1'"
      class="fa fa-archive r"
      title="This data collection is archived and data is no longer available on disk"
    />
  </div>
</template>

<script>
import AddToProjectButton from 'modules/types/em/dc-toolbar/add-to-project-button.vue'
import AttachmentsButton from 'modules/types/em/dc-toolbar/attachments-button.vue'
import CommentsButton from 'modules/types/em/dc-toolbar/comments-button.vue'
import DisplayPath from 'modules/types/em/dc-toolbar/display-path.vue'
import FavouriteButton from 'modules/types/em/dc-toolbar/favourite-button.vue'
import PermalinkButton from 'modules/types/em/dc-toolbar/permalink-button.vue'
import ReprocessButton from 'modules/types/em/dc-toolbar/reprocess-button.vue'

export default {
    'name': 'DcToolbar',
    'components': {
        'add-to-project-button': AddToProjectButton,
        'attachments-button': AttachmentsButton,
        'comments-button': CommentsButton,
        'display-path': DisplayPath,
        'favourite-button': FavouriteButton,
        'permalink-button': PermalinkButton,
        'reprocess-button': ReprocessButton,
    },
    'props': {
        'dataCollectionModel': {
            'type': Object,
            'required': true,
        },
        'autoProcessing': {
            'type': Array,
            'required': true,
        },
    },
    'computed': {
        'visit': function() {
            return this.$store.state.proposal.visit
        },
        'visitHref': function() {
            return '/dc/visit/' + this.visit
        },
        'startTime': function() {
            return this.dataCollectionModel.get('ST')
        },
    },
}
</script>

<style scoped>
.dc-toolbar {
    padding-top: 5px;
    padding-bottom: 5px;
}
</style>