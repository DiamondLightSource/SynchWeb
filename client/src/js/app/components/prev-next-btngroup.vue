<template>
  <div class="btn-group">
    <flat-button
      @click="pushToPrev()"
      v-bind:level="prevTarget?.relativeLink ? 'primary' : 'disabled'"
      v-bind:hint="prevTarget?.tooltip ?? prevTarget?.relativeLink"
    >
      {{ prevBtnLabel }}
    </flat-button>
    <slot></slot>

    <flat-button
      @click="pushToNext()"
      v-bind:level="nextTarget?.relativeLink ? 'primary' : 'disabled'"
      v-bind:hint="nextTarget?.tooltip ?? nextTarget?.relativeLink"
    >
      {{ nextBtnLabel }}
    </flat-button>
  </div>
</template>
  
<script>
import FlatButton from "./flat-button.vue";
import router from "../router/router";

/**
 * A simple component that supplies functionality for prev & next router-links.
 * Button labels default to "Prev" & "Next" but alternatives can be supplied
 */
export default {
  name: "PrevNextBtnGroup",
  components: {
    "flat-button": FlatButton,
  },
  methods: {
    pushToNext() {
      if (this.nextTarget?.relativeLink)
        router.push({ path: this.nextTarget.relativeLink });
    },
    pushToPrev() {
      if (this.prevTarget?.relativeLink)
        router.push({ path: this.prevTarget.relativeLink });
    },
  },
  props: {
    nextBtnLabel: {
      type: String,
      default: "Next",
    },
    prevBtnLabel: {
      type: String,
      default: "Prev",
    },

    nextTarget: {
      relativeLink: {
        type: String,
        default: null,
      },
      tooltip: {
        type: String,
        default: null,
      },
    },
    prevTarget: {
      relativeLink: {
        type: String,
        default: null,
      },
      tooltip: {
        type: String,
        default: null,
      },
    },
  },
};
</script>
  
  <style scoped>
.btn-group {
  @apply tw-px-4;
  @apply tw-py-2;
  @apply tw-flex;
  @apply tw-flex-row;
  @apply tw-gap-2;
  @apply tw-text-center;
  @apply tw-border;
  @apply tw-rounded;
}
</style>