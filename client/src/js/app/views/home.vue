<template>
    <section id="home">
        <div class="tw-mx-auto">
            <hero-title />

            <div class="tw-flex tw-flex-col md:tw-flex-row tw-justify-between">

                <div class="tw-flex-col tw-w-full md:tw-w-1/3 tw-mb-4 md:tw-m-4 tw-p-4 tw-border tw-border-gray-500 tw-bg-gray-300 tw-text-center tw-rounded tw-shadow">
                    <p><i class="fa fa-4x fa-truck"/></p>
                    <p class="tw-text-2xl tw-py-2">Prepare for Beamtime</p>
                    <div class="tw-text-left tw-text-sm">
                        <p class="tw-py-2">With SynchWeb you can create Shipments and use integrated DHL shipping services to get your samples to site.</p>
                        <p class="tw-py-2">Your parcels or dewars are tracked across the facility so you can see where your samples are.</p>
                        <p class="tw-py-2">While registering samples, you can specify data collection recipes for automated collection and processing.</p>
                    </div>
                </div>

                <div class="tw-flex-col tw-w-full md:tw-w-1/3 tw-mb-4 md:tw-m-4 tw-p-4 tw-border tw-border-gray-500 tw-bg-gray-300 tw-text-center tw-rounded tw-shadow">
                    <p><i class="fa fa-4x fa-clock-o"/></p>
                    <p class="tw-text-2xl tw-p-2">Monitor Experiment</p>
                    <div class="tw-text-left tw-text-sm">
                        <p class="tw-py-2">SynchWeb provides a live activity stream of events on beamlines.</p>
                        <p class="tw-py-2">You can observe the data collection process through webcam feeds of your session.</p>
                        <p class="tw-py-2">Results from automated and downstream processing pipelines are displayed for initial assessment.</p>
                    </div>
                </div>

                <div class="tw-flex-col tw-w-full md:tw-w-1/3 tw-mb-4 md:tw-m-4 tw-p-4 tw-border tw-border-gray-500 tw-bg-gray-300 tw-text-center tw-rounded tw-shadow">
                    <p><i class="fa fa-4x fa-pie-chart"/></p>
                    <p class="tw-text-2xl tw-p-2 ">Process and analyze data</p>
                    <div class="tw-text-left tw-text-sm">
                        <p class="tw-py-2">SynchWeb includes analysis and visualisation views from DIALS, autoPROC, results from Jupyter notebooks etc.</p>
                        <p class="tw-py-2">Review electron density maps from Dimple and FastDP.</p>
                        <p class="tw-py-2">Reprocess data from single or multiple data collections.</p>
                    </div>
                </div>

            </div>

            <div class="tw-flex tw-flex-col w-w-full tw-m-2 tw-p-4">
                <p class="tw-text-center tw-text-lg tw-mb-4"><router-link to='/login' class="tw-underline">Login</router-link> to view your proposals and sessions</p>
                <p v-if="dataCatalogue" class="tw-text-center tw-text-lg">If you are looking for archived data please visit the data catalogue <a :href="dataCatalogue.url" class="tw-underline">{{dataCatalogue.name}}</a></p>
            </div>
        </div>
    </section>
</template>

<script>
import Hero from 'app/components/herotitle.vue'
import EventBus from 'app/components/utils/event-bus.js'
import Config from 'config.json'

export default {
    name: 'Home',
    components: {
        'hero-title': Hero,
    },
    data() {
        return {
            facility: 'Diamond',
            current_date: new Date(),
        }
    },
    computed: {
        isLoggedIn: function() {
            return this.$store.getters['auth/isLoggedIn']
        },
        dataCatalogue: function() {
            return Config.data_catalogue
        }
    },
    created: function() {
        let self = this
        // Reset proposal and associated type/model
        // We call the action so the store can handle the proposal type and model
        this.$store.dispatch('proposal/setProposal', null)
        EventBus.$emit('bcChange', [{title: '/', url: '/'}])

        if (this.$store.getters['auth/isLoggedIn']) {
            this.$router.push('current')
        }
    },
}
</script>