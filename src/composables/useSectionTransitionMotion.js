import { nextTick, onBeforeUnmount, onMounted } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SECTION_GROUPS = [
  {
    id: "identity",
    groups: [
      { selector: ".section-heading", from: { x: -30, y: 28 }, duration: 0.72 },
      { selector: ".name-ghost", from: { x: 0, y: 52, rotateX: 9 }, duration: 0.86 },
      { selector: ".name-row", all: true, from: { x: 38, y: 34, rotateX: 7 }, duration: 0.76, stagger: 0.055 }
    ]
  },
  {
    id: "about",
    groups: [
      { selector: ".section-heading", from: { x: -30, y: 28 }, duration: 0.72 },
      { selector: ".about-story", from: { x: -34, y: 36, rotateX: 7 }, duration: 0.82 },
      { selector: ".ask-panel", from: { x: 34, y: 36, rotateX: 7 }, duration: 0.82 }
    ]
  },
  {
    id: "skills",
    groups: [
      { selector: ".section-heading", from: { x: -30, y: 28 }, duration: 0.72 },
      { selector: ".universe-stage", from: { x: -36, y: 42, rotateX: 8 }, duration: 0.9 },
      {
        selector: ".skills-column .skill-card",
        all: true,
        from: { x: 30, y: 34, rotateX: 7 },
        duration: 0.72,
        stagger: 0.08
      }
    ]
  },
  {
    id: "projects",
    groups: [
      { selector: ".section-heading", from: { x: -30, y: 28 }, duration: 0.72 },
      { selector: ".project-list", from: { x: -36, y: 36, rotateX: 7 }, duration: 0.82 },
      { selector: ".project-detail", from: { x: 36, y: 38, rotateX: 7 }, duration: 0.86 }
    ]
  },
  {
    id: "contact",
    groups: [
      { selector: ".section-heading", from: { x: -30, y: 28 }, duration: 0.72 },
      { selector: ".contact-display", from: { x: -36, y: 36, rotateX: 7 }, duration: 0.82 },
      {
        selector: ".contact-card",
        all: true,
        from: { x: 30, y: 34, rotateX: 7 },
        duration: 0.72,
        stagger: 0.08
      }
    ]
  }
];

const toArray = (value) => (Array.isArray(value) ? value : [value]);

export function useSectionTransitionMotion() {
  let context = null;
  const cleanupChrome = [];

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

  // 把各个模块的入场变成 GSAP 滚动时间线，让章节之间的衔接更接近官网式 showcase。
  const createSectionTimelines = () => {
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
          transformOrigin: "50% 0%"
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
            {
              autoAlpha: 0,
              x: group.from.x,
              y: group.from.y,
              scale: 0.982,
              rotateX: group.from.rotateX ?? 5,
              filter: "blur(14px)",
              transformPerspective: 1200,
              transformOrigin: "center top"
            },
            {
              autoAlpha: 1,
              x: 0,
              y: 0,
              scale: 1,
              rotateX: 0,
              filter: "blur(0px)",
              duration: group.duration,
              stagger: group.stagger ?? 0
            },
            index === 0 ? 0.12 : "<+=0.08"
          );
        });
      });

      ScrollTrigger.refresh();
    });
  };

  onMounted(async () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    await nextTick();
    window.requestAnimationFrame(createSectionTimelines);
  });

  onBeforeUnmount(() => {
    context?.revert();
    cleanupChrome.splice(0).forEach((cleanup) => cleanup());
  });
}
