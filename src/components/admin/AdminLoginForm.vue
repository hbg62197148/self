<script setup>
import { nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import { useMotionPreference } from "../../composables/useMotionPreference";
import { gsap } from "../../lib/gsap";

const props = defineProps({
  submitting: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ""
  },
  noticeMessage: {
    type: String,
    default: ""
  }
});

const emit = defineEmits(["submit"]);

const credentials = reactive({
  username: "",
  password: ""
});
const localError = ref("");
const authShellRef = ref(null);
const loginCardRef = ref(null);
const submitButtonRef = ref(null);
const { isMotionLite } = useMotionPreference();

let motionContext = null;
let buttonTween = null;

const getFeedbackElement = () => authShellRef.value?.querySelector(".admin-feedback");

const resetSubmitButton = () => {
  buttonTween?.kill();
  buttonTween = null;

  if (!submitButtonRef.value) {
    return;
  }

  gsap.to(submitButtonRef.value, {
    scale: 1,
    duration: 0.16,
    ease: "power2.out",
    clearProps: "transform,boxShadow"
  });
};

const playSubmitTap = () => {
  if (!submitButtonRef.value || isMotionLite.value) {
    return;
  }

  buttonTween?.kill();
  buttonTween = gsap.to(submitButtonRef.value, {
    scale: 0.97,
    duration: 0.12,
    repeat: 1,
    yoyo: true,
    ease: "power1.out"
  });
};

const playSubmittingPulse = () => {
  if (!submitButtonRef.value || isMotionLite.value) {
    return;
  }

  buttonTween?.kill();
  buttonTween = gsap.to(submitButtonRef.value, {
    scale: 0.985,
    boxShadow: "0 0 0 4px rgba(255, 106, 61, 0.12)",
    duration: 0.56,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });
};

const playLoginError = () => {
  if (!loginCardRef.value) {
    return;
  }

  const distance = isMotionLite.value ? 5 : 10;
  const repeat = isMotionLite.value ? 3 : 5;

  gsap.killTweensOf(loginCardRef.value);
  gsap.fromTo(
    loginCardRef.value,
    { x: -distance },
    {
      x: distance,
      duration: 0.06,
      repeat,
      yoyo: true,
      ease: "power1.inOut",
      onComplete: () => {
        gsap.to(loginCardRef.value, { x: 0, duration: 0.08, ease: "power1.out" });
      }
    }
  );

  const feedbackElement = getFeedbackElement();

  if (feedbackElement && !isMotionLite.value) {
    gsap.fromTo(
      feedbackElement,
      { y: 8, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.22,
        ease: "power2.out"
      }
    );
  }
};

const playEntrance = () => {
  if (!authShellRef.value) {
    return;
  }

  motionContext?.revert();
  motionContext = gsap.context(() => {
    if (isMotionLite.value) {
      gsap.set([".admin-login-card", ".admin-login-field", ".admin-auth-bg", ".admin-auth-scan"], { clearProps: "all" });
      return;
    }

    const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

    timeline
      .from(".admin-login-card", {
        y: 34,
        opacity: 0,
        scale: 0.96,
        duration: 0.68
      })
      .from(
        ".admin-login-field",
        {
          y: 18,
          opacity: 0,
          duration: 0.42,
          stagger: 0.07,
          ease: "power2.out"
        },
        "-=0.38"
      );

    gsap.to(".admin-auth-bg", {
      x: 22,
      y: -16,
      duration: 7,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    gsap.to(".admin-auth-scan", {
      xPercent: 14,
      opacity: 0.58,
      duration: 4.8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }, authShellRef.value);
};

const playSuccessExit = () =>
  new Promise((resolve) => {
    if (!loginCardRef.value || isMotionLite.value) {
      resolve();
      return;
    }

    gsap.to(loginCardRef.value, {
      y: -22,
      opacity: 0,
      scale: 0.98,
      filter: "blur(8px)",
      duration: 0.36,
      ease: "power2.in",
      onComplete: resolve
    });
  });

const submitLogin = () => {
  // 登录前先做基础校验，避免空表单直接发请求。
  if (!credentials.username.trim() || !credentials.password.trim()) {
    localError.value = "请输入账号和密码。";
    nextTick(playLoginError);
    return;
  }

  localError.value = "";
  playSubmitTap();
  emit("submit", {
    username: credentials.username.trim(),
    password: credentials.password
  });
};

watch(
  () => props.submitting,
  (isSubmitting) => {
    if (isSubmitting) {
      playSubmittingPulse();
      return;
    }

    resetSubmitButton();
  }
);

watch(
  () => props.errorMessage,
  (message) => {
    if (message) {
      nextTick(playLoginError);
    }
  }
);

onMounted(playEntrance);

onBeforeUnmount(() => {
  buttonTween?.kill();
  motionContext?.revert();
});

defineExpose({
  playSuccessExit
});
</script>

<template>
  <div ref="authShellRef" class="admin-auth-shell admin-auth-shell--motion">
    <div class="admin-auth-bg" aria-hidden="true">
      <span class="admin-auth-scan"></span>
    </div>

    <article ref="loginCardRef" class="admin-login-card panel">
      <div class="admin-login-copy admin-login-field">
        <p class="admin-kicker">Content Admin</p>
        <h1>后台登录</h1>
        <p class="admin-subtitle">输入正确的账号和密码后，才能进入内容管理后台。</p>
      </div>

      <form class="admin-login-form" @submit.prevent="submitLogin">
        <label class="admin-field admin-login-field">
          <span>账号</span>
          <input
            v-model="credentials.username"
            class="admin-input"
            type="text"
            autocomplete="username"
            placeholder="请输入后台账号"
          >
        </label>

        <label class="admin-field admin-login-field">
          <span>密码</span>
          <input
            v-model="credentials.password"
            class="admin-input"
            type="password"
            autocomplete="current-password"
            placeholder="请输入后台密码"
          >
        </label>

        <p v-if="localError || errorMessage" class="admin-feedback is-error admin-login-field">
          {{ localError || errorMessage }}
        </p>

        <p v-else-if="noticeMessage" class="admin-feedback is-success admin-login-field">
          {{ noticeMessage }}
        </p>

        <div class="admin-toolbar admin-login-field">
          <button
            ref="submitButtonRef"
            type="submit"
            class="button button-primary admin-login-button"
            :class="{ 'is-submitting': submitting }"
            :disabled="submitting"
          >
            {{ submitting ? "登录中..." : "登录后台" }}
          </button>
          <RouterLink class="button button-secondary" to="/">返回前台</RouterLink>
        </div>
      </form>
    </article>
  </div>
</template>

<style scoped>
.admin-auth-shell--motion {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding: clamp(18px, 4vw, 32px) 0;
}

.admin-auth-bg {
  position: absolute;
  inset: 18px -12%;
  z-index: 0;
  border-radius: 48px;
  background:
    linear-gradient(115deg, transparent 0%, rgba(255, 106, 61, 0.1) 36%, transparent 64%),
    linear-gradient(90deg, rgba(123, 247, 212, 0.08), transparent 28%, rgba(158, 169, 255, 0.08) 76%, transparent),
    repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.035) 0 1px, transparent 1px 68px);
  opacity: 0.72;
  pointer-events: none;
  will-change: transform;
}

.admin-auth-bg::before {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(0deg, transparent 0 24px, rgba(255, 255, 255, 0.035) 24px 25px);
  mask-image: linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent);
}

.admin-auth-scan {
  position: absolute;
  top: 24%;
  left: 10%;
  width: 80%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(123, 247, 212, 0.7), rgba(255, 255, 255, 0.55), transparent);
  filter: blur(0.2px);
  opacity: 0.34;
  will-change: transform, opacity;
}

.admin-login-card {
  position: relative;
  z-index: 1;
  transform-origin: 50% 50%;
  will-change: transform, opacity, filter;
}

.admin-login-field,
.admin-login-button {
  will-change: transform, opacity;
}

.admin-login-button {
  position: relative;
  overflow: hidden;
  transform-origin: 50% 50%;
}

.admin-login-button.is-submitting::after {
  content: "";
  position: absolute;
  right: 18px;
  bottom: 7px;
  left: 18px;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.88), transparent);
  background-size: 220% 100%;
  animation: admin-login-progress 1s linear infinite;
}

html.motion-lite .admin-auth-bg,
html.motion-lite .admin-login-button.is-submitting::after {
  display: none;
}

@keyframes admin-login-progress {
  from {
    background-position: 220% 0;
  }

  to {
    background-position: -220% 0;
  }
}

@media (max-width: 640px) {
  .admin-auth-shell--motion {
    padding: 10px 0;
  }

  .admin-auth-bg {
    inset: 8px -28%;
  }
}
</style>
