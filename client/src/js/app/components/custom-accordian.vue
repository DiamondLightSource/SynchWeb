<template>
    <div class="tw-border-b">

      <button
        @click="toggleAccordion()"
        class="tw-flex tw-items-center tw-space-x-3"
        :aria-expanded="isOpen"
        :aria-controls="`collapse${_uid}`"
      >
        <slot name="title" />
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

  
      <div v-show="isOpen" :id="`collapse${_uid}`">
        <slot name="content" />
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        isOpen: false,
      };
    },
  
    methods: {
      toggleAccordion() {
        this.isOpen = !this.isOpen;
      },
    },
  };
  </script>