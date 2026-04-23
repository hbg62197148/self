<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { gsap } from "gsap";

const props = defineProps({
  mood: {
    type: String,
    default: "confused"
  },
  inputFocused: {
    type: Boolean,
    default: false
  },
  answerLength: {
    type: Number,
    default: 0
  }
});

const mascotRootRef = ref(null);
const characterRef = ref(null);
const headGroupRef = ref(null);
const leftEarRef = ref(null);
const rightEarRef = ref(null);
const leftEyeRef = ref(null);
const rightEyeRef = ref(null);
const leftEyeDotRef = ref(null);
const rightEyeDotRef = ref(null);
const leftHappyEyeRef = ref(null);
const rightHappyEyeRef = ref(null);
const leftBrowRef = ref(null);
const rightBrowRef = ref(null);
const mouthConfusedRef = ref(null);
const mouthSuccessRef = ref(null);
const mouthWrongRef = ref(null);
const thoughtConfusedRef = ref(null);
const thoughtSuccessRef = ref(null);
const thoughtWrongRef = ref(null);
const sweatRef = ref(null);
const shadowRef = ref(null);

let blinkTimeline = null;
let reactionTimeline = null;

const moodCopy = computed(() => {
  if (props.mood === "success") {
    return {
      title: "答对了",
      subtitle: "这次判断很稳，继续吧。"
    };
  }

  if (props.mood === "wrong") {
    return {
      title: "做错事了",
      subtitle: "它有点心虚，想让你再认真算一次。"
    };
  }

  return {
    title: "有点疑惑",
    subtitle: "它正在等你把答案想清楚。"
  };
});

const stopBlinking = () => {
  blinkTimeline?.kill();
  blinkTimeline = null;
};

const startBlinking = () => {
  stopBlinking();

  blinkTimeline = gsap.timeline({
    repeat: -1,
    repeatDelay: 3.6
  });

  blinkTimeline
    .to([leftEyeDotRef.value, rightEyeDotRef.value], {
      scaleY: 0.18,
      duration: 0.08,
      transformOrigin: "center center",
      ease: "power1.inOut"
    })
    .to([leftEyeDotRef.value, rightEyeDotRef.value], {
      scaleY: 1,
      duration: 0.12,
      ease: "power1.inOut"
    });
};

// 把默认圆眼和成功态弯眼分开控制，避免同一组元素在多种状态里叠加位移。
const setEyeVisibility = ({ dots = 1, happy = 0, duration = 0.16 } = {}) => {
  gsap.to([leftEyeDotRef.value, rightEyeDotRef.value], {
    opacity: dots,
    duration,
    overwrite: "auto"
  });

  gsap.to([leftHappyEyeRef.value, rightHappyEyeRef.value], {
    opacity: happy,
    duration,
    overwrite: "auto"
  });
};

// 统一控制三种嘴型、提示气泡和汗滴的显隐，方便让 GSAP 时间线只关心动作本身。
const setExpressionVisibility = ({
  confused = 0,
  success = 0,
  wrong = 0,
  confusedThought = 0,
  successThought = 0,
  wrongThought = 0,
  sweat = 0
}) => {
  gsap.to(mouthConfusedRef.value, { opacity: confused, duration: 0.18, overwrite: "auto" });
  gsap.to(mouthSuccessRef.value, { opacity: success, duration: 0.18, overwrite: "auto" });
  gsap.to(mouthWrongRef.value, { opacity: wrong, duration: 0.18, overwrite: "auto" });

  gsap.to(thoughtConfusedRef.value, {
    opacity: confusedThought,
    scale: confusedThought ? 1 : 0.82,
    y: confusedThought ? 0 : 6,
    duration: 0.28,
    ease: "power2.out",
    overwrite: "auto"
  });

  gsap.to(thoughtSuccessRef.value, {
    opacity: successThought,
    scale: successThought ? 1 : 0.72,
    duration: 0.24,
    ease: "back.out(1.5)",
    overwrite: "auto"
  });

  gsap.to(thoughtWrongRef.value, {
    opacity: wrongThought,
    scale: wrongThought ? 1 : 0.82,
    duration: 0.24,
    ease: "power2.out",
    overwrite: "auto"
  });

  gsap.to(sweatRef.value, {
    opacity: sweat,
    y: sweat ? 0 : -6,
    duration: 0.22,
    ease: "power2.out",
    overwrite: "auto"
  });
};

// 默认思考态会跟着输入框聚焦和输入长度微调眼神与头部角度。
const applyConfusedPose = ({ immediate = false } = {}) => {
  const duration = immediate ? 0 : 0.34;
  const lookX = props.inputFocused ? Math.min(4 + props.answerLength * 1.5, 10) : 0;
  const lookY = props.inputFocused ? -1.2 : 0;
  const headX = props.inputFocused ? 6 : 0;
  const headY = props.inputFocused ? -2 : 0;
  const headRotate = props.inputFocused ? 4 + Math.min(props.answerLength, 5) * 0.8 : 0;

  setExpressionVisibility({
    confused: 1,
    confusedThought: 1,
    success: 0,
    wrong: 0,
    successThought: 0,
    wrongThought: 0,
    sweat: 0
  });
  setEyeVisibility({ dots: 1, happy: 0 });

  gsap.to(characterRef.value, {
    x: 0,
    y: 0,
    rotation: 0,
    duration,
    ease: "power2.out",
    overwrite: "auto"
  });

  gsap.to(headGroupRef.value, {
    x: headX,
    y: headY,
    rotation: headRotate,
    duration,
    ease: "power2.out",
    overwrite: "auto"
  });

  gsap.to(leftEyeRef.value, {
    x: lookX * 0.7,
    y: lookY,
    duration,
    ease: "power2.out",
    overwrite: "auto"
  });

  gsap.to(rightEyeRef.value, {
    x: lookX,
    y: lookY,
    duration,
    ease: "power2.out",
    overwrite: "auto"
  });

  gsap.to([leftEyeDotRef.value, rightEyeDotRef.value], {
    scaleY: 1,
    duration: 0.2,
    ease: "power2.out",
    overwrite: "auto"
  });

  gsap.to(leftBrowRef.value, {
    y: props.inputFocused ? -1.6 : 0,
    rotation: props.inputFocused ? -12 : -6,
    duration,
    ease: "power2.out",
    overwrite: "auto"
  });

  gsap.to(rightBrowRef.value, {
    y: props.inputFocused ? -2 : 0,
    rotation: props.inputFocused ? 12 : 6,
    duration,
    ease: "power2.out",
    overwrite: "auto"
  });

  gsap.to(leftEarRef.value, {
    rotation: props.inputFocused ? -8 : -2,
    y: props.inputFocused ? -1 : 0,
    duration,
    ease: "power2.out",
    overwrite: "auto"
  });

  gsap.to(rightEarRef.value, {
    rotation: props.inputFocused ? 8 : 2,
    y: props.inputFocused ? -1 : 0,
    duration,
    ease: "power2.out",
    overwrite: "auto"
  });

  gsap.to(shadowRef.value, {
    scaleX: props.inputFocused ? 0.96 : 1,
    duration,
    ease: "power2.out",
    overwrite: "auto"
  });
};

// 输入变化时补一个很轻的点头和耳朵抖动，让角色像在“跟着算”。
const playTypingBeat = () => {
  reactionTimeline?.kill();

  reactionTimeline = gsap.timeline({
    defaults: {
      overwrite: "auto"
    }
  });

  reactionTimeline
    .to(characterRef.value, {
      y: -3,
      duration: 0.12,
      ease: "power2.out"
    }, 0)
    .to(shadowRef.value, {
      scaleX: 0.92,
      duration: 0.12,
      ease: "power2.out"
    }, 0)
    .to([leftEarRef.value, rightEarRef.value], {
      y: -2,
      duration: 0.12,
      ease: "power2.out"
    }, 0)
    .to(characterRef.value, {
      y: 0,
      duration: 0.22,
      ease: "power2.inOut"
    })
    .to(shadowRef.value, {
      scaleX: props.inputFocused ? 0.96 : 1,
      duration: 0.22,
      ease: "power2.inOut"
    }, "<")
    .to([leftEarRef.value, rightEarRef.value], {
      y: 0,
      duration: 0.22,
      ease: "power2.inOut"
    }, "<");
};

const playSuccessReaction = () => {
  stopBlinking();
  reactionTimeline?.kill();

  setEyeVisibility({ dots: 0, happy: 1 });

  setExpressionVisibility({
    confused: 0,
    confusedThought: 0,
    success: 1,
    successThought: 1,
    wrong: 0,
    wrongThought: 0,
    sweat: 0
  });

  reactionTimeline = gsap.timeline({
    defaults: {
      overwrite: "auto"
    }
  });

  reactionTimeline
    .to([leftEyeRef.value, rightEyeRef.value], {
      x: 0,
      y: 0,
      duration: 0.18,
      ease: "power2.out"
    }, 0)
    .to(characterRef.value, {
      y: -8,
      rotation: -2,
      duration: 0.2,
      ease: "power2.out"
    }, 0)
    .to(headGroupRef.value, {
      x: 3,
      y: -6,
      rotation: -8,
      duration: 0.2,
      ease: "power2.out"
    }, 0)
    .to([leftHappyEyeRef.value, rightHappyEyeRef.value], {
      y: 0,
      scale: 1,
      duration: 0.22,
      ease: "back.out(1.8)"
    }, 0.02)
    .to([leftBrowRef.value, rightBrowRef.value], {
      y: -3,
      rotation: 0,
      duration: 0.18,
      ease: "power2.out"
    }, 0)
    .to(shadowRef.value, {
      scaleX: 0.9,
      duration: 0.2,
      ease: "power2.out"
    }, 0)
    .to(characterRef.value, {
      y: 0,
      rotation: 0,
      duration: 0.44,
      ease: "elastic.out(1, 0.55)"
    })
    .to(headGroupRef.value, {
      x: 0,
      y: 0,
      rotation: 0,
      duration: 0.44,
      ease: "elastic.out(1, 0.55)"
    }, "<")
    .to(shadowRef.value, {
      scaleX: 1,
      duration: 0.44,
      ease: "power2.out"
    }, "<");
};

const playWrongReaction = () => {
  stopBlinking();
  reactionTimeline?.kill();

  setEyeVisibility({ dots: 1, happy: 0 });

  setExpressionVisibility({
    confused: 0,
    confusedThought: 0,
    success: 0,
    successThought: 0,
    wrong: 1,
    wrongThought: 1,
    sweat: 1
  });

  reactionTimeline = gsap.timeline({
    defaults: {
      overwrite: "auto"
    }
  });

  reactionTimeline
    .to(headGroupRef.value, {
      x: -2,
      y: 4,
      rotation: 6,
      duration: 0.14,
      ease: "power2.out"
    }, 0)
    .to([leftEyeDotRef.value, rightEyeDotRef.value], {
      y: 2,
      scaleY: 0.76,
      duration: 0.16,
      ease: "power2.out"
    }, 0)
    .to([leftBrowRef.value, rightBrowRef.value], {
      y: 2,
      rotation: 0,
      duration: 0.16,
      ease: "power2.out"
    }, 0)
    .to(characterRef.value, {
      x: 4,
      duration: 0.08,
      ease: "power1.inOut",
      repeat: 3,
      yoyo: true
    }, 0)
    .to(shadowRef.value, {
      scaleX: 0.94,
      duration: 0.16,
      ease: "power2.out"
    }, 0)
    .to(characterRef.value, {
      x: 0,
      duration: 0.24,
      ease: "power2.out"
    })
    .to(headGroupRef.value, {
      x: 0,
      y: 0,
      rotation: 0,
      duration: 0.26,
      ease: "power2.out"
    }, "<")
    .to([leftEyeDotRef.value, rightEyeDotRef.value], {
      y: 0,
      scaleY: 1,
      duration: 0.22,
      ease: "power2.out"
    }, "<")
    .to(shadowRef.value, {
      scaleX: 1,
      duration: 0.22,
      ease: "power2.out"
    }, "<");
};

const syncMoodAnimation = (mood, immediate = false) => {
  if (mood === "success") {
    playSuccessReaction();
    return;
  }

  if (mood === "wrong") {
    playWrongReaction();
    return;
  }

  if (!immediate) {
    startBlinking();
  }

  applyConfusedPose({ immediate });
};

onMounted(() => {
  gsap.set([mouthConfusedRef.value, mouthSuccessRef.value, mouthWrongRef.value], { opacity: 0 });
  gsap.set([thoughtConfusedRef.value, thoughtSuccessRef.value, thoughtWrongRef.value], {
    opacity: 0,
    scale: 0.82,
    transformOrigin: "center center"
  });
  gsap.set(sweatRef.value, { opacity: 0, y: -6 });
  gsap.set([leftEyeRef.value, rightEyeRef.value], { x: 0, y: 0 });
  gsap.set([leftEyeDotRef.value, rightEyeDotRef.value], {
    opacity: 1,
    scaleY: 1,
    transformOrigin: "center center"
  });
  gsap.set([leftHappyEyeRef.value, rightHappyEyeRef.value], {
    opacity: 0,
    scale: 0.82,
    y: 2,
    transformOrigin: "center center"
  });
  gsap.set([leftEarRef.value, rightEarRef.value], { y: 0, rotation: 0 });
  gsap.set([leftBrowRef.value, rightBrowRef.value], { y: 0, rotation: 0 });
  gsap.set([headGroupRef.value, characterRef.value], { x: 0, y: 0, rotation: 0 });
  gsap.set(shadowRef.value, { scaleX: 1, transformOrigin: "center center" });

  startBlinking();
  syncMoodAnimation(props.mood, true);
});

watch(
  () => props.mood,
  (mood) => {
    if (mood === "confused") {
      startBlinking();
    }

    syncMoodAnimation(mood);
  }
);

watch(
  () => [props.inputFocused, props.answerLength],
  ([focused, answerLength], [previousFocused, previousLength]) => {
    if (props.mood !== "confused") {
      return;
    }

    applyConfusedPose();

    if (focused && previousLength !== undefined && answerLength !== previousLength) {
      playTypingBeat();
    }

    if (focused !== previousFocused && focused) {
      playTypingBeat();
    }
  }
);

onBeforeUnmount(() => {
  stopBlinking();
  reactionTimeline?.kill();
  gsap.killTweensOf([
    mascotRootRef.value,
    characterRef.value,
    headGroupRef.value,
    leftEarRef.value,
    rightEarRef.value,
    leftEyeRef.value,
    rightEyeRef.value,
    leftEyeDotRef.value,
    rightEyeDotRef.value,
    leftHappyEyeRef.value,
    rightHappyEyeRef.value,
    leftBrowRef.value,
    rightBrowRef.value,
    mouthConfusedRef.value,
    mouthSuccessRef.value,
    mouthWrongRef.value,
    thoughtConfusedRef.value,
    thoughtSuccessRef.value,
    thoughtWrongRef.value,
    sweatRef.value,
    shadowRef.value
  ]);
});
</script>

<template>
  <div ref="mascotRootRef" class="contact-guard-mascot" aria-hidden="true">
    <svg class="contact-guard-figure" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="guardShirt" x1="76" y1="118" x2="146" y2="190" gradientUnits="userSpaceOnUse">
          <stop stop-color="#ff8a5c" />
          <stop offset="1" stop-color="#ff5c51" />
        </linearGradient>
      </defs>

      <ellipse ref="shadowRef" class="guard-shadow guard-feature" cx="110" cy="196" rx="60" ry="12" />

      <g ref="characterRef" class="guard-character guard-feature">
        <path class="guard-body" d="M72 132C76 118 88 110 110 110C132 110 144 118 148 132L156 183H64L72 132Z" />
        <path class="guard-collar" d="M80 126H140C138 134 130 140 110 140C90 140 82 134 80 126Z" />
        <circle class="guard-tag" cx="110" cy="139" r="6" />

        <path class="guard-arm guard-arm-left" d="M74 136C58 142 51 155 51 171" />
        <path class="guard-arm guard-arm-right" d="M146 136C162 142 169 155 169 171" />

        <ellipse class="guard-foot" cx="86" cy="187" rx="16" ry="9" />
        <ellipse class="guard-foot" cx="134" cy="187" rx="16" ry="9" />

        <g ref="leftEarRef" class="guard-feature">
          <path class="guard-ear guard-ear-left" d="M52 76C38 66 35 48 44 37C55 24 74 28 82 43C88 55 85 74 76 88L52 76Z" />
        </g>
        <g ref="rightEarRef" class="guard-feature">
          <path class="guard-ear guard-ear-right" d="M168 76C182 66 185 48 176 37C165 24 146 28 138 43C132 55 135 74 144 88L168 76Z" />
        </g>

        <g ref="headGroupRef" class="guard-feature">
          <ellipse class="guard-head" cx="110" cy="88" rx="54" ry="49" />
          <ellipse class="guard-muzzle" cx="111" cy="102" rx="26" ry="20" />
          <ellipse class="guard-nose" cx="111" cy="96" rx="9" ry="7" />

          <g ref="leftEyeRef" class="guard-feature">
            <circle ref="leftEyeDotRef" class="guard-eye" cx="91" cy="79" r="5.2" />
          </g>
          <g ref="rightEyeRef" class="guard-feature">
            <circle ref="rightEyeDotRef" class="guard-eye" cx="129" cy="79" r="5.2" />
          </g>

          <path ref="leftHappyEyeRef" class="guard-happy-eye guard-feature" d="M84 79C87 74 95 74 98 79" />
          <path ref="rightHappyEyeRef" class="guard-happy-eye guard-feature" d="M122 79C125 74 133 74 136 79" />

          <path ref="leftBrowRef" class="guard-brow guard-feature" d="M82 67L97 63" />
          <path ref="rightBrowRef" class="guard-brow guard-feature" d="M123 63L138 67" />

          <path ref="mouthConfusedRef" class="guard-mouth guard-mouth-confused" d="M100 106C105 110 117 110 122 106" />
          <path ref="mouthSuccessRef" class="guard-mouth guard-mouth-success" d="M97 102C104 112 118 112 125 102" />
          <path ref="mouthWrongRef" class="guard-mouth guard-mouth-wrong" d="M98 110C104 104 118 104 124 110" />
        </g>
      </g>

      <g ref="thoughtConfusedRef" class="guard-expression guard-expression-confused">
        <path d="M161 31C161 18 172 8 187 8C202 8 213 18 213 31C213 45 201 55 185 55C181 55 177 54 173 52L164 57L167 47C163 42 161 37 161 31Z" />
        <text x="186" y="40">?</text>
      </g>

      <g ref="thoughtSuccessRef" class="guard-expression guard-expression-success">
        <path d="M170 18L174 28L185 29L177 36L180 47L170 41L160 47L163 36L155 29L166 28L170 18Z" />
        <path d="M194 28L196 33L201 34L197 38L198 44L194 41L190 44L191 38L187 34L192 33L194 28Z" />
      </g>

      <g ref="thoughtWrongRef" class="guard-expression guard-expression-wrong">
        <path d="M179 24C179 16 185 10 194 10C203 10 209 16 209 24C209 29 206 34 202 37L203 45L196 41C195 41 195 41 194 41C185 41 179 33 179 24Z" />
        <path d="M94 46C94 39 99 34 106 34C112 34 117 39 117 46C117 50 114 55 110 58L112 66L105 62C104 62 104 62 103 62C98 62 94 55 94 46Z" />
      </g>

      <path ref="sweatRef" class="guard-sweat guard-feature" d="M153 60C157 65 160 70 160 75C160 81 156 86 150 86C144 86 140 81 140 75C140 70 144 65 153 60Z" />
    </svg>

    <div class="contact-guard-copy">
      <strong>{{ moodCopy.title }}</strong>
      <span>{{ moodCopy.subtitle }}</span>
    </div>
  </div>
</template>
