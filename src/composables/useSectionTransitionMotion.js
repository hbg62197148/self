import { nextTick, onBeforeUnmount, onMounted, watch } from "vue";
import { gsap, ScrollTrigger } from "../lib/gsap";
import { useMotionPreference } from "./useMotionPreference";

const SECTION_GROUPS = [
  {
    id: "identity",
    groups: [
      { selector: ".section-heading", from: { x: -30, y: 28 }, duration: 0.72, at: 0.12 },
      { selector: ".name-ghost", from: { x: 0, y: 52, scale: 0.94, rotateX: 9, z: -70 }, duration: 0.86, at: 0.18 },
      { selector: ".name-row", all: true, from: { x: 38, y: 34, rotateX: 7 }, duration: 0.76, stagger: 0.055, at: 0.34 }
    ]
  },
  {
    id: "about",
    drift: {
      focus: ".about-visual",
      support: ".story-copy, .ask-panel"
    },
    groups: [
      { selector: ".about-visual", from: { x: 0, y: 58, scale: 0.94, rotateX: 10, rotateY: -5, z: -100 }, duration: 0.94, at: 0.1 },
      { selector: ".section-heading", from: { x: -28, y: 30, scale: 0.99 }, duration: 0.7, at: 0.26 },
      { selector: ".story-copy .stage-item", all: true, from: { x: 0, y: 28, scale: 0.988 }, duration: 0.58, stagger: 0.055, at: 0.42 },
      { selector: ".ask-panel", from: { x: 20, y: 44, scale: 0.97, rotateX: 7, rotateY: 3, z: -54 }, duration: 0.82, at: 0.54 }
    ]
  },
  {
    id: "skills",
    drift: {
      focus: ".universe-stage",
      support: ".skills-column"
    },
    groups: [
      { selector: ".universe-stage", from: { x: -24, y: 56, scale: 0.935, rotateX: 10, rotateY: 6, z: -116 }, duration: 0.94, at: 0.1 },
      { selector: ".section-heading", from: { x: -28, y: 30, scale: 0.99 }, duration: 0.7, at: 0.28 },
      { selector: ".skill-evidence-card", from: { x: 24, y: 32, scale: 0.975, rotateX: 6, rotateY: -3, z: -46 }, duration: 0.72, at: 0.44 },
      {
        selector: ".skills-column .skill-card",
        all: true,
        from: { x: 28, y: 34, scale: 0.985, rotateX: 7 },
        duration: 0.72,
        stagger: 0.075,
        at: 0.56
      }
    ]
  },
  {
    id: "projects",
    drift: {
      focus: ".project-detail, .project-accordion-detail",
      support: ".project-list"
    },
    groups: [
      { selector: ".project-detail", from: { x: 26, y: 58, scale: 0.94, rotateX: 9, rotateY: -6, z: -112 }, duration: 0.94, at: 0.1 },
      { selector: ".section-heading", from: { x: -28, y: 30, scale: 0.99 }, duration: 0.7, at: 0.26 },
      { selector: ".project-list .project-tab", all: true, from: { x: -30, y: 28, scale: 0.982, rotateX: 6, rotateY: 4 }, duration: 0.66, stagger: 0.055, at: 0.42 }
    ]
  },
  {
    id: "contact",
    groups: [
      { selector: ".section-heading", from: { x: -30, y: 28 }, duration: 0.72, at: 0.12 },
      { selector: ".contact-display", from: { x: -36, y: 36, rotateX: 7 }, duration: 0.82, at: 0.24 },
      {
        selector: ".contact-card",
        all: true,
        from: { x: 30, y: 34, rotateX: 7 },
        duration: 0.72,
        stagger: 0.08,
        at: 0.36
      }
    ]
  }
];

const toArray = (value) => (Array.isArray(value) ? value : [value]);

const collectSelectorTargets = (root, selector) => {
  if (!selector) {
    return [];
  }

  return [...root.querySelectorAll(selector)];
};

const createFromState = (group) => ({
  autoAlpha: 0,
  x: group.from.x ?? 0,
  y: group.from.y ?? 0,
  z: group.from.z ?? -32,
  scale: group.from.scale ?? 0.982,
  rotateX: group.from.rotateX ?? 5,
  rotateY: group.from.rotateY ?? 0,
  filter: "blur(16px)",
  transformPerspective: 1400,
  transformOrigin: group.transformOrigin ?? "center top"
});

const createToState = (group) => ({
  autoAlpha: 1,
  x: 0,
  y: 0,
  z: 0,
  scale: 1,
  rotateX: 0,
  rotateY: 0,
  filter: "blur(0px)",
  duration: group.duration,
  stagger: group.stagger ?? 0
});

export function useSectionTransitionMotion() {
  const { isMotionLite } = useMotionPreference();

  let context = null;
  let createFrameId = 0;
  let stopMotionWatch = null;
  const cleanupChrome = [];

  const cleanupSectionMotion = () => {
    if (createFrameId) {
      window.cancelAnimationFrame(createFrameId);
      createFrameId = 0;
    }

    context?.revert();
    context = null;
    cleanupChrome.splice(0).forEach((cleanup) => cleanup());
  };

  const ensureSectionChrome = (section) => {
    let aura = section.querySelector(":scope > .section-motion-aura");
    let scan = section.querySelector(":scope > .section-motion-scan");

    if (!aura) {
      aura = document.createElement("span");
      aura.className = "section-motion-aura";
      aura.setAttribute("aria-hidden", "true");
      section.prepend(aura);
      cleanupChrome.push(() => aura.remove());
    }

    if (!scan) {
      scan = document.createElement("span");
      scan.className = "section-motion-scan";
      scan.setAttribute("aria-hidden", "true");
      section.prepend(scan);
      cleanupChrome.push(() => scan.remove());
    }

    return { aura, scan };
  };

  const collectGroupTargets = (section, group) => {
    if (group.all) {
      return [...section.querySelectorAll(group.selector)];
    }

    return toArray(section.querySelector(group.selector)).filter(Boolean);
  };

  const createFocusDrift = (section, drift) => {
    if (!drift) {
      return;
    }

    const focusTargets = collectSelectorTargets(section, drift.focus);
    const supportTargets = collectSelectorTargets(section, drift.support);

    if (!focusTargets.length && !supportTargets.length) {
      return;
    }

    const timeline = gsap.timeline({
      defaults: {
        ease: "none"
      },
      scrollTrigger: {
        trigger: section,
        start: "top 34%",
        end: "bottom 28%",
        scrub: 1.15,
        invalidateOnRefresh: true
      }
    });

    if (focusTargets.length) {
      timeline.to(
        focusTargets,
        {
          y: -18,
          z: 28,
          scale: 1.012,
          rotateX: -1.2,
          filter: "blur(0px)",
          duration: 1
        },
        0
      );
    }

    if (supportTargets.length) {
      timeline.to(
        supportTargets,
        {
          y: -8,
          z: 8,
          duration: 1
        },
        0
      );
    }
  };

  // 完整动效模式下启用滚动时间线；弱动效模式会撤销 ScrollTrigger 和扫描光层。
  const createSectionTimelines = () => {
    cleanupSectionMotion();

    context = gsap.context(() => {
      SECTION_GROUPS.forEach((sectionConfig) => {
        const section = document.getElementById(sectionConfig.id);

        if (!section) {
          return;
        }

        const { aura, scan } = ensureSectionChrome(section);
        section.classList.add("section-motion-managed");
        cleanupChrome.push(() => section.classList.remove("section-motion-managed", "is-motion-active"));

        gsap.set(section, {
          transformPerspective: 1400,
          transformOrigin: "50% 0%",
          transformStyle: "preserve-3d"
        });

        gsap.set([aura, scan], {
          autoAlpha: 0
        });

        const timeline = gsap.timeline({
          defaults: {
            ease: "power3.out"
          },
          scrollTrigger: {
            trigger: section,
            start: "top 86%",
            end: "top 34%",
            scrub: 0.82,
            onEnter: () => section.classList.add("is-motion-active"),
            onEnterBack: () => section.classList.add("is-motion-active"),
            onLeave: () => section.classList.remove("is-motion-active"),
            onLeaveBack: () => section.classList.remove("is-motion-active")
          }
        });

        timeline
          .fromTo(
            section,
            {
              y: 52,
              scale: 0.986,
              rotateX: 5,
              filter: "blur(10px)"
            },
            {
              y: 0,
              scale: 1,
              rotateX: 0,
              filter: "blur(0px)",
              duration: 0.82
            },
            0
          )
          .fromTo(
            aura,
            {
              autoAlpha: 0,
              scaleX: 0.42,
              xPercent: -18
            },
            {
              autoAlpha: 1,
              scaleX: 1,
              xPercent: 0,
              duration: 0.68
            },
            0.02
          )
          .fromTo(
            scan,
            {
              autoAlpha: 0,
              xPercent: -140
            },
            {
              autoAlpha: 1,
              xPercent: 120,
              duration: 0.62,
              ease: "power2.inOut"
            },
            0.08
          )
          .to(scan, {
            autoAlpha: 0,
            duration: 0.18
          }, 0.56);

        sectionConfig.groups.forEach((group, index) => {
          const targets = collectGroupTargets(section, group);

          if (!targets.length) {
            return;
          }

          timeline.fromTo(
            targets,
            createFromState(group),
            createToState(group),
            group.at ?? (index === 0 ? 0.12 : "<+=0.08")
          );
        });

        createFocusDrift(section, sectionConfig.drift);
      });

      ScrollTrigger.refresh();
    });
  };

  const scheduleSectionTimelines = async () => {
    if (isMotionLite.value || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    await nextTick();
    createFrameId = window.requestAnimationFrame(createSectionTimelines);
  };

  onMounted(() => {
    stopMotionWatch = watch(
      isMotionLite,
      (liteMode) => {
        if (liteMode) {
          cleanupSectionMotion();
          return;
        }

        scheduleSectionTimelines();
      },
      { immediate: true }
    );
  });

  onBeforeUnmount(() => {
    stopMotionWatch?.();
    cleanupSectionMotion();
  });
}
