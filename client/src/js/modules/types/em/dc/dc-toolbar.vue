<template>
  <div class="dc-toolbar">
    <span class="button_holder">
      <a
        href="#"
        class="atp button button-notext"
        @click.prevent="addToProject"
      >
        <i class="fa fa-book" />
        <span>Add to Project</span>
      </a>

      <!-- TODO: this had an additional class
          <% if (FLAG) { %>button-highlight<% } %>
          see: src/js/models/datacollection.js
      -->
      <a
        href="#"
        class="button button-notext flag"
        title="Click to add this data collection to the list of favourite data collections"
        @click.prevent="flagModel"
      >
        <i class="fa fa-star-o" />
        <span>Favourite</span>
      </a>

      <!-- dcgLink isn't in use ?????

      <span class="dcglink">
        <a
          href="/dc/visit/<%-VIS_LINK%>/dcg/<%-DCG%>"
          class="perm button button-notext" title="Permalink"
        >
          <i class="fa fa-link"></i>
          <span>Permalink</span>
        </a>
      </span -->

      <span class="dclink">
        <a
          :href="dataCollectionUrl"
          class="perm button button-notext"
          title="Permalink"
        >
          <i class="fa fa-link" />
          <span>Permalink</span></a>
      </span>

      <!-- this.getOption('comments') ? show() : hide() -->
      <a
        href="#"
        class="comments button button-notext"
        title="Comments"
        @click.prevent="showComments"
      >
        <i class="fa fa-comments" />
        <b class="DCCC">{{ commentCount }}</b>
        <span>Comment(s)</span>
      </a>

      <!-- getOption('attachments') ? show() : hide() -->
      <a
        href="#"
        class="button attach"
        @click.prevent="showAttachments"
      >
        <i class="fa fa-file" />
        {{ attachmentCount }}
      </a>

      <a
        v-if="!archived"
        href="#"
        class="reprocess button button-notext"
        title="Reprocess"
        @click.prevent="reprocess"
      >
        <i class="fa fa-cog" />
        <span>Reprocess</span>
      </a>
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
import AddToProjectView from 'modules/projects/views/addto'
import AttachmentsView from 'modules/dc/views/attachments'
import DCCommentsView from 'modules/dc/views/dccomments'
import DialogView from 'views/dialog'
import ReprocessView from 'modules/dc/views/reprocess2' // TODO: has EM template

export default {
    'name': 'DcTitle',
    'props': {
        'dataCollection': { // Just the data!
            'type': Object,
            'required': true,
        },
        'dataCollectionModel': { // The whole model for Backbone compatibility
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
        'dataCollectionGroup': function() {
            return this.dataCollection.DCG
        },
        'fileDirAndTemplate': function() {
            return this.dataCollection.DIR + this.dataCollection.FILETEMPLATE
        },
        'displayPath': function() {
            return this.dataCollection[
                this.displayFullPath ? 'DIRFULL' : 'DIR'
            ] + this.dataCollection.FILETEMPLATE
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
            return this.visitHref + '/collection/' + this.dataCollection.ID
        },
        'commentCount': function() {
            return this.dataCollection.DCCC
        },
        'attachmentCount': function() {
            return this.dataCollection.DCAC
        },
        'startTime': function() {
            return this.dataCollection.ST
        },
        'archived': function() {
            return this.dataCollection.ARCHIVED == '1'
        },
    },
    'methods': {
        'addToProject': function() {
            console.log("show add to project")
            app.dialog.show(new AddToProjectView({
                'name': this.fileDirAndTemplate,
                'type': 'dc',
                'iid': this.dataCollectionGroup,
            }))
        },
        'flagModel': function() {
            console.log('FLAG NOT WORKING YET')
            // TODO: see template above and src/js/models/datacollection.js
            // this.dataCollectionModel.flag()
        },
        'showComments': function() {
            app.dialog.show(new DialogView({
                'title': 'Data Collection Comments',
                'view': new DCCommentsView({
                    'model': this.dataCollectionModel
                }),
                'autoSize': true
            }))
        },
        'showAttachments': function() {
            var viewData = []
            if (this.dataCollection.DCC > 1) {
                viewData.dcg = this.dataCollection.DCG
            } else {
                viewData.id = this.dataCollection.ID
            }
            app.dialog.show(new DialogView({
                'title': 'Attachments',
                'view': new AttachmentsView(viewData)
            }))
        },
        'reprocess': function() {
            /* If this is being included in a reprocess dialog
                it will require this extra checking:
            if (app.dialog.currentView instanceof ReprocessView) {
                app.dialog.currentView.collection.add(this.model)
                return
            } */
            app.dialog.show(new ReprocessView({
                'model': this.dataCollectionModel,
                'visit': this.visit,
            }))
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