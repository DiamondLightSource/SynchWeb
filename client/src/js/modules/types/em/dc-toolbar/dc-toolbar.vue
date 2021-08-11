<template>
  <div class="dc-toolbar">
    <span class="button_holder">
      <add-to-project-button :data-collection-model="dataCollectionModel" />

      <favourite-button :data-collection-model="dataCollectionModel" />

      <!-- DCG Link -->

      <span class="dclink">
        <a
          :href="dataCollectionUrl"
          class="perm button button-notext"
          title="Permalink"
        >
          <i class="fa fa-link" />
          <span>Permalink</span>
        </a>
      </span>

      <comments-button :data-collection-model="dataCollectionModel" />

      <attachments-button :data-collection-model="dataCollectionModel" />

      <reprocess-button
        v-if="!archived"
        :data-collection-model="dataCollectionModel"
      />
    </span>

    <!-- if you're using this outside EM you will need to check if
         the current page is a collection or a visit here -->
    <span class="date">
      [<a href="visitHref">{{ visit }}</a>]
      {{ startTime }}
    </span>

    <span class="spacer"> - </span>

    <i
      class="button fa expand"
      :class="expandClass"
      @click="displayFullPath = !displayFullPath"
    />
    <span class="temp">{{ displayPath }}</span>

    <i
      v-if="archived"
      class="fa fa-archive r"
      title="This data collection is archived and data is no longer available on disk"
    />
  </div>
</template>

<script>
import AddToProjectButton from 'modules/types/em/dc-toolbar/add-to-project-button.vue'
import AttachmentsButton from 'modules/types/em/dc-toolbar/attachments-button.vue'
import CommentsButton from 'modules/types/em/dc-toolbar/comments-button.vue'
import FavouriteButton from 'modules/types/em/dc-toolbar/favourite-button.vue'
import ReprocessButton from 'modules/types/em/dc-toolbar/reprocess-button.vue'

export default {
    'name': 'DcToolbar',
    'components': {
        'add-to-project-button': AddToProjectButton,
        'attachments-button': AttachmentsButton,
        'comments-button': CommentsButton,
        'favourite-button': FavouriteButton,
        'reprocess-button': ReprocessButton,
    },
    'props': {
        'dataCollectionModel': {
            'type': Object,
            'required': true,
        },
    },
    'data': function() {
        return {
            'displayFullPath': false,
        }
    },
    'computed': {
        'displayPath': function() {
            return this.dataCollectionModel.get(
                this.displayFullPath ? 'DIRFULL' : 'DIR'
            ) + this.dataCollectionModel.get('FILETEMPLATE')
        },
        'expandClass': function() {
            return this.displayFullPath ? 'fa-caret-left' : 'fa-caret-right'
        },
        'visit': function() {
            return this.$store.state.proposal.visit
        },
        'visitHref': function() {
            return '/dc/visit/' + this.visit
        },
        // This URL format is unique to EM
        // If using the toolbar in a different "type", adjustment will be needed
        'dataCollectionUrl': function() {
            return this.visitHref + '/collection/' +
                this.dataCollectionModel.get('ID')
        },
        'startTime': function() {
            return this.dataCollectionModel.get('ST')
        },
        'archived': function() {
            return this.dataCollectionModel.get('ARCHIVED') == '1'
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