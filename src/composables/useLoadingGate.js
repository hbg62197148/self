import { onBeforeUnmount, onMounted, ref, watch } from "vue";

export function useLoadingGate(delay = 1300) {
  const loading = ref(true);
  let timerId = null;

  // 开场遮罩显示时锁住滚动，避免页面提前露出。
  watch(
    loading,
    (isLoading) => {
      document.body.style.overflow = isLoading ? "hidden" : "";
    },
    { immediate: true }
  );

  onMounted(() => {
    // 留出一个短暂启动时间，让首屏过渡更完整。
    timerId = window.setTimeout(() => {
      loading.value = false;
      timerId = null;
    }, delay);
  });

  onBeforeUnmount(() => {
    if (timerId !== null) {
      window.clearTimeout(timerId);
    }

    document.body.style.overflow = "";
  });

  return {
    loading
  };
}
