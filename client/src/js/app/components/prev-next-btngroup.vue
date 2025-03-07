<template>
  <div class="btn-group">
    <flat-button
      @click="pushToPrev()"
      v-bind:level="prevTarget?.value ? 'primary' : 'disabled'"
      v-bind:hint="prevTarget?.text ?? prevTarget?.value"
    >
      {{ prevBtnLabel }}
    </flat-button>
    {{ currentIdx +1 }} of {{ siblingTargets.length }}

    <flat-button
      @click="pushToNext()"
      v-bind:level="nextTarget?.value ? 'primary' : 'disabled'"
      v-bind:hint="nextTarget?.text ?? nextTarget?.value"
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
 * Button labels default to "Prev" & "Next" but alternatives can be supplied.
 * Keeping state minimal for future re-use as the page is fully reloaded every time.
 */
export default {
  name: "PrevNextBtnGroup",
  components: {
    "flat-button": FlatButton,
  },
  computed: {
    nextTarget() {
      return this.allTargets[this.currentIdx+1];
    },
    prevTarget(){
      return this.allTargets[this.currentIdx-1];
    }
  },
  methods: {
    pushToNext() {
      console.log("Next Target:", this.nextTarget)
      if (this.nextTarget?.value)
        router.push({ path: this.pathprefix + this.nextTarget.value });
    },
    pushToPrev() {
      console.log("Prev Target:", this.prevTarget)
      if (this.prevTarget?.value)
        router.push({ path: this.pathprefix + this.prevTarget.value });
    },
  },
  props: {
    pathprefix: {
      type: String,
      default: "",
    },
    nextBtnLabel: {
      type: String,
      default: "Next",
    },
    prevBtnLabel: {
      type: String,
      default: "Prev",
    },

    allTargets: {
      type: Array, // { value: string text: string }
      default: [],
    },

    currentIdx: {
      type: Number,
      default: 0,
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
  @apply tw-items-center;
  @apply tw-border;
  @apply tw-rounded;
}
</style>