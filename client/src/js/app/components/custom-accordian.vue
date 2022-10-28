<template>
    <div class="tw-border-l-2 tw-flex">
      <slot name="title" />
      <button
        @click="toggleAccordion()"
        class="tw-items-center tw-ml-2"
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

      <div
          class="tw-relative
          tw-ease-in-out tw-transition-all tw-delay-150 tw-duration-300"
          :class="{
            'tw-w-full': isOpen,
            'tw-w-0': !isOpen,
          }"
          >
        <div v-show="loadContent">
          <slot name="content" />
        </div>

      </div>

<!--   
      <div v-show="isOpen" :id="`collapse${_uid}`">
        <slot name="content" />
      </div> -->
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

