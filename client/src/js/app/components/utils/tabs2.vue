<template>
    <div>
        <div class="tabs">
            <ul class="tw-flex">
                <li v-for="(tab, index) in tabs" :key="index"
                    :class="[tab.isActive ? 'tab-highlight' : '', 'tw-mr-1']">
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

        <div class="tab-navigation">
            <button class="tw-rounded-l" :class="{'tw-cursor-not-allowed tw-opacity-50' : firstTab}" @click="onPrev">Prev</button>
            <button class="tw-rounded-r" :class="{'tw-cursor-not-allowed tw-opacity-50' : lastTab}"  @click="onNext">Next</button>
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

    computed: {
        firstTab: function() {
            let index = this.tabs.findIndex(tab => {
                return tab.isActive
            })
            return index === 0
        },
        lastTab: function() {
            let index = this.tabs.findIndex(tab => {
                return tab.isActive
            })
            return index === this.tabs.length -1
        },
    },
    methods: {
        selectTab(selectedTab) {
            console.log("Selected Tab: " + selectedTab)
            this.tabs.forEach(tab => {
                tab.isActive = (tab.href == selectedTab.href);
            });
        },
        onPrev: function() {
            // Find current index
            let index = this.tabs.findIndex(tab => {
                return tab.isActive
            })
            console.log("onPrev current tab = " + index)
            if (index < 1) {
                // Prev should not be shown...?
            } else {
                this.selectTab(this.tabs[index-1])
            }
        },
        onNext: function() {
            let index = this.tabs.findIndex(tab => {
                return tab.isActive
            })
            console.log("onNext current tab = " + index)
            if (index < (this.tabs.length - 1)) {
                // Next should not be shown...?
                this.selectTab(this.tabs[index+1])
            }
        }
    }    
}
</script>

<style scoped>
.tab-common {
    @apply tw-appearance-none tw-bg-white tw-inline-block tw-py-2 tw-px-4 tw-font-semibold;
}
.tab-active {
    @apply tw--mb-px tw-rounded-t tw-text-gray-700;
}
.tab-inactive {
    @apply tw-text-gray-500 tw-bg-gray-200;
}
.tab-inactive:hover {
    @apply tw-text-gray-800;
}
.tab-highlight {
    @apply tw-border-b-4 tw-border-gray-800;
}
.tab-content {
    @apply tw-p-2;
}
.tab-navigation {
    @apply tw-flex tw-justify-end;
}
.tab-navigation button {
    @apply tw-bg-gray-300 tw-text-gray-800 tw-font-bold tw-py-1 tw-px-4 tw-border tw-border-gray-500;
}
.tab-navigation button:hover {
    @apply tw-bg-gray-400;
}
</style>