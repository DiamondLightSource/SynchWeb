<template>
    <div>
        <div class="tabs">
            <ul class="tw-flex tw-border-b tw-border-blue-800">
                <li v-for="(tab, index) in tabs" :key="index"
                    :class="[tab.isActive ? 'tw--mb-px' : '', 'tw-mr-1']">
                    <a 
                        :href="tab.href" 
                        @click="selectTab(tab)"
                        :class="[tab.isActive ? 'tab-active' : 'tab-inactive', 'tab-common']"
                        >{{ tab.name }}</a>
                </li>
            </ul>
        </div>
        <div class="tab-content">
            <slot></slot>
        </div>
    </div>

</template>

<script>
export default {

    name: 'Tabs',

    data() {
        return { tabs: [] };
    },

    created() {
        this.tabs = this.$children;
    },

    methods: {
        selectTab(selectedTab) {
            this.tabs.forEach(tab => {
                tab.isActive = (tab.href == selectedTab.href);
            });
        }
    }    
}
</script>

<style scoped>
.tab-common {
    @apply tw-appearance-none tw-bg-white tw-inline-block tw-py-2 tw-px-4 tw-font-semibold;
}
.tab-active {
    @apply tw--mb-px tw-border-l tw-border-t tw-border-r tw-border-b-0 tw-border-blue-800 tw-rounded-t tw-text-blue-700;
}
.tab-inactive {
    @apply tw-text-blue-500 tw-bg-gray-300;
}
.tab-inactive:hover {
    @apply tw-text-blue-800;
}
.tab-content {
    @apply tw-border-blue-800 tw-border-l tw-border-r tw-border-b tw-p-2;
}
</style>