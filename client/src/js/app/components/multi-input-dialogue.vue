<template>
    <div class="tw-relative tw-w-auto tw-text-xs">
        <div ref="myElement" class="tw-bg-white tw-rounded-md tw-p-2 tw-flex gap-1 tw-flex-wrap" 
        @click="$refs.search_input.focus()">
            <div v-for="(name, id) in selected" :key="id">
                <div v-if="name" class="tw-bg-gray-300 tw-h-8 tw-m-1 tw-rounded-md tw-flex tw-items-center">
                    <div class="tw-p-2"> {{ name }}</div>
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
                        <slot></slot>
                    </dialog-modal>
            </div>
        </div>

    </div>

</template>

<script>
import DialogModal from 'app/components/dialog-modal.vue'

export default {
    name: 'multi-input-dia',
    props: {
        multInputSelected: Object,
        index: Number
    },
    components: {
        'dialog-modal': DialogModal,
    },
    data() {
        return {
        search: '',
        showSelector: false,
        inputContent: '',
        selected: this.multInputSelected,
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
        openDialog() {
            this.showDialog = true;
        }
    },
    watch: {
        multInputSelected: {
            handler(newValue) {
                this.selected = newValue;
            },
            deep: true
        }
    }
    
}
</script>

<style scoped>
    .pill-input {
        white-space: nowrap;
        @apply tw-rounded-full tw-h-6 tw-max-w-xs tw-ml-1 tw-px-2 tw-py-1 tw-bg-content-active tw-text-sm
    }

</style>

    
