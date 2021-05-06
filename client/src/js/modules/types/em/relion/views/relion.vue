<template>
    
<section class="content">
    <h1>Relion Processing</h1>

    <p class="help">This page is for reviewing processing jobs from Relion.</p>
    <p class="help">Click on the 'i' icon to see processing parameters for a processing job.</p>
    <p class="help">Click on the 'x' icon to request cancellation of a running processing job.</p>

    <p v-if="isSessionArchived && showArchivedMessage" class="message alert">
        This session has been archived. It may no longer be submitted for processing. <a
            class="button refresh" v-on:click.prevent="showArchivedMessage = false">OK</a>
    </p>

    <!--
        Propose adding a link here to add new processing jobs
        Then move all the form content into a new add-relion-processing page
    -->
    <div class="tw-flex tw-justify-end">
        <router-link :to="'/em/process/relion/session/'+session_str+'/jobs/add'" class="button submit"><i class="fa fa-plus"></i> Add Processing</router-link>
    </div> 

    <table-component
        :headers="processingJobHeaders"
        :data="processingJobs"
        actions="Actions"
    >
        <template slot="actions" slot-scope="{ row }">
            <!-- Action to stop processing. TODO - add confirmation dialog or panel below? -->
            <a v-if="row.PROCESSINGSTATUSDESCRIPTION=='running'" class="button" href="" @click.prevent="onStopProcessing(row['PROCESSINGJOBID'])"><i class="fa fa-times"></i></a>
            <a class="button" href="" @click.prevent="onShowProcessingJob(row['PROCESSINGJOBID'])"><i class="fa fa-info"></i></a>
        </template>
    </table-component>
    <pagination-component
        @page-changed="onUpdateProcessingJobs"
        :totalRecords="totalProcessingJobs"
        :initialPage="1"
        :pageLinks="3"
        :pageSizes="[15,25,50]"
    />

    <job-parameters :id="processingJobId"/>
            
</section>

</template>

<script>
import Backbone from 'backbone'
import formatDate from 'formatDate'
import ProcessingJobs from 'modules/types/em/collections/processingjobs'
import RelionModel from 'modules/types/em/relion/models/relion'
import SessionModel from 'models/visit'
import Table from 'app/components/table.vue'
import Pagination from 'app/components/pagination.vue'
import EventBus from 'app/components/utils/event-bus.js'
import JobParameters from 'modules/types/em/relion/components/job-parameters.vue'

export default {
    name: 'relion-processing-form',
    props: {
        session_str: String,
    },
    components: {
        'table-component': Table,
        'pagination-component': Pagination,
        'job-parameters': JobParameters,
    },
    data: function () {
        return {
            showSpinner: false,

            // GUI
            isSessionActive: false,
            isSessionArchived: false,

            // Session
            session: {},
            sessionEndDateAsString: '',

            processingJobs: [],
            processingJobHeaders: [ 
                {title: 'Processing Job ID', key: 'PROCESSINGJOBID'},
                {title: 'DataCollection ID', key: 'DATACOLLECTIONID'},
                {title: 'Time stamp', key: 'RECORDTIMESTAMP'},
                {title: 'Job Status', key: 'PROCESSINGSTATUSDESCRIPTION'},
                {title: 'Start Time', key: 'PROCESSINGSTARTTIME'},
                {title: 'End Time', key: 'PROCESSINGENDTIME'},
            ],
            totalProcessingJobs: 0,

            processingJobId: null,

            initialProcessingJobPageSize: 15,
            showArchivedMessage: true,
        }
    },
    created: function () {
        this.showSpinner = true;

        let sessionModel = new SessionModel({
            VISIT: this.session_str
        });

        this.$store.dispatch('getModel', sessionModel).then( (model) => {
            this.session = sessionModel.attributes;

            this.isSessionActive = !!+this.session['ACTIVE']; // ACTIVE represented by string value "0" or "1" in JSON
            this.isSessionArchived = !!+this.session['ARCHIVED'];

            let breadcrumbs = [
                {title: 'Data Collections', url: '/dc'},
                {title: this.session['BL']},
                {title: this.session['VISIT'], url: '/dc/visit/' + this.session['VISIT']},
                {title: 'Relion Processing'}
            ]
            this.setBreadcrumbs(breadcrumbs)
            // Probably don't need to wait until sessionModel is returned? 
            // If not can run this in parallel (outside this 'then' clause)
            let page = 1
            let numRecords = this.initialProcessingJobPageSize
            this.getProcessingJobs(page, numRecords)
        }, (error) => {
            this.setBreadcrumbs([{title: 'Error'}]);
            this.$store.commit('notifications/addNotification', {title: 'No such session', message: 'The specified session does not exist'})
        }).finally( () => {
            this.showSpinner = false
        })
    },
    methods: {
        getProcessingJobs: function(page, numRecords) {
            let processingJobsCollection = new ProcessingJobs(null, { state: { currentPage: page, pageSize: numRecords, session: this.session['VISIT'] } })

            this.$store.dispatch('getCollection', processingJobsCollection).then( (collection) => {
                this.totalProcessingJobs = collection.state.totalRecords
                this.processingJobs = processingJobsCollection.toJSON()
            }, () => {
                this.$store.commit('notifications/addNotification', {title: 'Error', message: 'Could not retrieve processing jobs', level: 'error'})
            })
        },
        setBreadcrumbs: function(breadcrumbs) {
            if (breadcrumbs) EventBus.$emit('bcChange', breadcrumbs)
        },
        // With new build and (IE polyfill) we could use
        // Object.assign() to reset all data to initial state
        // Using the method below is simple alternative that
        // allows us to clear form data after submission
        onStopProcessing: function(id) {
            // Send stop processing message if needed
            this.$store.commit('notifications/addNotification', {title: 'Debug', message: 'Requesting stop processing JOBID - processing jobs will refresh in 5 seconds ' + id})
            this.onStop(id)
            // Could refresh processing jobs to catch status of cancelled job...
            let self = this
            setTimeout( function() { console.log("refreshing processing jobs"); self.getProcessingJobs(1, self.initialProcessingJobPageSize)}, 5000)
        },
        onShowProcessingJob: function(id) {
            this.processingJobId = id
        },
        onUpdateProcessingJobs: function(payload) {
            // Now call Processing jobs with the correct page size and start location
            let page = payload.currentPage
            let numRecords = payload.pageSize
            this.getProcessingJobs(page, numRecords)
        },
    }
}
</script>
