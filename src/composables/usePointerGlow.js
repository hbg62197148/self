import { onBeforeUnmount, onMounted } from "vue";

export function usePointerGlow() {
  const handlePointerMove = (event) => {
    document.documentElement.style.setProperty("--pointer-x", `${event.clientX}px`);
    document.documentElement.style.setProperty("--pointer-y", `${event.clientY}px`);
  };

  onMounted(() => {
    // 把鼠标位置同步到全局 CSS 变量，驱动背景光晕移动。
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
  });

  onBeforeUnmount(() => {
    window.removeEventListener("pointermove", handlePointerMove);
  });
}
