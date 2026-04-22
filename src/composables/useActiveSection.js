import { onBeforeUnmount, onMounted, ref } from "vue";

export function useActiveSection(initialSection = "home") {
  const activeSection = ref(initialSection);
  let observer = null;

  onMounted(() => {
    // 监听每个章节的可见比例，用来驱动导航和章节指示器。
    observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

        if (visible) {
          activeSection.value = visible.target.id;
        }
      },
      {
        threshold: [0.25, 0.45, 0.7]
      }
    );

    document.querySelectorAll("section[id]").forEach((section) => {
      observer.observe(section);
    });
  });

  onBeforeUnmount(() => {
    observer?.disconnect();
  });

  return {
    activeSection
  };
}
