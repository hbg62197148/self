import { onBeforeUnmount, onMounted } from "vue";

export function useRevealOnScroll(selector = "[data-reveal]") {
  let observer = null;

  onMounted(() => {
    // 根据滚动位置切换显隐类名，统一控制各区块入场节奏。
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const shouldShow = entry.isIntersecting && entry.intersectionRatio >= 0.22;
          const shouldReset = !entry.isIntersecting || entry.intersectionRatio <= 0.08;

          if (shouldShow) {
            entry.target.classList.add("is-visible");
          } else if (shouldReset) {
            entry.target.classList.remove("is-visible");
          }
        });
      },
      {
        threshold: [0, 0.08, 0.22, 0.4, 0.6],
        rootMargin: "0px 0px -8% 0px"
      }
    );

    document.querySelectorAll(selector).forEach((node) => {
      observer.observe(node);
    });
  });

  onBeforeUnmount(() => {
    observer?.disconnect();
  });
}
