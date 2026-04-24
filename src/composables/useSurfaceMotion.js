import { nextTick, onBeforeUnmount, onMounted } from "vue";
import { gsap } from "gsap";

const SURFACE_SELECTOR = [
  ".stat-card",
  ".fact-card",
  ".question-button",
  ".answer-stage",
  ".skill-card",
  ".project-tab",
  ".contact-display",
  ".contact-card"
].join(", ");

const SPOTLIGHT_SIZE = 190;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function useSurfaceMotion() {
  const cleanups = [];
  let observer = null;

  const attachSurface = (surface) => {
    if (surface.dataset.surfaceMotionBound === "true") {
      return;
    }

    surface.dataset.surfaceMotionBound = "true";
    surface.classList.add("surface-motion");

    const spotlight = document.createElement("span");
    spotlight.className = "surface-spotlight";
    spotlight.setAttribute("aria-hidden", "true");
    surface.prepend(spotlight);

    const moveX = gsap.quickTo(surface, "x", { duration: 0.28, ease: "power3.out" });
    const moveY = gsap.quickTo(surface, "y", { duration: 0.28, ease: "power3.out" });
    const rotateX = gsap.quickTo(surface, "rotateX", { duration: 0.34, ease: "power3.out" });
    const rotateY = gsap.quickTo(surface, "rotateY", { duration: 0.34, ease: "power3.out" });
    const spotX = gsap.quickTo(spotlight, "x", { duration: 0.22, ease: "power3.out" });
    const spotY = gsap.quickTo(spotlight, "y", { duration: 0.22, ease: "power3.out" });

    gsap.set(surface, {
      transformPerspective: 900,
      transformOrigin: "center center"
    });

    gsap.set(spotlight, {
      autoAlpha: 0,
      scale: 0.82
    });

    // 鼠标在卡片内部移动时，只做很轻的位移和倾斜，避免抢走内容本身的阅读焦点。
    const handleMove = (event) => {
      const rect = surface.getBoundingClientRect();
      const localX = event.clientX - rect.left;
      const localY = event.clientY - rect.top;
      const ratioX = localX / rect.width - 0.5;
      const ratioY = localY / rect.height - 0.5;

      moveX(clamp(ratioX * 5, -4, 4));
      moveY(clamp(ratioY * 4 - 2, -4, 2));
      rotateX(clamp(ratioY * -6, -5, 5));
      rotateY(clamp(ratioX * 7, -6, 6));
      spotX(localX - SPOTLIGHT_SIZE / 2);
      spotY(localY - SPOTLIGHT_SIZE / 2);
    };

    const handleEnter = (event) => {
      surface.classList.add("is-surface-active");
      handleMove(event);

      gsap.to(surface, {
        scale: 1.012,
        duration: 0.24,
        ease: "power2.out",
        overwrite: "auto"
      });

      gsap.to(spotlight, {
        autoAlpha: 0.82,
        scale: 1,
        duration: 0.22,
        ease: "power2.out",
        overwrite: "auto"
      });
    };

    const handleLeave = () => {
      surface.classList.remove("is-surface-active");
      moveX(0);
      moveY(0);
      rotateX(0);
      rotateY(0);

      gsap.to(surface, {
        scale: 1,
        duration: 0.34,
        ease: "power3.out",
        overwrite: "auto"
      });

      gsap.to(spotlight, {
        autoAlpha: 0,
        scale: 0.82,
        duration: 0.24,
        ease: "power2.out",
        overwrite: "auto"
      });
    };

    const handleFocus = () => {
      surface.classList.add("is-surface-active");

      gsap.to(surface, {
        y: -3,
        scale: 1.008,
        duration: 0.22,
        ease: "power2.out",
        overwrite: "auto"
      });

      gsap.to(spotlight, {
        autoAlpha: 0.46,
        x: Math.max(0, surface.clientWidth - SPOTLIGHT_SIZE) / 2,
        y: Math.max(0, surface.clientHeight - SPOTLIGHT_SIZE) / 2,
        scale: 1,
        duration: 0.22,
        ease: "power2.out",
        overwrite: "auto"
      });
    };

    surface.addEventListener("pointerenter", handleEnter);
    surface.addEventListener("pointermove", handleMove);
    surface.addEventListener("pointerleave", handleLeave);
    surface.addEventListener("focusin", handleFocus);
    surface.addEventListener("focusout", handleLeave);

    cleanups.push(() => {
      surface.removeEventListener("pointerenter", handleEnter);
      surface.removeEventListener("pointermove", handleMove);
      surface.removeEventListener("pointerleave", handleLeave);
      surface.removeEventListener("focusin", handleFocus);
      surface.removeEventListener("focusout", handleLeave);
      gsap.killTweensOf([surface, spotlight]);
      spotlight.remove();
      surface.classList.remove("surface-motion", "is-surface-active");
      delete surface.dataset.surfaceMotionBound;
    });
  };

  const scanSurfaces = () => {
    document.querySelectorAll(SURFACE_SELECTOR).forEach(attachSurface);
  };

  onMounted(async () => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !window.matchMedia("(pointer: fine)").matches
    ) {
      return;
    }

    await nextTick();
    window.requestAnimationFrame(scanSurfaces);

    const root = document.querySelector(".page-content");

    if (root) {
      observer = new MutationObserver(() => window.requestAnimationFrame(scanSurfaces));
      observer.observe(root, {
        childList: true,
        subtree: true
      });
    }
  });

  onBeforeUnmount(() => {
    observer?.disconnect();
    cleanups.splice(0).forEach((cleanup) => cleanup());
  });
}
