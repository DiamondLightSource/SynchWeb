<template>
  <div class="content">
    <div class="tw-flex tw-w-full tw-justify-between tw-text-2xl tw-font-page-header tw-border-b tw-border-black tw-pb-3">
      <h1>Data Collections for {{ visit }} on {{ beamline }}</h1>
<!--      <data-collection-stack-view-->
<!--        :modelData="pieData"-->
<!--        class="tw-w-1/2"-->
<!--      />-->
    </div>
    <div>
      <p class="help">This page shows all data collections for the selected visit. If the visit is ongoing the page will automatically update as new data is collected. Auto processing results will be displayed</p>

      <% if (visit && !IS_SINGLE) { %>
      <% if (VISIT.search('cm') == -1 && VISIT.search('nt') == -1 && VISIT.search('nr') == -1 && ACTIVE != '1' && ARCHIVED != '1') { %>
      <p class="message notify">
        This visit is inactive and will not auto update
        | Auto Refresh <input type="checkbox" name="autorefresh" value="1" />
        <a href="#" class="button refresh"><i class="fa fa-refresh"></i> Refresh</a>
      </p>
      <% } %>

      <% if (ARCHIVED == "1") { %>
      <p class="message notify">
        This visit is archived, data is no longer held on disk. You cannot download processing results, view full sized diffraction images, or reprocess data.
      </p>
      <% } %>
    </div>
    <div class="tw-w-full tw-flex tw-mt-2">
      <router-link
        :to="menuItem.to"
        class="tw-rounded tw-px-2 tw-py-1 tw-mx-1 tw-flex tw-items-center tw-justify-center tw-bg-content-filter-background"
        v-for="(menuItem, menuItemIndex) in menuList"
        :key="menuItemIndex">
        <span><i :class="['fa', menuItem.icon]"></i> {{ menuItem.name }}</span>
      </router-link>
    </div>

    <div class="tw-mt-3 tw-flex tw-w-full tw-justify-end">
      <div class="tw-w-48 search-container tw-m-1">
        <input type="search" class="tw-w-full tw-p-1 tw-h-8" placeholder="Search"/>
      </div>
    </div>

    <div class="tw-mt-3 tw-flex">
      <button
        v-for="(tabItem, tabItemIndex) in tabsList"
        :key="tabItemIndex"
        class="tw-rounded tw-px-2 tw-py-1 tw-mx-1 tw-flex tw-items-center tw-justify-center"
        :class="{
          'tw-bg-content-filter-background': selectedTabIndex !== tabItemIndex,
          'tw-bg-content-filter-current-background': selectedTabIndex === tabItemIndex
        }"
        @click="selectDataCollectionType(tabItemIndex)"
      >
        {{ tabItem.name }}
      </button>
    </div>

    <div v-if="dataCollections.length > 0 && loaded" class="tw-w-full tw-mt-3">
      <data-collection-item
        v-for="(dataCollection, dataCollectionIndex) in dataCollections"
        :key="`${dataCollection['BLSAMPLEID']}_${dataCollection['DCG']}`"
        :data-collection="dataCollection"
        :data-collection-index="dataCollectionIndex"
        :data-collection-message-status="findDataCollectionMessageStatus(dataCollection['ID'])"
        :data-collection-image-data="findDataCollectionImageStatus(dataCollection['ID'])"
        :is-visit="true"
        visit-link="45637"
        :data-collection-model="dcCollections.findWhere({ ID: dataCollection['ID'] })"
        v-on:add-to-project="addToProject"
        v-on:add-to-favorites="addToFavorites"
        v-on:open-data-collection-comments="openDataCollectionComments"
        v-on:view-attachments="viewAttachments"
        v-on:reprocess-data-collection="reprocessDataCollection"
      >
        <template v-slot:fields-slot="slotProps">
          <component :is="dataCollectionFieldTypes[dataCollection['TYPE']]" v-bind="slotProps"></component>
        </template>
        <template v-slot:images-slots="slotProps">
          <data-collection-image-status
            v-if="slotProps.dataCollectionType === 'data' && slotProps.imageData.ID"
            v-bind="slotProps" />
        </template>
        <template v-slot:chart-slot="slotProps">
          <data-collection-distl-view
            v-if="slotProps.dataCollectionType === 'data' && slotProps.chartData.length > 0"
            v-bind="slotProps"
          />
        </template>
      </data-collection-item>
    </div>

    <div v-else class="tw-w-full tw-mt-3">
      <h1> No data collections yet</h1>
    </div>

    <portal to="dialog">
      <custom-dialog-box v-if="displayCustomModal">
        <template v-slot:default>
          <add-to-project
            v-if="currentModal === 'projects'"
            :project-list="projects"
            :item="dataCollectionFilePath"
            :selected-value="selectedProjectItem"
            v-on:update-selected-project="getProjectItemState"
            v-on:close-add-projects-modal="closeAddToProject"
          />
        </template>
        <template v-slot:button-slot>
          <button v-if="selectedProjectItem" class="ui-button ui-corner-all ui-widget tw-mr-px" @click="performAddToProject">{{ Number(selectedProjectItemData['STATE']) === 1 ? 'Remove' : 'Add' }}</button>
          <button class="ui-button ui-corner-all ui-widget tw-ml-px" @click="closeAddToProject">Cancel</button>
        </template>
      </custom-dialog-box>
    </portal>
  </div>
</template>
<script>
// Collections & Models
import AutoProcessingMessagingStatuses from 'modules/dc/collections/apmessagestatuses'
import DCCol from 'collections/datacollections'
import DCImageStatusCollection from 'modules/dc/collections/imagestatuses'
import PieModel from 'modules/stats/models/pie'
import Projects from 'collections/projects'

import DataCollectionStackView from 'app/components/data-collection-stack-view.vue'
import DataCollectionItem from 'modules/dc/components/data-collection-item.vue'
import DataCollectionFieldList from 'modules/dc/components/data-collection-field-list.vue'
import GridScanFieldList from 'modules/dc/components/grid-scan-field-list.vue'
import RobotLoadFieldList from 'modules/dc/components/robot-load-field-list.vue'
import EdgeScanFieldList from 'modules/dc/components/edge-scan-field-list.vue'
import DataCollectionDistlView from 'app/components/data-collection-distl-view.vue'
import DataCollectionImageStatus from 'modules/dc/components/data-collection-image-status.vue'
import CustomDialogBox from 'app/components/custom-dialog-box.vue'
import AddToProject from 'modules/projects/views/add-to-project.vue'
import ProjectItemState from 'modules/projects/models/itemstate'

export default {
  name: 'data-collection-list',
  components: {
    AddToProject,
    'custom-dialog-box': CustomDialogBox,
    'data-collection-image-status': DataCollectionImageStatus,
    'data-collection-item': DataCollectionItem,
    'data-collection-stack-view': DataCollectionStackView,
    'data-collection-field-list': DataCollectionFieldList,
    'grid-scan-field-list': GridScanFieldList,
    'robot-load-field-list': RobotLoadFieldList,
    'edge-scan-field-list': EdgeScanFieldList,
    'data-collection-distl-view': DataCollectionDistlView
  },
  props: {
    id: {
      type: [null, Number]
    },
    bl: {
      type: [null, String]
    },
    dcg: {
      type: [null, Number]
    },
    page: {
      type: [null, Number]
    },
    ty: {
      type: [null, String]
    },
    search: {
      type: [null, String]
    },
    processingJobId: {
      type: [null, Number]
    }
  },
  data() {
    return {
      visit: 'mx23694-73',
      beamline: this.$route.params.bl,
      pieModel: new PieModel({ visit: this.$route.params.visit }),
      autoProcessingMessagesStatusesCollection: new AutoProcessingMessagingStatuses(),
      imageStatusCollection: new DCImageStatusCollection(),
      autoProcessMessageStatuses: [],
      imageStatuses: [],
      pieData: {},
      menuList: [
        {
          name: 'Sample Changer',
          type: 'link',
          to: `dc/sc/visit/${this.visit}`,
          icon: 'fa-exchange'
        },
        {
          name: 'Beamline Status',
          type: 'link',
          to: `status/bl/${this.beamline}`,
          icon: 'fa-wrench'
        }
      ],
      tabsList: [
        { name: 'Data Collections', key: 'dc' },
        { name: 'Grid Scans', key: 'gr' },
        { name: 'Full Collections', key: 'fc' },
        { name: 'Auto Integrated', key: 'ap' },
        { name: 'Processing Errors', key: 'err' },
        { name: 'Screenings', key: 'sc' },
        { name: 'Edge Scans', key: 'edge' },
        { name: 'MCA Spectra', key: 'mca' },
        { name: 'Robot Actions', key: 'rb' },
        { name: 'Sample Actions', key: 'ac' },
        { name: 'Favorites', key: 'flag' }
      ],
      selectedTabIndex: '',
      dataCollections: [],
      page: 1,
      pageSize: 15,
      search: '',
      ty: this.$route.params.ty,
      id: this.$route.params.id,
      dcg: this.$route.params.dcg,
      processingJobId: '',
      dcCollections: new DCCol(null, {}),
      dataCollectionFieldTypes: {
        grid: 'grid-scan-field-list',
        data: 'data-collection-field-list',
        edge: 'edge-scan-field-list',
        load: 'robot-load-field-list',
        mca: 'mca-field-list',
        action: 'robot-action-field-list'
      },
      loaded: false,
      currentTab: '',
      displayCustomModal: false,
      currentModal: '',
      // Add To Project Data
      projectsCollection: new Projects(),
      projects: [],
      dataCollectionFilePath: '',
      selectedProjectItem: '',
      selectedProjectItemData: {},

      selectedDataCollection: null
    }
  },
  created() {
    // this.fetchVStatPie()
    this.fetchDataCollection()
    this.fetchProjects()
  },
  methods: {
    async fetchVStatPie() {
      await this.$store.dispatch('getModel', this.pieModel)
    },
    async fetchProjects() {
      const projects = await this.$store.dispatch('getCollection', this.projectsCollection)
      this.projects = projects.toJSON()
    },
    formatPieModelData(data) {
      const pieData = this.pieModel.get('data')
      if (data && pieData) {
        Object.entries(pieData).forEach(([key, value]) => {
          this.$set(this.pieData, key, parseFloat(value))
        })
      }
    },
    async fetchDataCollection() {
      const queryParams = {
        visit: this.visit,
        search: this.search,
        t: this.ty,
        id: this.id,
        dcg: this.dcg,
        PROCESSINGJOBID: this.processingJobId
      }

      this.dcCollections = new DCCol(null, {
        state: { currentPage: this.page ? parseInt(this.page) : 1, pageSize: this.pageSize},
        queryParams
      })

      await this.$store.dispatch('getCollection', this.dcCollections)
      this.loaded = true
    },
    async fetchAutoProcessingMessagesStatuses(ids) {
      await this.autoProcessingMessagesStatusesCollection.fetch({ data: { ids: ids }, type: 'POST' })
    },
    async fetchImageStatuses(ids) {
      await this.imageStatusCollection.fetch({ data: { ids: ids }, type: 'POST' })
    },
    formatDataCollections(data) {
      const dataCollections = this.dcCollections.toJSON()
      if (data && dataCollections) {
        this.dataCollections = dataCollections

        this.fetchAutoProcessingMessagesStatuses(this.dataCollectionIds)
        this.fetchImageStatuses(this.dataCollectionIds)
      }
    },
    formatAutoProcessingMessageStatus(data) {
      const messageStatuses = this.autoProcessingMessagesStatusesCollection.toJSON()
      if (data && messageStatuses) {
        this.autoProcessMessageStatuses = messageStatuses
      }
    },
    formatImageStatus(data) {
      const imageStatuses = this.imageStatusCollection.toJSON()
      if (data && imageStatuses) {
        this.imageStatuses = imageStatuses
      }
    },
    findDataCollectionMessageStatus(id) {
      const selectedMessageStatus = this.autoProcessMessageStatuses.find(autoProcess => Number(autoProcess['ID']) === Number(id))

      return selectedMessageStatus ? selectedMessageStatus : {}
    },
    findDataCollectionImageStatus(id) {
      const selectedImageStatus = this.imageStatuses.find(image => Number(image['ID']) === Number(id))

      return selectedImageStatus ? selectedImageStatus : {}
    },
    addToProject(dataCollection) {
      this.selectedDataCollection = dataCollection
      this.dataCollectionFilePath = `${this.selectedDataCollection['DIR']}${this.selectedDataCollection['FILETEMPLATE']}`
      this.displayCustomModal = true
      this.$nextTick(() => {
        this.currentModal = 'projects'
      })
    },
    async getProjectItemState() {
      const projectItemModel = new ProjectItemState({ type: this.selectedDataCollection['TYPE'], pid: this.selectedProjectItem, iid: this.selectedDataCollection['DCG'] })
      const projectItem = await this.$store.dispatch('getModel', projectItemModel)
      this.selectedProjectItemData = projectItem.toJSON()
    },
    closeAddToProject() {
      this.currentModal = ''
      this.displayCustomModal = false
      this.selectedDataCollection = null
      this.dataCollectionFilePath = ''
    },
    async performAddToProject() {
      try {
        console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')
        const { TYPE, DCG } = this.selectedDataCollection
        const { STATE } = this.selectedProjectItemData
        const extraUrl = STATE ? '/rem/1' : ''
        console.log({ TYPE, DCG, STATE })
        await this.$store.dispatch('fetchDataFromApi', {
          url: `/projects/addto/pid/${this.selectedProjectItem}/ty/${TYPE}/iid/${DCG}${extraUrl}`,
          requestType: 'Add item to project'
        })
      } finally {
        this.closeAddToProject()
      }
    },
    openCommentsDialog() {
      // TODO: Trigger the opening of the comments modal
      e.preventDefault()
      // app.dialog.show(new DialogView({ title: 'Data Collection Comments', view: new DCCommentsView({ model: this.model }), autoSize: true }))
    },
    addToFavorites() {
      e.preventDefault()
      // TODO: Check what this.model.flag() does in the model file
      this.model.flag()
    },
    viewAttachments() {
      e.preventDefault()

      const d = {}
      if (this.dataCollection['DCC'] > 1) d.dcg = this.dataCollection['DCG']
      else d.id = this.dataCollection['ID']


      // TODO: Show Attachments View

      // app.dialog.show(new DialogView({
      //   title: 'Attachments',
      //   view: new AttachmentsView(d)
      // }))
    },
    reprocessDataCollection() {},
    openDataCollectionComments() {},
    selectDataCollectionType(index) {
      this.ty = this.tabsList[index].key
      this.updateRouteParams({ ty: this.ty })
    },
    updateRouteParams(newParams) {
      const currentParams = this.$router.currentRoute.params

      this.$router.push({ params: { ...currentParams, newParams }})
    },
    setSelectedTab(newValue) {
      this.selectedTabIndex = this.tabsList.findIndex(tab => tab.key === newValue)
    }
  },
  computed: {
    dataCollectionIds() {
      return this.dcCollections.pluck('ID')
    },
  },
  watch: {
    pieModel: {
      deep: true,
      handler: 'formatPieModelData'
    },
    dcCollections: {
      deep: true,
      immediate: true,
      handler: 'formatDataCollections'
    },
    autoProcessingMessagesStatusesCollection: {
      deep: true,
      immediate: true,
      handler: 'formatAutoProcessingMessageStatus'
    },
    imageStatusCollection: {
      deep: true,
      immediate: true,
      handler: 'formatImageStatus'
    },
    '$route.params.ty': {
      deep: true,
      immediate: true,
      handler: 'setSelectedTab'
    }
  },
  beforeDestroy() {
    this.dcCollections.stop()
  }
}
</script>
<style scoped>
.search-container {
  @apply tw-bg-content-search-background tw-rounded tw-p-1;
  box-shadow: 0 1px 1px rgb(100 100 100 / 40%) inset, 0 1px 0 rgb(255 255 255 / 20%);
}
input[type="search"] {
  -webkit-appearance: textfield;
  outline-offset: -2px;
  font-family: 'FontAwesome';
}
</style>