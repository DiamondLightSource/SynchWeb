<template>
    <div class="custom-sidebar tw-relative">
        <div>
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

            <div>

            <aside
            class="tw-transform tw-top-0 tw-right-0 tw-w-64 tw-bg-header-background tw-fixed tw-h-full tw-overflow-auto tw-ease-in-out tw-transition-all tw-duration-300 tw-z-30"
            :class="isOpen ? 'tw-translate-x-0' : 'tw-translate-x-full'">
            
            <div class="tw-bg-table-header-background tw-h-12 tw-w-64">
                <div class="tw-absolute tw-mt-3 tw-ml-3 tw-text-xl tw-font-semibold tw-text-white">
                    <slot name="sidebar-title" />
                </div>
            </div>

            <div class="tw-mt-2 tw-ml-3 tw-text-white ">
                <slot name="sidebar-content" />
            </div>
            
            
            </aside>

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
        };
    },
    methods: {
        toggleSidebar() {
        this.isOpen = !this.isOpen;
        },
        },

    watch: {
        isOpen: {
        immediate: true,
        handler(isOpen) {
            if (process.client) {
            if (isOpen) document.body.style.setProperty("overflow", "hidden");
            else document.body.style.removeProperty("overflow");
            }
        }
        }
    }
    };

    
</script>

<style scoped>
    
</style>

