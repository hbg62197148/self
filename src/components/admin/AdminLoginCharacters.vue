<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps({
  showPassword: {
    type: Boolean,
    default: false
  },
  passwordLength: {
    type: Number,
    default: 0
  }
});

const mouseX = ref(0);
const mouseY = ref(0);
const hasPointerPosition = ref(false);
const isPurpleBlinking = ref(false);
const isBlackBlinking = ref(false);
const isPurplePeeking = ref(false);

const purpleRef = ref(null);
const blackRef = ref(null);
const orangeRef = ref(null);
const yellowRef = ref(null);
const purpleLeftEyeRef = ref(null);
const purpleRightEyeRef = ref(null);
const blackLeftEyeRef = ref(null);
const blackRightEyeRef = ref(null);
const orangeLeftDotRef = ref(null);
const orangeRightDotRef = ref(null);
const yellowLeftDotRef = ref(null);
const yellowRightDotRef = ref(null);

let purpleBlinkTimer = null;
let purpleBlinkEndTimer = null;
let blackBlinkTimer = null;
let blackBlinkEndTimer = null;
let peekTimer = null;
let peekEndTimer = null;

const hasPassword = computed(() => props.passwordLength > 0);
const isPasswordVisible = computed(() => hasPassword.value && props.showPassword);
const isHidingPassword = computed(() => hasPassword.value && !props.showPassword);

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const getRandomBlinkDelay = () => Math.random() * 4000 + 3000;

const calculatePosition = (target) => {
  if (!target || !hasPointerPosition.value) {
    return { faceX: 0, faceY: 0, bodySkew: 0 };
  }

  const rect = target.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 3;
  const deltaX = mouseX.value - centerX;
  const deltaY = mouseY.value - centerY;

  return {
    faceX: clamp(deltaX / 20, -15, 15),
    faceY: clamp(deltaY / 30, -10, 10),
    bodySkew: clamp(-deltaX / 120, -6, 6)
  };
};

const purplePos = computed(() => calculatePosition(purpleRef.value));
const blackPos = computed(() => calculatePosition(blackRef.value));
const orangePos = computed(() => calculatePosition(orangeRef.value));
const yellowPos = computed(() => calculatePosition(yellowRef.value));

const purpleStyle = computed(() => ({
  left: "70px",
  width: "180px",
  height: isHidingPassword.value ? "440px" : "400px",
  backgroundColor: "#6c3ff5",
  borderRadius: "10px 10px 0 0",
  zIndex: 1,
  transform: isPasswordVisible.value
    ? "skewX(0deg)"
    : isHidingPassword.value
      ? `skewX(${purplePos.value.bodySkew - 12}deg) translateX(40px)`
      : `skewX(${purplePos.value.bodySkew}deg)`
}));

const blackStyle = computed(() => ({
  left: "240px",
  width: "120px",
  height: "310px",
  backgroundColor: "#2d2d2d",
  borderRadius: "8px 8px 0 0",
  zIndex: 2,
  transform: isPasswordVisible.value
    ? "skewX(0deg)"
    : isHidingPassword.value
      ? `skewX(${blackPos.value.bodySkew * 1.5}deg)`
      : `skewX(${blackPos.value.bodySkew}deg)`
}));

const orangeStyle = computed(() => ({
  left: "0",
  width: "240px",
  height: "200px",
  zIndex: 3,
  backgroundColor: "#ff9b6b",
  borderRadius: "120px 120px 0 0",
  transform: isPasswordVisible.value ? "skewX(0deg)" : `skewX(${orangePos.value.bodySkew}deg)`
}));

const yellowStyle = computed(() => ({
  left: "310px",
  width: "140px",
  height: "230px",
  zIndex: 4,
  backgroundColor: "#e8d754",
  borderRadius: "70px 70px 0 0",
  transform: isPasswordVisible.value ? "skewX(0deg)" : `skewX(${yellowPos.value.bodySkew}deg)`
}));

const purpleEyesStyle = computed(() => ({
  left: `${isPasswordVisible.value ? 20 : 45 + purplePos.value.faceX}px`,
  top: `${isPasswordVisible.value ? 35 : 40 + purplePos.value.faceY}px`
}));

const blackEyesStyle = computed(() => ({
  left: `${isPasswordVisible.value ? 10 : 26 + blackPos.value.faceX}px`,
  top: `${isPasswordVisible.value ? 28 : 32 + blackPos.value.faceY}px`
}));

const orangeEyesStyle = computed(() => ({
  left: `${isPasswordVisible.value ? 50 : 82 + orangePos.value.faceX}px`,
  top: `${isPasswordVisible.value ? 85 : 90 + orangePos.value.faceY}px`
}));

const yellowEyesStyle = computed(() => ({
  left: `${isPasswordVisible.value ? 20 : 52 + yellowPos.value.faceX}px`,
  top: `${isPasswordVisible.value ? 35 : 40 + yellowPos.value.faceY}px`
}));

const yellowMouthStyle = computed(() => ({
  left: `${isPasswordVisible.value ? 10 : 40 + yellowPos.value.faceX}px`,
  top: `${isPasswordVisible.value ? 88 : 88 + yellowPos.value.faceY}px`
}));

const purpleForceLook = computed(() => {
  if (!isPasswordVisible.value) {
    return null;
  }

  return {
    x: isPurplePeeking.value ? 4 : -4,
    y: isPurplePeeking.value ? 5 : -4
  };
});

const blackForceLook = computed(() => (isPasswordVisible.value ? { x: -4, y: -4 } : null));
const orangeForceLook = computed(() => (isPasswordVisible.value ? { x: -5, y: -4 } : null));
const yellowForceLook = computed(() => (isPasswordVisible.value ? { x: -5, y: -4 } : null));

const eyeStyle = (size, isBlinking) => ({
  width: `${size}px`,
  height: isBlinking ? "2px" : `${size}px`
});

const getPupilTransform = (target, maxDistance, forceLook) => {
  if (forceLook) {
    return `translate(${forceLook.x}px, ${forceLook.y}px)`;
  }

  if (!target || !hasPointerPosition.value) {
    return "translate(0, 0)";
  }

  const rect = target.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const deltaX = mouseX.value - centerX;
  const deltaY = mouseY.value - centerY;
  const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);
  const angle = Math.atan2(deltaY, deltaX);
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;

  return `translate(${x}px, ${y}px)`;
};

const pupilStyle = (target, size, maxDistance, forceLook) => ({
  width: `${size}px`,
  height: `${size}px`,
  transform: getPupilTransform(target, maxDistance, forceLook)
});

const schedulePurpleBlink = () => {
  purpleBlinkTimer = window.setTimeout(() => {
    isPurpleBlinking.value = true;
    purpleBlinkEndTimer = window.setTimeout(() => {
      isPurpleBlinking.value = false;
      schedulePurpleBlink();
    }, 150);
  }, getRandomBlinkDelay());
};

const scheduleBlackBlink = () => {
  blackBlinkTimer = window.setTimeout(() => {
    isBlackBlinking.value = true;
    blackBlinkEndTimer = window.setTimeout(() => {
      isBlackBlinking.value = false;
      scheduleBlackBlink();
    }, 150);
  }, getRandomBlinkDelay());
};

const clearPeekTimers = () => {
  window.clearTimeout(peekTimer);
  window.clearTimeout(peekEndTimer);
  peekTimer = null;
  peekEndTimer = null;
};

const schedulePeek = () => {
  clearPeekTimers();

  if (!isPasswordVisible.value) {
    isPurplePeeking.value = false;
    return;
  }

  peekTimer = window.setTimeout(
    () => {
      isPurplePeeking.value = true;
      peekEndTimer = window.setTimeout(() => {
        isPurplePeeking.value = false;
        schedulePeek();
      }, 800);
    },
    Math.random() * 3000 + 2000
  );
};

watch(() => [props.passwordLength, props.showPassword], schedulePeek, {
  immediate: true
});

const handleMouseMove = (event) => {
  hasPointerPosition.value = true;
  mouseX.value = event.clientX;
  mouseY.value = event.clientY;
};

onMounted(() => {
  window.addEventListener("mousemove", handleMouseMove);
  schedulePurpleBlink();
  scheduleBlackBlink();
});

onBeforeUnmount(() => {
  window.removeEventListener("mousemove", handleMouseMove);
  window.clearTimeout(purpleBlinkTimer);
  window.clearTimeout(purpleBlinkEndTimer);
  window.clearTimeout(blackBlinkTimer);
  window.clearTimeout(blackBlinkEndTimer);
  clearPeekTimers();
});
</script>

<template>
  <div class="admin-login-characters" aria-hidden="true">
    <div ref="purpleRef" class="character character-purple" :style="purpleStyle">
      <div class="character-eyes purple-eyes" :style="purpleEyesStyle">
        <span ref="purpleLeftEyeRef" class="eye" :style="eyeStyle(18, isPurpleBlinking)">
          <span
            v-if="!isPurpleBlinking"
            class="eye-pupil"
            :style="pupilStyle(purpleLeftEyeRef, 7, 5, purpleForceLook)"
          ></span>
        </span>
        <span ref="purpleRightEyeRef" class="eye" :style="eyeStyle(18, isPurpleBlinking)">
          <span
            v-if="!isPurpleBlinking"
            class="eye-pupil"
            :style="pupilStyle(purpleRightEyeRef, 7, 5, purpleForceLook)"
          ></span>
        </span>
      </div>
    </div>

    <div ref="blackRef" class="character character-black" :style="blackStyle">
      <div class="character-eyes black-eyes" :style="blackEyesStyle">
        <span ref="blackLeftEyeRef" class="eye" :style="eyeStyle(16, isBlackBlinking)">
          <span
            v-if="!isBlackBlinking"
            class="eye-pupil"
            :style="pupilStyle(blackLeftEyeRef, 6, 4, blackForceLook)"
          ></span>
        </span>
        <span ref="blackRightEyeRef" class="eye" :style="eyeStyle(16, isBlackBlinking)">
          <span
            v-if="!isBlackBlinking"
            class="eye-pupil"
            :style="pupilStyle(blackRightEyeRef, 6, 4, blackForceLook)"
          ></span>
        </span>
      </div>
    </div>

    <div ref="orangeRef" class="character character-orange" :style="orangeStyle">
      <div class="dot-eyes orange-eyes" :style="orangeEyesStyle">
        <span ref="orangeLeftDotRef" class="eye-dot" :style="pupilStyle(orangeLeftDotRef, 12, 5, orangeForceLook)"></span>
        <span ref="orangeRightDotRef" class="eye-dot" :style="pupilStyle(orangeRightDotRef, 12, 5, orangeForceLook)"></span>
      </div>
    </div>

    <div ref="yellowRef" class="character character-yellow" :style="yellowStyle">
      <div class="dot-eyes yellow-eyes" :style="yellowEyesStyle">
        <span ref="yellowLeftDotRef" class="eye-dot" :style="pupilStyle(yellowLeftDotRef, 12, 5, yellowForceLook)"></span>
        <span ref="yellowRightDotRef" class="eye-dot" :style="pupilStyle(yellowRightDotRef, 12, 5, yellowForceLook)"></span>
      </div>
      <span class="mouth" :style="yellowMouthStyle"></span>
    </div>
  </div>
</template>

<style scoped>
.admin-login-characters {
  position: relative;
  width: 550px;
  max-width: 100%;
  height: 400px;
  filter: drop-shadow(0 28px 42px rgba(0, 0, 0, 0.28));
  transform-origin: bottom center;
}

.character {
  position: absolute;
  bottom: 0;
  transform-origin: bottom center;
  transition: all 700ms ease-in-out;
}

.character-eyes,
.dot-eyes {
  position: absolute;
  display: flex;
  transition: all 700ms ease-in-out;
}

.purple-eyes {
  gap: 32px;
}

.black-eyes {
  gap: 24px;
}

.orange-eyes {
  gap: 32px;
  transition-duration: 200ms;
  transition-timing-function: ease-out;
}

.yellow-eyes {
  gap: 24px;
  transition-duration: 200ms;
  transition-timing-function: ease-out;
}

.eye {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #fff;
  border-radius: 999px;
  transition: all 150ms ease;
}

.eye-pupil,
.eye-dot {
  display: inline-block;
  background: #2d2d2d;
  border-radius: 999px;
  transition: transform 100ms ease-out;
}

.mouth {
  position: absolute;
  display: block;
  width: 80px;
  height: 4px;
  background: #2d2d2d;
  border-radius: 999px;
  transition: all 200ms ease-out;
}

html.motion-lite .character,
html.motion-lite .character-eyes,
html.motion-lite .dot-eyes,
html.motion-lite .eye,
html.motion-lite .eye-pupil,
html.motion-lite .eye-dot,
html.motion-lite .mouth {
  transition-duration: 0.01ms;
}

@media (max-width: 1120px) {
  .admin-login-characters {
    transform: scale(0.9);
  }
}
</style>
