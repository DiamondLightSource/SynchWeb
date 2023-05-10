<template>
    <div class="custom-sidebar">
        <div class="tw-relative tw-border-b tw-text-xl tw-bg-content-sub-header-hover-background"
            @click="toggleSidebar()">
                        <slot name="filter-bar-title" />
        </div>
        <div
            class="tw-relative tw-bg-header-bc-color
            tw-ease-in-out tw-transition-all tw-delay-150 tw-duration-300"
            :class="{
                'transform-filter-height ': isOpen,
                'tw-h-0': !isOpen,
                }"
                >

            <div>
                <div v-if="loadContent" class="
                tw-w-full  tw-h-12"
                :class="loadContent ? 'tw-h-10' : 'tw-h-0'">

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
    data() {
        return {
        isOpen: false,
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
                setTimeout(() => this.loadContent = true, 200);
            } else {
                setTimeout(() => this.loadContent = false, 300);
            }
        }
        },

    watch: {

        }
    };

    
</script>

<style scoped>

    .transform-filter-height {
        height: 400px;
        max-height: 600px;
    }

    .filter-height {
    height: 100%;
    max-height: 600px;
    }

</style>


