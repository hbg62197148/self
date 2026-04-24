<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { gsap } from "gsap";

const props = defineProps({
  activeMeta: {
    type: Object,
    required: true
  }
});

const beaconRef = ref(null);
const indexRef = ref(null);
const labelRef = ref(null);
const pulseRef = ref(null);

let beaconTimeline = null;

// 当前章节变化时，让右下角章节提示做一次短促的翻入和光晕反馈。
const playBeaconMotion = async () => {
  await nextTick();

  beaconTimeline?.kill();
  beaconTimeline = gsap.timeline({
    defaults: {
      ease: "power3.out",
      overwrite: "auto"
    }
  });

  beaconTimeline
    .fromTo(
      beaconRef.value,
      { y: 8, scale: 0.98 },
      { y: 0, scale: 1, duration: 0.34 },
      0
    )
    .fromTo(
      [indexRef.value, labelRef.value],
      {
        autoAlpha: 0,
        y: 10,
        rotateX: -58,
        filter: "blur(8px)",
        transformOrigin: "center bottom"
      },
      {
        autoAlpha: 1,
        y: 0,
        rotateX: 0,
        filter: "blur(0px)",
        duration: 0.42,
        stagger: 0.045
      },
      0.04
    )
    .fromTo(
      pulseRef.value,
      { autoAlpha: 0.72, scale: 0.55 },
      { autoAlpha: 0, scale: 1.36, duration: 0.54, ease: "power2.out" },
      0
    );
};

onMounted(playBeaconMotion);

watch(
  () => [props.activeMeta.index, props.activeMeta.label],
  () => playBeaconMotion()
);

onBeforeUnmount(() => {
  beaconTimeline?.kill();
  gsap.killTweensOf([beaconRef.value, indexRef.value, labelRef.value, pulseRef.value]);
});
</script>

<template>
  <aside ref="beaconRef" class="chapter-beacon" aria-hidden="true">
    <span ref="pulseRef" class="chapter-beacon-pulse" />
    <span ref="indexRef" class="chapter-beacon-index">{{ activeMeta.index }}</span>
    <strong ref="labelRef">{{ activeMeta.label }}</strong>
  </aside>
</template>
