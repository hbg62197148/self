import { nextTick, onBeforeUnmount, onMounted, watch } from "vue";
import { gsap, ScrollTrigger } from "../lib/gsap";
import { useMotionPreference } from "./useMotionPreference";

const PANEL_SELECTOR = ".page-content > .hero, .page-content > .section";
const ENABLE_QUERY = "(min-width: 861px) and (min-height: 620px)";

const canUseWindow = () => typeof window !== "undefined" && typeof document !== "undefined";

const waitForFonts = async () => {
  try {
    await document.fonts?.ready;
  } catch {
    // Font loading is only used to improve height measurement accuracy.
  }
};

const getPanelContentTargets = (panel) =>
  [...panel.children].filter((child) => !child.matches(".section-slide-aura"));

export function useSectionTransitionMotion() {
  const { isMotionLite } = useMotionPreference();

  let context = null;
  let createFrameId = 0;
  let resizeObserver = null;
  let mediaQuery = null;
  let stopMotionWatch = null;
  let removeMediaListener = null;
  let refreshToken = 0;

  const cleanup = () => {
    refreshToken += 1;

    if (createFrameId) {
      window.cancelAnimationFrame(createFrameId);
      createFrameId = 0;
    }

    resizeObserver?.disconnect();
    resizeObserver = null;
    context?.revert();
    context = null;

    document.querySelector(".page-content")?.classList.remove("is-slide-motion");
    document.querySelectorAll(PANEL_SELECTOR).forEach((panel) => {
      panel.classList.remove("section-slide-panel", "is-slide-active");
      panel.style.marginBottom = "";
    });
    document.querySelectorAll(".section-slide-aura").forEach((node) => node.remove());
  };

  const createAura = (panel) => {
    let aura = panel.querySelector(":scope > .section-slide-aura");

    if (!aura) {
      aura = document.createElement("span");
      aura.className = "section-slide-aura";
      aura.setAttribute("aria-hidden", "true");
      panel.prepend(aura);
    }

    return aura;
  };

  const measureOverflow = (panel) => {
    const viewportHeight = window.innerHeight;
    const contentHeight = panel.scrollHeight;
    const visibleHeight = panel.clientHeight || viewportHeight;
    const overflow = Math.max(0, contentHeight - visibleHeight);
    const ratio = overflow > 0 ? overflow / (overflow + viewportHeight) : 0;

    return {
      overflow,
      ratio,
      viewportHeight
    };
  };

  const createPanelMotion = () => {
    cleanup();

    const pageContent = document.querySelector(".page-content");
    const panels = [...document.querySelectorAll(PANEL_SELECTOR)];

    if (!pageContent || panels.length < 2) {
      return;
    }

    pageContent.classList.add("is-slide-motion");
    panels.forEach((panel) => panel.classList.add("section-slide-panel"));

    context = gsap.context(() => {
      panels.slice(0, -1).forEach((panel) => {
        const contentTargets = getPanelContentTargets(panel);
        const aura = createAura(panel);
        const { overflow, ratio, viewportHeight } = measureOverflow(panel);

        if (ratio > 0) {
          panel.style.marginBottom = `${overflow}px`;
        }

        gsap.set(panel, {
          transformOrigin: "50% 0%",
          willChange: "transform, opacity, filter"
        });

        gsap.set(aura, {
          autoAlpha: 0
        });

        const timeline = gsap.timeline({
          defaults: {
            ease: "none",
            overwrite: "auto"
          },
          scrollTrigger: {
            trigger: panel,
            start: "bottom bottom",
            end: () => (ratio > 0 ? `+=${panel.scrollHeight}` : "bottom top"),
            pin: true,
            pinSpacing: false,
            scrub: true,
            invalidateOnRefresh: true,
            onEnter: () => panel.classList.add("is-slide-active"),
            onEnterBack: () => panel.classList.add("is-slide-active"),
            onLeave: () => panel.classList.remove("is-slide-active"),
            onLeaveBack: () => panel.classList.remove("is-slide-active")
          }
        });

        if (ratio > 0 && contentTargets.length) {
          timeline.to(contentTargets, {
            y: -overflow,
            duration: ratio / Math.max(1 - ratio, 0.001)
          });
        }

        timeline
          .to(aura, {
            autoAlpha: 1,
            duration: 0.16
          }, ratio > 0 ? ">" : 0)
          .fromTo(
            panel,
            {
              scale: 1,
              autoAlpha: 1,
              filter: "blur(0px)"
            },
            {
              scale: 0.86,
              autoAlpha: 0.54,
              filter: "blur(1.5px)",
              duration: 0.84
            },
            "<"
          )
          .to(panel, {
            autoAlpha: 0,
            y: -viewportHeight * 0.08,
            duration: 0.16
          });
      });

      ScrollTrigger.refresh();
    }, pageContent);

    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(() => ScrollTrigger.refresh());
      panels.forEach((panel) => resizeObserver.observe(panel));
    }
  };

  const scheduleCreate = async () => {
    if (!canUseWindow() || isMotionLite.value || !mediaQuery?.matches) {
      cleanup();
      return;
    }

    const token = refreshToken + 1;
    refreshToken = token;

    await nextTick();
    await waitForFonts();

    if (token !== refreshToken) {
      return;
    }

    createFrameId = window.requestAnimationFrame(() => {
      createFrameId = 0;

      if (token === refreshToken) {
        createPanelMotion();
      }
    });
  };

  onMounted(() => {
    if (!canUseWindow()) {
      return;
    }

    mediaQuery = window.matchMedia(ENABLE_QUERY);

    const handleMediaChange = () => {
      scheduleCreate();
    };

    mediaQuery.addEventListener("change", handleMediaChange);
    removeMediaListener = () => mediaQuery.removeEventListener("change", handleMediaChange);

    stopMotionWatch = watch(
      isMotionLite,
      () => {
        scheduleCreate();
      },
      { immediate: true }
    );
  });

  onBeforeUnmount(() => {
    stopMotionWatch?.();
    removeMediaListener?.();
    cleanup();
  });
}
