<template>
    <div class="custom-sidebar">
        <div>
            <div class="tw-flex">
                <div class="tw-flex tw-rounded-full tw-h-6 tw-ml-1 tw-mb-2 tw-pt-1 
                                    tw-pr-1 tw-pl-1 tw-bg-content-active">
                <p> Advanced Filter </p>
                <button
                    @click="toggleSidebar()"
                    class="tw-flex tw-bg-transparent"
                    :aria-expanded="isOpen"
                    :aria-controls="`collapse${_uid}`"
                >
                <svg
                class="tw-w-3 tw-transition-all tw-duration-200 tw-transform"
                :class="{
                'tw-rotate-180': isOpen,
                'tw-rotate-0': !isOpen,
                }"
                fill="none"
                stroke="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 10"
                aria-hidden="true"
                >
                <path
                d="M15 1.2l-7 7-7-7"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                />
                </svg>
                </button>
                </div>
            </div>

            <div>
            <div
            class="  tw-relative tw-bg-header-background
            tw-ease-in-out tw-transition-all tw-delay-150 tw-duration-300"
            :class="{
                'filter-height': isOpen,
                'tw-h-0': !isOpen,
                }"
            >
                <div v-if="loadContent" class="
                tw-w-full tw-bg-table-header-background tw-h-12"
                :class="loadContent ? 'tw-h-10' : 'tw-h-0'">

                    <div class="tw-relative tw-ml-3 tw-text-xl tw-text-white">
                        <slot name="filter-bar-title" />
                    </div>
                </div>

                <div v-if="loadContent" class="tw-mt-2 tw-ml-3 tw-text-white ">
                    <slot name="filter-bar-content" />
                </div>
            
            
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
        // isOpen: {
        // immediate: true,
        // handler(isOpen) {
        //     if (process.client) {
        //     if (isOpen) document.body.style.setProperty("overflow", "hidden");
        //     else document.body.style.removeProperty("overflow");
        //     }
        // }
        }
    };

    
</script>

<style scoped>

    .filter-height {
    height: 400px;
    }

</style>


