import { nextTick, onBeforeUnmount, onMounted } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SECTION_GROUPS = [
  {
    id: "identity",
    groups: [
      { selector: ".section-heading", from: { x: -26, y: 24 }, duration: 0.68 },
      { selector: ".name-stack", from: { x: 34, y: 34 }, duration: 0.86 }
    ]
  },
  {
    id: "about",
    groups: [
      { selector: ".section-heading", from: { x: -28, y: 24 }, duration: 0.68 },
      { selector: ".about-story", from: { x: -30, y: 34 }, duration: 0.78 },
      { selector: ".ask-panel", from: { x: 30, y: 34 }, duration: 0.78 }
    ]
  },
  {
    id: "skills",
    groups: [
      { selector: ".section-heading", from: { x: -28, y: 24 }, duration: 0.68 },
      { selector: ".universe-stage", from: { x: -34, y: 38 }, duration: 0.84 },
      {
        selector: ".skills-column .skill-card",
        all: true,
        from: { x: 26, y: 30 },
        duration: 0.7,
        stagger: 0.1
      }
    ]
  },
  {
    id: "projects",
    groups: [
      { selector: ".section-heading", from: { x: -28, y: 24 }, duration: 0.68 },
      { selector: ".project-list", from: { x: -30, y: 34 }, duration: 0.78 },
      { selector: ".project-detail", from: { x: 30, y: 34 }, duration: 0.82 }
    ]
  },
  {
    id: "contact",
    groups: [
      { selector: ".section-heading", from: { x: -28, y: 24 }, duration: 0.68 },
      { selector: ".contact-display", from: { x: -30, y: 34 }, duration: 0.78 },
      {
        selector: ".contact-card",
        all: true,
        from: { x: 26, y: 30 },
        duration: 0.68,
        stagger: 0.08
      }
    ]
  }
];

const toArray = (value) => (Array.isArray(value) ? value : [value]);

export function useSectionTransitionMotion() {
  let context = null;

  // 把各个模块的入场改成 GSAP 滚动时间线，让章节之间的切换更细腻。
  const createSectionTimelines = () => {
    context = gsap.context(() => {
      SECTION_GROUPS.forEach((sectionConfig) => {
        const section = document.getElementById(sectionConfig.id);

        if (!section) {
          return;
        }

        const timeline = gsap.timeline({
          defaults: {
            ease: "power3.out"
          },
          scrollTrigger: {
            trigger: section,
            start: "top 82%",
            end: "top 24%",
            scrub: 1.08
          }
        });

        sectionConfig.groups.forEach((group, index) => {
          const targets = group.all
            ? [...section.querySelectorAll(group.selector)]
            : toArray(section.querySelector(group.selector)).filter(Boolean);

          if (!targets.length) {
            return;
          }

          timeline.fromTo(
            targets,
            {
              autoAlpha: 0,
              x: group.from.x,
              y: group.from.y,
              scale: 0.985,
              rotateX: 5,
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
            index === 0 ? 0 : "<+=0.08"
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
  });
}
