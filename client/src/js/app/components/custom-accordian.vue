<template>
    <div class="tw-border-l tw-pl-1">
      <slot name="title" />
      <button
        @click="toggleAccordion()"
        class="tw-items-center tw-ml-2"
        :aria-expanded="isOpen"
        :aria-controls="`collapse${_uid}`"
      >
        <svg
          class="tw-w-3 tw-h-4 tw-transition-all tw-duration-200 tw-transform"
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
            d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
 

      <div
          class="tw-relative
          tw-ease-in-out tw-transition-all tw-delay-150 tw-duration-300"
          :class="{
            'tw-h-10': isOpen,
            'tw-h-0': !isOpen,
          }"
          >
        <div v-show="loadContent">
          <slot name="content" />
        </div>

      </div>


    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        isOpen: false,
        loadContent : false
      };
    },
  
    methods: {
      toggleAccordion() {
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
  };
  </script>

  

