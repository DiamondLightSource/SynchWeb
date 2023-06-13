<template>
    <div class="custom-sidebar">
        <div class="tw-border-b tw-text-xl tw-bg-content-sub-header-hover-background"
        @click="disableClickableSidebar ? null : toggleSidebar()">
            
            <slot name="filter-bar-title" />
        </div>
        <div
            class="tw-bg-header-bc-color
            tw-ease-in-out tw-transition-all tw-delay-150 tw-duration-300"
            :class="{
                'transform-filter-height ': isOpen,
                'tw-h-0': !isOpen,
                }"
                >

            <div>
                <div v-if="loadContent"
                :class="loadContent ? 'tw-h-3' : 'tw-h-0'">

                </div>

                <div v-if="loadContent" class="tw-mt-2 tw-ml-3 tw-text-black ">
                    <slot name="filter-bar-content" />
                </div>
            
            
            </div>

        </div>

    </div>
</template>

<script>
    export default {

    name: 'expandable-sidebar',
    props: {
    // The list of data that will be displayed in the combobox
    isOpen: {
      type: Boolean,
      default: false
    },
    loadContent: {
      type: Boolean,
      default: false
    },
    disableClickableSidebar: {
        type: Boolean,
        default: true
    }
    },
    data() {
        return {
        loadContent : false
        };
    },
    methods: {
        toggleSidebar() {
        this.isOpen = !this.isOpen;

        this.contentDelay()
        },
        contentDelay() {
 
            if (!this.loadContent) { 
                setTimeout(() => this.loadContent = true, 50);
            } else {
                setTimeout(() => this.loadContent = false, 150);
            }
        }
        },

    watch: {
        isOpen () {
            this.contentDelay()
        }
        }
    };

    
</script>

<style scoped>

    .transform-filter-height {
        height: 250px;
        max-height: 600px;
        overflow-y: scroll;
    }

    .filter-height {
    height: 100%;
    max-height: 600px;
    }

    .expandable-button {
        font-size:small;
        @apply tw-text-center tw-bg-content-active tw-border-content-active tw-text-black tw-py-1 tw-px-1 tw-rounded
    }

    .expandable-button:hover {
        @apply tw-bg-teal-700 tw-border-teal-700 
    }

</style>


