<template>
  <div class="content header-row">
    <h1 class="nou">
      <slot>Title</slot>
    </h1>
  </div>
</template>

<script>
import PrevNextBtngroup from "./prev-next-btngroup.vue";

export default {
  name: "PageTitleHeader",
  components: {
    "prev-next-btngroup": PrevNextBtngroup,
  },
  props: {
    titleText: {
      type: String,
      default: "Title",
    },
  },
};
</script>

<style scoped>
    h1 {
        padding: 0;
    }

    .header-row {
        @apply tw-px-4;
        @apply tw-pl-0;
        @apply tw-py-2;
        @apply tw-flex;
        @apply tw-flex-row;
        @apply tw-gap-2;
        @apply tw-items-center;
        border-bottom: 1px solid grey;
    }
</style>