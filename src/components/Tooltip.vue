<template>
  <button
    v-tooltip="{
      placement: 'auto',
      content: content,
      autoHide: false,
      targetClasses: `tooltip-wrapper ${positions[position]} ${$attrs.parentclasses}`,
      classes: 'tooltip-content',
    }"
  >
    <img
      :src="require('@/assets/tooltip-icon.svg')"
      style="width: 20px; height: 20px;"
    />
  </button>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import VTooltip from "v-tooltip";

Vue.use(VTooltip);

@Component
export default class Tootip extends Vue {
  @Prop() content?: string;
  @Prop({ default: "default" }) position?: string;
  positions: object = {
    default: "",
    corner: "tooltip-corner",
  };
}
</script>

<style lang="postcss" scoped>
.tooltip-wrapper {
  padding: 5px;
}
.tooltip-wrapper img {
  width: 20px;
  height: 20px;
}
.tooltip-corner {
  position: absolute;
  top: 0;
  right: 0;
  margin: 0;
}
@media (hover: none), (max-width: 768px) {
  .tooltip-wrapper {
    display: none;
  }
}
</style>
