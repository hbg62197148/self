import { computed, ref } from "vue";

const STORAGE_KEY = "personal-issue-motion-lite";
const isMotionLite = ref(false);

let initialized = false;
let mediaQuery = null;

const canUseWindow = () => typeof window !== "undefined" && typeof document !== "undefined";

const applyMotionClass = () => {
  if (!canUseWindow()) {
    return;
  }

  document.documentElement.classList.toggle("motion-lite", isMotionLite.value);
  document.documentElement.dataset.motionMode = isMotionLite.value ? "lite" : "full";
};

const readInitialPreference = () => {
  if (!canUseWindow()) {
    return false;
  }

  const savedPreference = window.localStorage.getItem(STORAGE_KEY);

  if (savedPreference !== null) {
    return savedPreference === "lite";
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

const setMotionLite = (value, { persist = true } = {}) => {
  isMotionLite.value = Boolean(value);
  applyMotionClass();

  if (persist && canUseWindow()) {
    window.localStorage.setItem(STORAGE_KEY, isMotionLite.value ? "lite" : "full");
  }
};

export function initMotionPreference() {
  if (initialized || !canUseWindow()) {
    return;
  }

  initialized = true;
  setMotionLite(readInitialPreference(), { persist: false });

  mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", (event) => {
    if (window.localStorage.getItem(STORAGE_KEY) === null) {
      setMotionLite(event.matches, { persist: false });
    }
  });
}

export function useMotionPreference() {
  initMotionPreference();

  const motionModeLabel = computed(() => (isMotionLite.value ? "恢复完整动效" : "弱化页面动效"));

  const toggleMotionMode = () => {
    setMotionLite(!isMotionLite.value);
  };

  return {
    isMotionLite,
    motionModeLabel,
    setMotionLite,
    toggleMotionMode
  };
}