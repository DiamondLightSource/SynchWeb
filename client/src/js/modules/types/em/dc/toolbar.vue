<template>
  <div class="toolbar">
    <span class="button_holder">
      <button-with-marionette-dialog
        icon="fa fa-book"
        button-text="Add to Project"
        dialog-title="Add to project"
        hint="Add to project"
        :m-view="addToProjectView"
        :m-view-options="addToProjectOptions"
      />

      <toolbar-button
        hint="Click to add this data collection to the list of favourite data collections"
        icon="fa fa-star-o"
        button-text="Favourite"
        :level="favouriteButtonLevel"
        @click="favourite"
      />

      <toolbar-button
        hint="Permalink"
        icon="fa fa-link"
        button-text="Permalink"
        @click="permalink"
      />

      <button-with-marionette-dialog
        icon="fa fa-comments"
        :button-label="commentsCount"
        :button-text="commentsLabel"
        dialog-title="Comments"
        hint="Comments"
        :m-view="commentsView"
        :m-view-options="commentsOptions"
        @open="commentsOpen"
        @confirm="commentsChange"
        @cancel="commentsChange"
      />

      <button-with-marionette-dialog
        icon="fa fa-file"
        :button-label="attachmentsCount"
        :button-text="attachmentsLabel"
        dialog-title="Attachments"
        hint="Attachments"
        :m-view="attachmentsView"
        :m-view-options="attachmentsOptions"
      />

      <reprocess-button
        :processing-disallowed-reason="processingDisallowedReason"
        :default-parameters="null"
      />
    </span>

    <!-- if you're using this outside EM you will need to check if
         the current page is a collection or a visit here -->
    <span class="date">
      [<a :href="'/dc/visit/' + visit">{{ visit }}</a>]
      {{ dataCollection.startTime }}
    </span>

    <span class="displayPath">
      <flat-button @click="displayPathFull = !displayPathFull">
        <i :class="displayPathClass" />
      </flat-button>
      <span class="temp">{{ displayPath }}</span>
    </span>

    <i
      v-if="dataCollection.archived == '1'"
      class="fa fa-archive r"
      title="This data collection is archived and data is no longer available on disk"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import AddToProjectView from 'modules/projects/views/addto'
import AttachmentsView from 'modules/dc/views/attachments'
import ButtonWithMarionetteDialog from 'modules/types/em/components/button-with-marionette-dialog.vue'
import DataCollectionModel from 'models/datacollection.js'
import DCCommentsView from 'modules/dc/views/dccomments'
import FlatButton from 'app/components/flat-button.vue'
import ReprocessButton from 'modules/types/em/components/reprocess-button.vue'
import ToolbarButton from 'modules/types/em/components/toolbar-button.vue'

export default {
    'name': 'DcToolbar',
    'components': {
        'button-with-marionette-dialog': ButtonWithMarionetteDialog,
        'flat-button': FlatButton,
        'reprocess-button': ReprocessButton,
        'toolbar-button': ToolbarButton,
    },
    'props': {
        'dataCollection': {
            'type': Object,
            'required': true,
        },
        'processingDisallowedReason': {
            'type': String,
            'required': true,
        },
    },
    'data': function() {
        return {
            'displayPathFull': false,
        }
    },
    'computed': {
        ...mapGetters({
            'visit': 'proposal/currentVisit',
            'appUrl': 'appUrl', // top level appUrl not "EM adjusted"
        }),
        'dataCollectionId': function() {
            return this.dataCollection.dataCollectionId
        },
        'addToProjectView': function() {
            return AddToProjectView
        },
        'addToProjectOptions': function() {
            return {
                'name': this.dataCollection.shortImageDirectory + '/' +
                    this.dataCollection.fileTemplate,
                'type': 'dc',
                'iid': this.dataCollection.dataCollectionGroupId
            }
        },
        'isFavourite': function() {
            return this.dataCollection.comments.includes('_FLAG_')
        },
        'favouriteButtonLevel': function() {
            return this.isFavourite ? 'info' : 'secondary'
        },
        'permalinkUrl': function() {
            return this.appUrl +
                '/dc/visit/' + this.visit +
                '/collection/' + this.dataCollectionId
        },
        'commentsCount': function() {
            return this.dataCollection.commentsCount
        },
        'commentsLabel': function() {
            return 'Comment' + (this.commentsCount != '1' ? 's' : '')
        },
        'commentsView': function() {
            return DCCommentsView
        },
        'commentsModel': function() {
            return new DataCollectionModel({
                'ID': this.dataCollectionId
            })
        },
        'commentsOptions': function() {
            return { 'model': this.commentsModel }
        },
        'attachmentsCount': function() {
            return this.dataCollection.attachmentsCount
        },
        'attachmentsLabel': function() {
            return 'Attachment' + (this.attachmentsCount != 1 ? 's' : '')
        },
        'attachmentsView': function() {
            return AttachmentsView
        },
        'attachmentsOptions': function() {
            return { 'id': this.dataCollectionId }
        },
        'displayPath': function() {
            return this.dataCollection[
                this.displayPathFull ? 'imageDirectory' : 'shortImageDirectory'
            ] + this.dataCollection.fileTemplate
        },
        'displayPathClass': function() {
            return 'fa fa-caret-' + (this.displayPathFull ? 'left' : 'right')
        },
    },
    'methods': {
        'favourite': function() {
            this.$store.dispatch('em/api/post', {
                'humanName': 'Flag',
                'url': 'dc/comments/' + this.dataCollectionId,
                'requestData': {
                    'comments': this.isFavourite ?
                        this.dataCollection.comments.replace('_FLAG_','').trim() :
                        this.dataCollection.comments.trim() + ' _FLAG_'
                },
            }).then(
                (response) => { this.$emit('fetch', response) }
            )
        },
        'permalink': function() {
            const vm = this
            navigator.clipboard.writeText(this.permalinkUrl).then(
                function() {
                    vm.$store.commit('notifications/addNotification', {
                        'title': 'Copied',
                        'message': 'Data collection link URL copied to clipboard',
                        'level': 'info'
                    })
                },
                function() {
                    vm.$store.commit('notifications/addNotification', {
                        'title': 'Not copied',
                        'message': 'link not copied to clipboard - do you need to grant permissions?',
                        'level': 'error'
                    })
                }
            );
        },
        'commentsUnchanged': function() {
            return this.commentsModel.get('DCCC') ===
                this.dataCollection.commentsCount;
        },
        'commentsOpen': function() {
            if (this.commentsUnchanged()) {
                return
            }
            /* This is a bit "guk"... fetching a Backbone model just to see the
               comments... but, as the future aim is to use Vue for everything
               and get rid of all this Backbone/Marionette stuff, I'm too lazy
               to make this any better right now.... */
            // Set a blank type to prevent url mangling by the Backbone model
            this.commentsModel.set('TYPE', '')
            this.$store.dispatch('getModel', this.commentsModel).then(
                (model) => {
                    console.log('fetched Data Collection model', model)
                },
                (error) => {
                    console.log('error fetching Data Collection model', error)
                    this.$store.commit('notifications/addNotification', {
                        'title': 'Error',
                        'message': 'Could not retrieve data collection',
                        'level': 'error'
                    })
                }
            )
        },
        'commentsChange': function() {
            if (this.commentsUnchanged()) {
                return
            }
            this.$emit('fetch', 'comments')
        }
    },
}
</script>

<style scoped>
.toolbar {
    padding-bottom: 5px;
}
.date,
.displayPath {
    margin-left: 20px;
}
</style>
