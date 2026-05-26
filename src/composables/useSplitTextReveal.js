import { nextTick, onBeforeUnmount, onMounted, watch } from "vue";
import { gsap, ScrollTrigger, SplitText } from "../lib/gsap";
import { useMotionPreference } from "./useMotionPreference";

const canUseWindow = () => typeof window !== "undefined" && typeof document !== "undefined";

const prefersReducedMotion = () =>
  canUseWindow() && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const waitForFonts = async () => {
  try {
    await document.fonts?.ready;
  } catch {
    // If FontFaceSet is unavailable or rejects, SplitText can still use current layout.
  }
};

export function useSplitTextReveal(rootRef, watchSource = null, options = {}) {
  const { isMotionLite } = useMotionPreference();

  let context = null;
  let titleSplit = null;
  let copySplit = null;
  let createFrameId = 0;
  let stopSourceWatch = null;
  let stopMotionWatch = null;
  let refreshToken = 0;

  const clearReveal = () => {
    if (createFrameId) {
      window.cancelAnimationFrame(createFrameId);
      createFrameId = 0;
    }

    context?.revert();
    context = null;

    titleSplit?.revert();
    copySplit?.revert();
    titleSplit = null;
    copySplit = null;

    rootRef.value?.classList.remove("split-reveal-ready");
  };

  const createReveal = () => {
    const root = rootRef.value;

    if (!root) {
      return;
    }

    const title = root.querySelector(options.titleSelector ?? ".section-title");
    const copy = root.querySelector(options.copySelector ?? ".section-copy");

    if (!title && !copy) {
      return;
    }

    root.classList.add("split-reveal-ready");

    context = gsap.context(() => {
      if (title) {
        titleSplit = SplitText.create(title, {
          type: "words,chars",
          wordsClass: "split-reveal-word",
          charsClass: "split-reveal-char",
          aria: "auto"
        });
      }

      if (copy) {
        copySplit = SplitText.create(copy, {
          type: "lines",
          linesClass: "split-reveal-line",
          aria: "auto"
        });
      }

      const titleChars = titleSplit?.chars ?? [];
      const copyLines = copySplit?.lines ?? [];

      gsap.set(titleChars, {
        autoAlpha: 0,
        yPercent: 92,
        rotateX: -58,
        filter: "blur(8px)",
        transformOrigin: "50% 100%"
      });

      gsap.set(copyLines, {
        autoAlpha: 0,
        y: 16,
        filter: "blur(8px)"
      });

      const timeline = gsap.timeline({
        defaults: {
          ease: "power3.out",
          overwrite: "auto"
        },
        scrollTrigger: {
          trigger: root.closest("[data-reveal]") ?? root,
          start: options.start ?? "top 82%",
          toggleActions: "play none none reverse",
          invalidateOnRefresh: true
        }
      });

      if (titleChars.length) {
        timeline.to(titleChars, {
          autoAlpha: 1,
          yPercent: 0,
          rotateX: 0,
          filter: "blur(0px)",
          duration: 0.72,
          stagger: {
            each: 0.014,
            from: "start"
          }
        }, 0);
      }

      if (copyLines.length) {
        timeline.to(copyLines, {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.54,
          stagger: 0.07
        }, titleChars.length ? 0.18 : 0);
      }

      ScrollTrigger.refresh();
    }, root);
  };

  const refreshReveal = async () => {
    refreshToken += 1;
    const token = refreshToken;

    clearReveal();

    if (!canUseWindow() || isMotionLite.value || prefersReducedMotion()) {
      return;
    }

    await nextTick();
    await waitForFonts();

    if (token !== refreshToken || !rootRef.value) {
      return;
    }

    createFrameId = window.requestAnimationFrame(() => {
      createFrameId = 0;

      if (token === refreshToken) {
        createReveal();
      }
    });
  };

  onMounted(() => {
    refreshReveal();

    if (watchSource) {
      stopSourceWatch = watch(watchSource, refreshReveal);
    }

    stopMotionWatch = watch(isMotionLite, (liteMode) => {
      if (liteMode) {
        clearReveal();
        return;
      }

      refreshReveal();
    });
  });

  onBeforeUnmount(() => {
    refreshToken += 1;
    stopSourceWatch?.();
    stopMotionWatch?.();
    clearReveal();
  });
}
