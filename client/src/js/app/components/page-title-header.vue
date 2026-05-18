<template>
  <div class="content header-row">
    <h1 class="nou">
      <slot>Title</slot>
    </h1>

    <prev-next-btngroup
      v-show="this.prevNextTargets"
      next-btn-label="Next Container"
      prev-btn-label="Prev Container"
      :path-prefix="this.prevNextPathPrefix"
      :allTargets="this.prevNextTargets"
      :currentValue="this.currentValue"
    >
    </prev-next-btngroup>
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
    prevNextPathPrefix: {
        type: String,
        default: null
    },
    prevNextTargets: {
        type: Array,
        default: []
    },
    currentValue: {
        type: String,
        default: null
    },
    prevNextBtnProps: {
        type: Object,
        default: () => ({
            nextBtnLabel: "Next",
            prevBtnLabel: "Prev",
        })
    },

  },
};
</script>
