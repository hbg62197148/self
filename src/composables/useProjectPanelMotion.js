import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { gsap } from "gsap";

export function useProjectPanelMotion(displayedProject) {
  const detailSwapRef = ref(null);

  let panelTimeline = null;
  let switchToken = 0;
  let initialized = false;

  const collectTargets = () => {
    const root = detailSwapRef.value;

    if (!root) {
      return null;
    }

    return {
      root,
      headItems: [...root.querySelectorAll(".project-detail-head > *")],
      description: root.querySelector(".project-description"),
      signalCards: [...root.querySelectorAll(".signal-card-project")],
      stackChips: [...root.querySelectorAll(".stack-row .tag-chip")],
      detailLines: [...root.querySelectorAll(".detail-list p")]
    };
  };

  const setSettledState = () => {
    const targets = collectTargets();

    if (!targets) {
      return;
    }

    gsap.set(targets.root, {
      autoAlpha: 1,
      x: 0,
      filter: "blur(0px)"
    });

    gsap.set(
      [
        ...targets.headItems,
        targets.description,
        ...targets.signalCards,
        ...targets.stackChips,
        ...targets.detailLines
      ].filter(Boolean),
      {
        autoAlpha: 1,
        x: 0,
        y: 0,
        scale: 1,
        filter: "blur(0px)"
      }
    );
  };

  // 右侧详情切换采用“先轻推离场，再从右侧抽屉式入场”的节奏。
  const animateIn = () => {
    const targets = collectTargets();

    if (!targets) {
      return;
    }

    panelTimeline?.kill();

    gsap.set(targets.root, {
      autoAlpha: 0,
      x: 28,
      filter: "blur(12px)"
    });

    gsap.set(targets.headItems, {
      autoAlpha: 0,
      y: 16
    });

    gsap.set(targets.description, {
      autoAlpha: 0,
      y: 14
    });

    gsap.set(targets.signalCards, {
      autoAlpha: 0,
      y: 18,
      scale: 0.985,
      filter: "blur(8px)"
    });

    gsap.set(targets.stackChips, {
      autoAlpha: 0,
      y: 14
    });

    gsap.set(targets.detailLines, {
      autoAlpha: 0,
      x: 14
    });

    panelTimeline = gsap.timeline({
      defaults: {
        overwrite: "auto",
        ease: "power3.out"
      }
    });

    panelTimeline
      .to(targets.root, {
        autoAlpha: 1,
        x: 0,
        filter: "blur(0px)",
        duration: 0.48
      })
      .to(targets.headItems, {
        autoAlpha: 1,
        y: 0,
        duration: 0.34,
        stagger: 0.06
      }, 0.08)
      .to(targets.description, {
        autoAlpha: 1,
        y: 0,
        duration: 0.3
      }, 0.12)
      .to(targets.signalCards, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.34,
        stagger: 0.08
      }, 0.16)
      .to(targets.stackChips, {
        autoAlpha: 1,
        y: 0,
        duration: 0.24,
        stagger: 0.04
      }, 0.24)
      .to(targets.detailLines, {
        autoAlpha: 1,
        x: 0,
        duration: 0.28,
        stagger: 0.06
      }, 0.28);
  };

  const switchProject = async (nextProject) => {
    const currentTargets = collectTargets();
    const currentToken = ++switchToken;

    if (!initialized || !currentTargets || !displayedProject.value) {
      displayedProject.value = nextProject;
      await nextTick();
      setSettledState();
      initialized = true;
      return;
    }

    panelTimeline?.kill();

    panelTimeline = gsap.timeline({
      defaults: {
        overwrite: "auto",
        ease: "power2.inOut"
      },
      onComplete: async () => {
        if (currentToken !== switchToken) {
          return;
        }

        displayedProject.value = nextProject;
        await nextTick();

        if (currentToken !== switchToken) {
          return;
        }

        animateIn();
      }
    });

    panelTimeline.to(currentTargets.root, {
      autoAlpha: 0,
      x: -22,
      filter: "blur(10px)",
      duration: 0.22
    });
  };

  onMounted(() => {
    setSettledState();
    initialized = true;
  });

  onBeforeUnmount(() => {
    panelTimeline?.kill();
  });

  return {
    detailSwapRef,
    switchProject
  };
}
