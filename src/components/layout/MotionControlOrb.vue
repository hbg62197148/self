  <script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useMotionPreference } from "../../composables/useMotionPreference";

const { isMotionLite, motionModeLabel, toggleMotionMode } = useMotionPreference();

const ORB_POSITION_KEY = "personal-issue-motion-orb-position";
const DESKTOP_EDGE_GAP = 24;
const MOBILE_EDGE_GAP = 14;
const DESKTOP_BOTTOM_GAP = 26;
const MOBILE_BOTTOM_GAP = 16;
const DESKTOP_ORB_SIZE = 68;
const MOBILE_ORB_SIZE = 58;

const orbRef = ref(null);
const isDragging = ref(false);
const isPositionReady = ref(false);
const orbPosition = ref({ left: DESKTOP_EDGE_GAP, top: 0 });
const dragState = {
  pointerId: null,
  offsetX: 0,
  offsetY: 0,
  startX: 0,
  startY: 0,
};
let shouldSkipNextClick = false;

const orbStyle = computed(() => {
  if (!isPositionReady.value) {
    return {};
  }

  return {
    left: `${orbPosition.value.left}px`,
    top: `${orbPosition.value.top}px`,
    bottom: "auto",
  };
});

function getEdgeGap() {
  return window.innerWidth <= 640 ? MOBILE_EDGE_GAP : DESKTOP_EDGE_GAP;
}

function getBottomGap() {
  return window.innerWidth <= 640 ? MOBILE_BOTTOM_GAP : DESKTOP_BOTTOM_GAP;
}

function getFallbackSize() {
  return window.innerWidth <= 640 ? MOBILE_ORB_SIZE : DESKTOP_ORB_SIZE;
}

function getOrbSize() {
  const rect = orbRef.value?.getBoundingClientRect();
  const fallbackSize = getFallbackSize();

  return {
    width: rect?.width || fallbackSize,
    height: rect?.height || fallbackSize,
  };
}

function clampPosition(left, top) {
  const edgeGap = getEdgeGap();
  const { width, height } = getOrbSize();
  const maxLeft = window.innerWidth - width - edgeGap;
  const maxTop = window.innerHeight - height - edgeGap;

  return {
    left: Math.min(Math.max(left, edgeGap), Math.max(edgeGap, maxLeft)),
    top: Math.min(Math.max(top, edgeGap), Math.max(edgeGap, maxTop)),
  };
}

function getDefaultPosition() {
  const edgeGap = getEdgeGap();
  const bottomGap = getBottomGap();
  const { height } = getOrbSize();

  return clampPosition(edgeGap, window.innerHeight - height - bottomGap);
}

function readSavedPosition() {
  try {
    const savedValue = localStorage.getItem(ORB_POSITION_KEY);
    return savedValue ? JSON.parse(savedValue) : null;
  } catch {
    return null;
  }
}

function savePosition(side, top) {
  try {
    localStorage.setItem(ORB_POSITION_KEY, JSON.stringify({ side, top }));
  } catch {
    // 保存失败不影响悬浮球本身使用，忽略浏览器隐私模式等限制。
  }
}

function restorePosition() {
  const savedPosition = readSavedPosition();
  const defaultPosition = getDefaultPosition();
  const edgeGap = getEdgeGap();
  const { width } = getOrbSize();

  if (!savedPosition) {
    orbPosition.value = defaultPosition;
    return;
  }

  const side = savedPosition.side === "right" ? "right" : "left";
  const left = side === "right" ? window.innerWidth - width - edgeGap : edgeGap;
  const top = Number.isFinite(savedPosition.top) ? savedPosition.top : defaultPosition.top;
  orbPosition.value = clampPosition(left, top);
}

function snapToEdge() {
  const edgeGap = getEdgeGap();
  const { width } = getOrbSize();
  const orbCenterX = orbPosition.value.left + width / 2;
  const targetSide = orbCenterX > window.innerWidth / 2 ? "right" : "left";
  const targetLeft = targetSide === "right" ? window.innerWidth - width - edgeGap : edgeGap;
  const snappedPosition = clampPosition(targetLeft, orbPosition.value.top);

  orbPosition.value = snappedPosition;
  savePosition(targetSide, snappedPosition.top);
}

function moveOrbWithPointer(event) {
  const nextLeft = event.clientX - dragState.offsetX;
  const nextTop = event.clientY - dragState.offsetY;
  orbPosition.value = clampPosition(nextLeft, nextTop);

  if (Math.abs(event.clientX - dragState.startX) > 4 || Math.abs(event.clientY - dragState.startY) > 4) {
    shouldSkipNextClick = true;
  }
}

function handlePointerDown(event) {
  if (event.button !== undefined && event.button !== 0) {
    return;
  }

  const rect = orbRef.value?.getBoundingClientRect();
  if (!rect) {
    return;
  }

  isDragging.value = true;
  shouldSkipNextClick = false;
  dragState.pointerId = event.pointerId;
  dragState.offsetX = event.clientX - rect.left;
  dragState.offsetY = event.clientY - rect.top;
  dragState.startX = event.clientX;
  dragState.startY = event.clientY;
  orbRef.value?.setPointerCapture?.(event.pointerId);
}

function handlePointerMove(event) {
  if (!isDragging.value || event.pointerId !== dragState.pointerId) {
    return;
  }

  moveOrbWithPointer(event);
}

function finishDrag(event) {
  if (!isDragging.value || event.pointerId !== dragState.pointerId) {
    return;
  }

  isDragging.value = false;
  dragState.pointerId = null;
  orbRef.value?.releasePointerCapture?.(event.pointerId);
  snapToEdge();
}

function handleClick(event) {
  if (shouldSkipNextClick) {
    event.preventDefault();
    event.stopPropagation();
    shouldSkipNextClick = false;
    return;
  }

  toggleMotionMode();
}

function handleResize() {
  restorePosition();
  snapToEdge();
}

onMounted(() => {
  restorePosition();
  isPositionReady.value = true;
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<template>
  <button
    ref="orbRef"
    type="button"
    :class="['motion-orb', { 'is-lite': isMotionLite, 'is-dragging': isDragging }]"
    :style="orbStyle"
    :aria-pressed="isMotionLite"
    :aria-label="motionModeLabel"
    :title="motionModeLabel"
    @click="handleClick"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="finishDrag"
    @pointercancel="finishDrag"
  >
    <span class="motion-orb-ring" aria-hidden="true" />
    <span class="motion-orb-core" aria-hidden="true">
      <span class="motion-orb-wave" />
      <span class="motion-orb-dot" />
    </span>
    <span class="motion-orb-copy">{{ isMotionLite ? "Lite" : "FX" }}</span>
  </button>
</template>
