<template>
    <div class="tw-relative tw-max-w-sm tw-mx-auto tw-text-xs">
        <div ref="myElement" class="tw-bg-white tw-rounded-md tw-p-2 tw-flex gap-1 tw-flex-wrap" 
        @click="$refs.search_input.focus()">
            <div v-for="(name, id) in selected" :key="id">
                <div class="tw-bg-blue-200 tw-rounded-md tw-flex items-center">
                    <div class="tw-p-2"> {{ name }}</div>
                    <div @click="remove(id)"
                        class="tw-p-2 tw-select-none tw-rounded-r-md tw-cursor-pointer hover:tw-bg-magma-orange-clear">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.5745 1L1 12.5745" stroke="#FEAD69" stroke-width="2" stroke-linecap="round"/>
                            <path d="M1.00024 1L12.5747 12.5745" stroke="#FEAD69" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </div>
                </div>
            </div>
            <div class="tw-flex-1">
                <input type="text" v-model="search" ref="search_input"
                @click="openDialog" placeholder="Search"
                    class="tw-w-full tw-border-0 focus:tw-border-0 focus:tw-outline-none focus:tw-ring-0 tw-py-1 tw-px-0">
                
                    <dialog-modal
                        class="tw-w-full"
                        v-if="showDialog"
                        :show-dialog="showDialog"
                        :title="title"
                        @cancel="showDialog = false"
                        >
                        <slot name="dialog-content"></slot>
                    </dialog-modal>
                
                    <!-- <div v-show="showSelector" class="tw-absolute tw-left-0 tw-bg-white tw-z-30 tw-w-full tw-rounded-b-md tw-font-medium">
                    <div class="tw-p-2 tw-space-y-1">
                        <div v-for="(name, id) in options" :key="id">
                            <div>
                                <template v-if="!selected[id]">
                                    <div @click="select(id, name)"
                                        class="tw-bg-blue-200 tw-border-2 tw-border-blue-200 tw-cursor-pointer tw-rounded-md tw-p-2 hover:tw-border-light-blue-1"
                                        >{{ name }}</div>
                                </template>
                            </div>
                        </div>
                        <div v-if="options.length === 0">
                            <div class="tw-text-gray-500">
                                No result
                            </div>
                        </div>
                    </div>
                </div> -->
            </div>
        </div>

    </div>

</template>

<script>
import DialogModal from 'app/components/dialog-modal.vue'

export default {
    name: 'multi-input-dia',
    props: {
        multInputSelected: {},
    },
    components: {
        'dialog-modal': DialogModal,
    },
    data() {
        return {
        search: '',
        showSelector: false,
        inputContent: '',
        selected: {...this.multInputSelected},
        debounceTimeout: null,
        showDialog: false,
        }
    },
    mounted() {
        document.addEventListener('click', this.handleClickOutside);
    },
    beforeDestroy() {
        document.removeEventListener('click', this.handleClickOutside);
    },
    methods: {
        updateInput(event) {
            clearTimeout(this.debounceTimeout);

            this.debounceTimeout = setTimeout(() => {
                this.inputContent = event.target.value;
                this.goSearch();
            }, 300);  // 300ms debounce time
        },
        handleClickOutside(event) {
            if (this.$refs.myElement && !this.$refs.myElement.contains(event.target)) {
            // Clicked outside the element
            console.log('Clicked outside!');
            this.showSelector = false;
            }
        },
        clearOpts() {
                this.search = '';
                this.showSelector = false;
                this.options = []
            },
        remove(id) {
            console.log('trying to delete', this.selected[id]);
            this.$delete(this.selected, id); // Vue's method to ensure reactivity
            this.$emit('selected-changed', this.selected);
        },
        goSearch() {
            if (this.search) {
                this.showSelector = true;
            } else {
                this.showSelector = false;
            }
            console.log(this.options)
        },
        openDialog() {
            this.showDialog = true;
        }
    }
}
</script>

<style scoped>

</style>

    
