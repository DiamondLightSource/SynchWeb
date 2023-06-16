<template>
    <div class="custom-sidebar">
        <div class="tw-border-b tw-text-xl title-format "
        @click="disableClickableSidebar ? null : toggleSidebar()">
            
            <slot name="filter-bar-title" />
        </div>
        <div
            class="content-format
            tw-ease-in-out tw-transition-all tw-delay-150 tw-duration-300"
            :class="{
                'transform-filter-height ': isOpen,
                'transform-filter-height-clicked ': !isOpen,
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
        /* height: 250px; */
        max-height: 500px;
        overflow-y: scroll;
        transition: max-height 0.45s ease-in;
    }

    .transform-filter-height-clicked {
        /* height: 250px; */
        max-height: 0;
        overflow-y: scroll;
        transition: max-height 0.25s ease-out;
    }

    .title-format {
        @apply tw-bg-content-sub-header-hover-background
    }

    .content-format {
        @apply tw-bg-header-bc-color 
    }


</style>


