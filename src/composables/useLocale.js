import { computed, ref, watch } from "vue";

const STORAGE_KEY = "personal-issue-locale";
const SUPPORTED_LOCALES = new Set(["zh", "en"]);

const canUseWindow = () => typeof window !== "undefined" && typeof document !== "undefined";

const normalizeLocale = (value) => (SUPPORTED_LOCALES.has(value) ? value : "zh");

const readInitialLocale = () => {
  if (!canUseWindow()) {
    return "zh";
  }

  return normalizeLocale(window.localStorage.getItem(STORAGE_KEY));
};

const locale = ref(readInitialLocale());
let initialized = false;

const setLocale = (nextLocale) => {
  locale.value = normalizeLocale(nextLocale);

  if (canUseWindow()) {
    window.localStorage.setItem(STORAGE_KEY, locale.value);
  }
};

const initLocale = () => {
  if (initialized) {
    return;
  }

  initialized = true;

  watch(
    locale,
    (nextLocale) => {
      if (canUseWindow()) {
        document.documentElement.lang = nextLocale === "zh" ? "zh-CN" : "en";
      }
    },
    { immediate: true }
  );
};

export function useLocale() {
  initLocale();

  const isEnglish = computed(() => locale.value === "en");
  const toggleLabel = computed(() => (isEnglish.value ? "中文" : "EN"));
  const toggleAriaLabel = computed(() => (isEnglish.value ? "Switch to Chinese" : "切换到英文版"));

  const toggleLocale = () => {
    setLocale(isEnglish.value ? "zh" : "en");
  };

  return {
    locale,
    isEnglish,
    setLocale,
    toggleLocale,
    toggleLabel,
    toggleAriaLabel
  };
}
