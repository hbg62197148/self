import { onBeforeUnmount, onMounted, watch } from "vue";
import { useMotionPreference } from "./useMotionPreference";

export function usePointerGlow() {
  const { isMotionLite } = useMotionPreference();

  let isListening = false;
  let stopMotionWatch = null;

  const handlePointerMove = (event) => {
    document.documentElement.style.setProperty("--pointer-x", `${event.clientX}px`);
    document.documentElement.style.setProperty("--pointer-y", `${event.clientY}px`);
  };

  const enablePointerGlow = () => {
    if (isListening || isMotionLite.value) {
      return;
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    isListening = true;
  };

  const disablePointerGlow = () => {
    if (!isListening) {
      return;
    }

    window.removeEventListener("pointermove", handlePointerMove);
    isListening = false;
  };

  onMounted(() => {
    // 鼠标位置只在完整动效模式下同步到全局 CSS 变量，弱动效模式会停掉这个高频监听。
    stopMotionWatch = watch(
      isMotionLite,
      (liteMode) => {
        if (liteMode) {
          disablePointerGlow();
          return;
        }

        enablePointerGlow();
      },
      { immediate: true }
    );
  });

  onBeforeUnmount(() => {
    stopMotionWatch?.();
    disablePointerGlow();
  });
}
