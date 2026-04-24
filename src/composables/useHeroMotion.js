import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { gsap } from "gsap";
import { useMotionPreference } from "./useMotionPreference";

const FRAME_PADDING = 16;
const MIN_SPEED = 16;
const MAX_SPEED = 26;
const DRIFT_INTERVAL = 2600;
const DISC_PARALLAX_X = 18;
const DISC_PARALLAX_Y = 14;
const GLOW_ONE_SHIFT = 14;
const GLOW_TWO_SHIFT = 18;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const randomRange = (min, max) => min + Math.random() * (max - min);

const createRandomVelocity = () => {
  const speed = randomRange(MIN_SPEED, MAX_SPEED);
  return Math.random() > 0.5 ? speed : -speed;
};

const clampVelocity = (value) => {
  const direction = value >= 0 ? 1 : -1;
  return direction * clamp(Math.abs(value), MIN_SPEED, MAX_SPEED);
};

export function useHeroMotion() {
  const { isMotionLite } = useMotionPreference();

  const heroSectionRef = ref(null);
  const portraitCardRef = ref(null);
  const portraitDiscFrameRef = ref(null);
  const portraitDiscRef = ref(null);
  const portraitGlowOneRef = ref(null);
  const portraitGlowTwoRef = ref(null);
  const floatingPillRef = ref(null);
  const primaryCtaRef = ref(null);
  const secondaryCtaRef = ref(null);

  const bounds = {
    maxX: 0,
    maxY: 0
  };

  const position = {
    x: 0,
    y: 0
  };

  let velocityX = createRandomVelocity();
  let velocityY = createRandomVelocity();
  let targetVelocityX = velocityX;
  let targetVelocityY = velocityY;
  let resizeObserver = null;
  let driftTimerId = 0;
  let loadingObserver = null;
  let removeResizeFallback = null;
  let introTimeline = null;
  let introPlayed = false;
  let animationFrameId = 0;
  let lastFrameTime = 0;
  let removeCardEvents = null;
  let removeTitleEvents = null;
  let stopMotionWatch = null;
  const magneticCleanups = [];

  const setDiscPosition = () => {
    const discFrame = portraitDiscFrameRef.value;

    if (!discFrame) {
      return;
    }

    discFrame.style.setProperty("--hero-disc-base-x", `${position.x}px`);
    discFrame.style.setProperty("--hero-disc-base-y", `${position.y}px`);
  };

  // 读取卡片和圆球尺寸，把漂移范围限制在边框内部。
  const measureBounds = () => {
    const card = portraitCardRef.value;
    const discFrame = portraitDiscFrameRef.value;

    if (!card || !discFrame) {
      return;
    }

    bounds.maxX = Math.max(0, card.clientWidth - discFrame.offsetWidth - FRAME_PADDING * 2);
    bounds.maxY = Math.max(0, card.clientHeight - discFrame.offsetHeight - FRAME_PADDING * 2);

    if (!introPlayed && position.x === 0 && position.y === 0) {
      position.x = clamp(bounds.maxX * randomRange(0.36, 0.76), 0, bounds.maxX);
      position.y = clamp(bounds.maxY * randomRange(0.08, 0.32), 0, bounds.maxY);
    } else {
      position.x = clamp(position.x, 0, bounds.maxX);
      position.y = clamp(position.y, 0, bounds.maxY);
    }

    lastFrameTime = 0;
    setDiscPosition();
  };

  // 定期轻推一下目标速度，让圆球在反弹之外也保留一点随机惯性。
  const nudgeVelocity = () => {
    targetVelocityX = clampVelocity(targetVelocityX + randomRange(-3.4, 3.4));
    targetVelocityY = clampVelocity(targetVelocityY + randomRange(-3.4, 3.4));
  };

  const stepDisc = (timestamp) => {
    if (isMotionLite.value) {
      animationFrameId = 0;
      return;
    }

    if (!portraitDiscFrameRef.value) {
      animationFrameId = window.requestAnimationFrame(stepDisc);
      return;
    }

    if (!lastFrameTime) {
      lastFrameTime = timestamp;
    }

    const dt = Math.min((timestamp - lastFrameTime) / 1000, 0.032);
    lastFrameTime = timestamp;

    velocityX += (targetVelocityX - velocityX) * 0.08;
    velocityY += (targetVelocityY - velocityY) * 0.08;

    let nextX = position.x + velocityX * dt;
    let nextY = position.y + velocityY * dt;

    if (nextX <= 0 || nextX >= bounds.maxX) {
      nextX = clamp(nextX, 0, bounds.maxX);
      targetVelocityX = -targetVelocityX * randomRange(0.96, 1.04);
      velocityX = -velocityX * 0.96;
      targetVelocityY = clampVelocity(targetVelocityY + randomRange(-2.8, 2.8));
    }

    if (nextY <= 0 || nextY >= bounds.maxY) {
      nextY = clamp(nextY, 0, bounds.maxY);
      targetVelocityY = -targetVelocityY * randomRange(0.96, 1.04);
      velocityY = -velocityY * 0.96;
      targetVelocityX = clampVelocity(targetVelocityX + randomRange(-2.8, 2.8));
    }

    position.x = nextX;
    position.y = nextY;
    setDiscPosition();

    animationFrameId = window.requestAnimationFrame(stepDisc);
  };

  const startDiscMotion = () => {
    if (animationFrameId || isMotionLite.value) {
      return;
    }

    lastFrameTime = 0;
    animationFrameId = window.requestAnimationFrame(stepDisc);

    if (!driftTimerId) {
      driftTimerId = window.setInterval(nudgeVelocity, DRIFT_INTERVAL);
    }
  };

  const stopDiscMotion = () => {
    if (animationFrameId) {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = 0;
    }

    if (driftTimerId) {
      window.clearInterval(driftTimerId);
      driftTimerId = 0;
    }
  };

  const collectIntroTargets = () => {
    const root = heroSectionRef.value;

    if (!root) {
      return null;
    }

    return {
      kicker: root.querySelector(".section-kicker"),
      eyebrow: root.querySelector(".hero-eyebrow"),
      lines: [...root.querySelectorAll(".hero-line")],
      chars: [...root.querySelectorAll(".hero-char")],
      subtitle: root.querySelector(".hero-subtitle"),
      buttons: [...root.querySelectorAll(".hero-actions .button")],
      stats: [...root.querySelectorAll(".hero-stats .stat-card")],
      portraitCard: root.querySelector(".portrait-card"),
      portraitPlate: root.querySelector(".portrait-plate"),
      sidecard: root.querySelector(".hero-sidecard")
    };
  };

  // 先把首屏文案和卡片放到统一的入场起点，后面由 GSAP 时间线接管。
  const prepareIntroState = () => {
    const root = heroSectionRef.value;
    const targets = collectIntroTargets();

    if (!root || !targets) {
      return;
    }

    root.classList.add("hero-gsap");

    gsap.set([targets.kicker, targets.eyebrow], {
      autoAlpha: 0,
      y: 26,
      filter: "blur(12px)"
    });

    gsap.set(targets.lines, {
      autoAlpha: 1,
      y: 0,
      rotateX: 0
    });

    gsap.set(targets.chars, {
      autoAlpha: 0,
      yPercent: 112,
      rotateX: -72,
      rotateZ: 3,
      filter: "blur(10px)",
      transformOrigin: "50% 100%"
    });

    gsap.set(targets.subtitle, {
      autoAlpha: 0,
      y: 22,
      filter: "blur(10px)"
    });

    gsap.set(targets.buttons, {
      autoAlpha: 0,
      y: 18,
      scale: 0.96
    });

    gsap.set(targets.stats, {
      autoAlpha: 0,
      y: 22
    });

    gsap.set([targets.portraitCard, targets.sidecard], {
      autoAlpha: 0,
      y: 26,
      scale: 0.985
    });

    gsap.set([targets.portraitPlate, floatingPillRef.value], {
      autoAlpha: 0,
      y: 18,
      scale: 0.94
    });

    gsap.set([portraitGlowOneRef.value, portraitGlowTwoRef.value], {
      autoAlpha: 0,
      scale: 0.86
    });

    // 小球本身依赖 CSS 变量控制位移，所以这里不用 GSAP 直接改 transform。
    gsap.set(portraitDiscRef.value, {
      autoAlpha: 0,
      scale: 0.86,
      x: 0,
      y: 0
    });
  };

  const playIntro = () => {
    if (introPlayed) {
      return;
    }

    const targets = collectIntroTargets();

    if (!targets) {
      return;
    }

    introPlayed = true;

    introTimeline?.kill();
    introTimeline = gsap.timeline({
      defaults: {
        ease: "power3.out"
      }
    });

    introTimeline
      .to([targets.kicker, targets.eyebrow], {
        autoAlpha: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.58,
        stagger: 0.08
      })
      .to(targets.chars, {
        autoAlpha: 1,
        yPercent: 0,
        rotateX: 0,
        rotateZ: 0,
        filter: "blur(0px)",
        duration: 0.72,
        stagger: {
          each: 0.018,
          from: "start"
        }
      }, "-=0.28")
      .to(targets.subtitle, {
        autoAlpha: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.56
      }, "-=0.44")
      .to(targets.buttons, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.46,
        stagger: 0.08
      }, "-=0.34")
      .to(targets.stats, {
        autoAlpha: 1,
        y: 0,
        duration: 0.42,
        stagger: 0.06
      }, "-=0.26")
      .to([targets.portraitCard, targets.sidecard], {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        stagger: 0.08
      }, "-=0.78")
      .to([portraitGlowOneRef.value, portraitGlowTwoRef.value], {
        autoAlpha: 1,
        scale: 1,
        duration: 0.58,
        stagger: 0.06
      }, "-=0.52")
      .to(portraitDiscRef.value, {
        autoAlpha: 1,
        scale: 1,
        duration: 0.58,
        ease: "power3.out"
      }, "<")
      .to([targets.portraitPlate, floatingPillRef.value], {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.42,
        stagger: 0.06
      }, "-=0.42");
  };

  const waitForLoadingToFinish = () => {
    const loadingScreen = document.querySelector(".loading-screen");

    if (!loadingScreen || loadingScreen.classList.contains("is-hidden")) {
      window.requestAnimationFrame(playIntro);
      return;
    }

    loadingObserver = new MutationObserver(() => {
      if (loadingScreen.classList.contains("is-hidden")) {
        loadingObserver?.disconnect();
        loadingObserver = null;
        window.requestAnimationFrame(playIntro);
      }
    });

    loadingObserver.observe(loadingScreen, {
      attributes: true,
      attributeFilter: ["class"]
    });
  };

  const setupPortraitParallax = () => {
    if (!window.matchMedia("(pointer: fine)").matches || !portraitCardRef.value) {
      return;
    }

    const discParallaxXTo = gsap.quickTo(portraitDiscRef.value, "x", {
      duration: 0.8,
      ease: "power3.out"
    });
    const discParallaxYTo = gsap.quickTo(portraitDiscRef.value, "y", {
      duration: 0.8,
      ease: "power3.out"
    });
    const glowOneXTo = gsap.quickTo(portraitGlowOneRef.value, "x", {
      duration: 0.9,
      ease: "power3.out"
    });
    const glowOneYTo = gsap.quickTo(portraitGlowOneRef.value, "y", {
      duration: 0.9,
      ease: "power3.out"
    });
    const glowTwoXTo = gsap.quickTo(portraitGlowTwoRef.value, "x", {
      duration: 1,
      ease: "power3.out"
    });
    const glowTwoYTo = gsap.quickTo(portraitGlowTwoRef.value, "y", {
      duration: 1,
      ease: "power3.out"
    });
    const pillXTo = gsap.quickTo(floatingPillRef.value, "x", {
      duration: 0.72,
      ease: "power3.out"
    });
    const pillYTo = gsap.quickTo(floatingPillRef.value, "y", {
      duration: 0.72,
      ease: "power3.out"
    });

    const handleMove = (event) => {
      const rect = portraitCardRef.value.getBoundingClientRect();
      const ratioX = (event.clientX - rect.left) / rect.width - 0.5;
      const ratioY = (event.clientY - rect.top) / rect.height - 0.5;

      discParallaxXTo(ratioX * DISC_PARALLAX_X);
      discParallaxYTo(ratioY * DISC_PARALLAX_Y);
      glowOneXTo(ratioX * -GLOW_ONE_SHIFT);
      glowOneYTo(ratioY * -GLOW_ONE_SHIFT);
      glowTwoXTo(ratioX * GLOW_TWO_SHIFT);
      glowTwoYTo(ratioY * GLOW_TWO_SHIFT);
      pillXTo(ratioX * 10);
      pillYTo(ratioY * 8);
    };

    const handleLeave = () => {
      discParallaxXTo(0);
      discParallaxYTo(0);
      glowOneXTo(0);
      glowOneYTo(0);
      glowTwoXTo(0);
      glowTwoYTo(0);
      pillXTo(0);
      pillYTo(0);
    };

    portraitCardRef.value.addEventListener("pointermove", handleMove);
    portraitCardRef.value.addEventListener("pointerleave", handleLeave);

    removeCardEvents = () => {
      portraitCardRef.value?.removeEventListener("pointermove", handleMove);
      portraitCardRef.value?.removeEventListener("pointerleave", handleLeave);
    };
  };

  const setupTitleInteraction = () => {
    const root = heroSectionRef.value;
    const title = root?.querySelector(".hero-title");

    if (!title || !window.matchMedia("(pointer: fine)").matches) {
      return;
    }

    const chars = [...title.querySelectorAll(".hero-char")];

    const handleEnter = (event) => {
      const char = event.currentTarget;

      gsap.killTweensOf(char);
      gsap
        .timeline()
        .to(char, {
          y: -10,
          scale: 1.04,
          rotateZ: randomRange(-4, 4),
          duration: 0.18,
          ease: "power2.out"
        })
        .to(char, {
          y: 0,
          scale: 1,
          rotateZ: 0,
          duration: 0.72,
          ease: "elastic.out(1, 0.48)"
        });
    };

    chars.forEach((char) => {
      char.addEventListener("pointerenter", handleEnter);
    });

    removeTitleEvents = () => {
      chars.forEach((char) => {
        char.removeEventListener("pointerenter", handleEnter);
      });
    };
  };

  // 给 CTA 加一点磁吸和光斑跟随，保留克制但可感知的 hover 反馈。
  const attachMagneticCta = (buttonRef) => {
    const button = buttonRef.value;

    if (!button || !window.matchMedia("(pointer: fine)").matches) {
      return;
    }

    const spotlight = button.querySelector(".hero-cta-spotlight");
    const moveX = gsap.quickTo(button, "x", {
      duration: 0.32,
      ease: "power3.out"
    });
    const moveY = gsap.quickTo(button, "y", {
      duration: 0.32,
      ease: "power3.out"
    });
    const spotX = spotlight
      ? gsap.quickTo(spotlight, "x", { duration: 0.26, ease: "power3.out" })
      : null;
    const spotY = spotlight
      ? gsap.quickTo(spotlight, "y", { duration: 0.26, ease: "power3.out" })
      : null;

    const handleEnter = () => {
      gsap.to(button, {
        scale: 1.018,
        duration: 0.24,
        ease: "power2.out"
      });

      if (spotlight) {
        gsap.to(spotlight, {
          autoAlpha: 0.9,
          scale: 1,
          duration: 0.24,
          ease: "power2.out"
        });
      }
    };

    const handleMove = (event) => {
      const rect = button.getBoundingClientRect();
      const offsetX = event.clientX - rect.left - rect.width / 2;
      const offsetY = event.clientY - rect.top - rect.height / 2;

      moveX(offsetX * 0.16);
      moveY(offsetY * 0.18);

      if (spotlight && spotX && spotY) {
        spotX(offsetX * 0.9);
        spotY(offsetY * 0.9);
      }
    };

    const handleLeave = () => {
      moveX(0);
      moveY(0);
      gsap.to(button, {
        scale: 1,
        duration: 0.24,
        ease: "power2.out"
      });

      if (spotlight) {
        if (spotX) {
          spotX(0);
        }
        if (spotY) {
          spotY(0);
        }

        gsap.to(spotlight, {
          autoAlpha: 0,
          scale: 0.72,
          duration: 0.24,
          ease: "power2.out"
        });
      }
    };

    button.addEventListener("pointerenter", handleEnter);
    button.addEventListener("pointermove", handleMove);
    button.addEventListener("pointerleave", handleLeave);

    magneticCleanups.push(() => {
      button.removeEventListener("pointerenter", handleEnter);
      button.removeEventListener("pointermove", handleMove);
      button.removeEventListener("pointerleave", handleLeave);
    });
  };

  onMounted(() => {
    prepareIntroState();
    waitForLoadingToFinish();
    measureBounds();
    setupPortraitParallax();
    setupTitleInteraction();
    attachMagneticCta(primaryCtaRef);
    attachMagneticCta(secondaryCtaRef);

    // 弱动效模式下暂停首页圆球的持续漂移，减少常驻 requestAnimationFrame。
    stopMotionWatch = watch(
      isMotionLite,
      (liteMode) => {
        if (liteMode) {
          stopDiscMotion();
          return;
        }

        startDiscMotion();
      },
      { immediate: true }
    );

    if ("ResizeObserver" in window) {
      resizeObserver = new window.ResizeObserver(() => {
        measureBounds();
      });

      if (portraitCardRef.value) {
        resizeObserver.observe(portraitCardRef.value);
      }

      if (portraitDiscFrameRef.value) {
        resizeObserver.observe(portraitDiscFrameRef.value);
      }
    } else {
      const handleResize = () => {
        measureBounds();
      };

      window.addEventListener("resize", handleResize, { passive: true });
      removeResizeFallback = () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  });

  onBeforeUnmount(() => {
    introTimeline?.kill();
    loadingObserver?.disconnect();
    resizeObserver?.disconnect();
    removeResizeFallback?.();
    removeCardEvents?.();
    removeTitleEvents?.();
    stopMotionWatch?.();
    stopDiscMotion();

    magneticCleanups.forEach((cleanup) => {
      cleanup();
    });

    gsap.killTweensOf([
      portraitDiscRef.value,
      portraitDiscFrameRef.value,
      portraitGlowOneRef.value,
      portraitGlowTwoRef.value,
      floatingPillRef.value,
      primaryCtaRef.value,
      secondaryCtaRef.value,
      ...(heroSectionRef.value?.querySelectorAll(".hero-char") ?? [])
    ]);
  });

  return {
    heroSectionRef,
    portraitCardRef,
    portraitDiscFrameRef,
    portraitDiscRef,
    portraitGlowOneRef,
    portraitGlowTwoRef,
    floatingPillRef,
    primaryCtaRef,
    secondaryCtaRef
  };
}
