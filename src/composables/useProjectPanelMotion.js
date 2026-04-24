import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { gsap } from "gsap";

export function useProjectPanelMotion(displayedProject) {
  const detailPanelRef = ref(null);
  const detailSwapRef = ref(null);

  let panelTimeline = null;
  let showcaseTimeline = null;
  let showcaseGhost = null;
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
      scale: 1,
      clipPath: "inset(0% 0% 0% 0% round 0px)",
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

  const clearShowcaseGhost = () => {
    showcaseTimeline?.kill();
    showcaseTimeline = null;

    if (showcaseGhost) {
      showcaseGhost.remove();
      showcaseGhost = null;
    }
  };

  // 从左侧项目标签复制一个临时图层，飞向右侧详情卡，模拟 GSAP 官网常见的 showcase 过渡感。
  const playShowcaseGhost = (sourceElement) => {
    const panel = detailPanelRef.value;

    if (!sourceElement || !panel || !window.matchMedia("(pointer: fine)").matches) {
      return;
    }

    const sourceRect = sourceElement.getBoundingClientRect();
    const targetRect = panel.getBoundingClientRect();
    const title = sourceElement.querySelector("strong")?.textContent?.trim() ?? "";
    const index = sourceElement.querySelector(".project-index")?.textContent?.trim() ?? "";

    clearShowcaseGhost();

    showcaseGhost = document.createElement("div");
    showcaseGhost.className = "project-showcase-ghost";

    const ghostIndex = document.createElement("span");
    ghostIndex.textContent = index;

    const ghostTitle = document.createElement("strong");
    ghostTitle.textContent = title;

    showcaseGhost.append(ghostIndex, ghostTitle);
    document.body.appendChild(showcaseGhost);

    gsap.set(showcaseGhost, {
      position: "fixed",
      zIndex: 80,
      left: sourceRect.left,
      top: sourceRect.top,
      width: sourceRect.width,
      minHeight: sourceRect.height,
      pointerEvents: "none",
      transformOrigin: "50% 50%"
    });

    showcaseTimeline = gsap
      .timeline({
        defaults: {
          ease: "power3.inOut",
          overwrite: "auto"
        },
        onComplete: clearShowcaseGhost
      })
      .to(showcaseGhost, {
        left: targetRect.left,
        top: targetRect.top,
        width: targetRect.width,
        minHeight: Math.min(targetRect.height, 220),
        borderRadius: 24,
        autoAlpha: 0.42,
        scale: 0.985,
        duration: 0.48
      })
      .to(showcaseGhost, {
        autoAlpha: 0,
        scale: 1.02,
        filter: "blur(12px)",
        duration: 0.22,
        ease: "power2.out"
      }, "-=0.16");
  };

  // 右侧详情像抽屉一样从右侧轻推进入，内部信息再按阅读顺序依次亮起。
  const animateIn = () => {
    const targets = collectTargets();

    if (!targets) {
      return;
    }

    panelTimeline?.kill();

    gsap.set(targets.root, {
      autoAlpha: 0,
      x: 34,
      scale: 0.992,
      clipPath: "inset(0% 0% 0% 18% round 24px)",
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
        scale: 1,
        clipPath: "inset(0% 0% 0% 0% round 0px)",
        filter: "blur(0px)",
        duration: 0.56
      })
      .to(targets.headItems, {
        autoAlpha: 1,
        y: 0,
        duration: 0.34,
        stagger: 0.06
      }, 0.1)
      .to(targets.description, {
        autoAlpha: 1,
        y: 0,
        duration: 0.3
      }, 0.14)
      .to(targets.signalCards, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.36,
        stagger: 0.09
      }, 0.2)
      .to(targets.stackChips, {
        autoAlpha: 1,
        y: 0,
        duration: 0.24,
        stagger: 0.04
      }, 0.3)
      .to(targets.detailLines, {
        autoAlpha: 1,
        x: 0,
        duration: 0.28,
        stagger: 0.06
      }, 0.34);
  };

  const switchProject = async (nextProject, sourceElement = null) => {
    const currentTargets = collectTargets();
    const currentToken = ++switchToken;

    if (!initialized || !currentTargets || !displayedProject.value) {
      displayedProject.value = nextProject;
      await nextTick();
      setSettledState();
      initialized = true;
      return;
    }

    playShowcaseGhost(sourceElement);
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
      x: -24,
      scale: 0.988,
      clipPath: "inset(0% 14% 0% 0% round 22px)",
      filter: "blur(10px)",
      duration: 0.24
    });
  };

  onMounted(() => {
    setSettledState();
    initialized = true;
  });

  onBeforeUnmount(() => {
    panelTimeline?.kill();
    clearShowcaseGhost();
  });

  return {
    detailPanelRef,
    detailSwapRef,
    switchProject
  };
}
