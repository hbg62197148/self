<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import { gsap } from "gsap";

const props = defineProps({
  navItems: {
    type: Array,
    default: () => []
  },
  activeSection: {
    type: String,
    default: "home"
  }
});

const navRef = ref(null);
const indicatorRef = ref(null);

let resizeObserver = null;
let removeResizeFallback = null;

// 顶部导航的高亮块由 GSAP 跟随当前章节移动，形成类似官网导航定位器的手感。
const moveIndicator = async (immediate = false) => {
  await nextTick();

  const nav = navRef.value;
  const indicator = indicatorRef.value;
  const activeLink = nav?.querySelector(`[data-nav-id="${props.activeSection}"]`);

  if (!nav || !indicator || !activeLink) {
    return;
  }

  const navRect = nav.getBoundingClientRect();
  const linkRect = activeLink.getBoundingClientRect();

  gsap.to(indicator, {
    autoAlpha: 1,
    x: linkRect.left - navRect.left,
    y: linkRect.top - navRect.top,
    width: linkRect.width,
    height: linkRect.height,
    duration: immediate ? 0 : 0.46,
    ease: "expo.out",
    overwrite: "auto"
  });
};

onMounted(() => {
  moveIndicator(true);

  if ("ResizeObserver" in window && navRef.value) {
    resizeObserver = new ResizeObserver(() => moveIndicator(true));
    resizeObserver.observe(navRef.value);
  } else {
    const handleResize = () => moveIndicator(true);
    window.addEventListener("resize", handleResize);
    removeResizeFallback = () => window.removeEventListener("resize", handleResize);
  }
});

watch(
  () => props.activeSection,
  () => moveIndicator()
);

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  removeResizeFallback?.();
  gsap.killTweensOf(indicatorRef.value);
});
</script>

<template>
  <header class="site-header">
    <a class="brand" href="#home">
      <span class="brand-mark">PI</span>
      <span class="brand-copy">
        <strong>Personal Issue</strong>
        <small>个人专刊</small>
      </span>
    </a>

    <nav ref="navRef" class="site-nav" aria-label="页面导航">
      <span ref="indicatorRef" class="nav-indicator" aria-hidden="true" />

      <a
        v-for="item in navItems"
        :key="item.id"
        class="nav-link"
        :class="{ 'is-active': activeSection === item.id }"
        :href="`#${item.id}`"
        :data-nav-id="item.id"
      >
        {{ item.label }}
      </a>

      <RouterLink class="nav-link" to="/admin">
        后台
      </RouterLink>
    </nav>
  </header>
</template>
