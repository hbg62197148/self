<script setup>
import { computed, ref, watch } from "vue";
import ContactCaptchaDialog from "../components/contact/ContactCaptchaDialog.vue";
import ChapterBeacon from "../components/layout/ChapterBeacon.vue";
import LoadingScreen from "../components/layout/LoadingScreen.vue";
import MotionControlOrb from "../components/layout/MotionControlOrb.vue";
import SiteFooter from "../components/layout/SiteFooter.vue";
import SiteHeader from "../components/layout/SiteHeader.vue";
import AboutSection from "../components/sections/AboutSection.vue";
import ContactSection from "../components/sections/ContactSection.vue";
import HeroSection from "../components/sections/HeroSection.vue";
import IdentitySection from "../components/sections/IdentitySection.vue";
import ProjectsSection from "../components/sections/ProjectsSection.vue";
import SkillsSection from "../components/sections/SkillsSection.vue";
import { useActiveSection } from "../composables/useActiveSection";
import { useClipboard } from "../composables/useClipboard";
import { useLoadingGate } from "../composables/useLoadingGate";
import { useLocale } from "../composables/useLocale";
import { useProfileContent } from "../composables/useProfileContent";
import { useProtectedContactAction } from "../composables/useProtectedContactAction";
import { useRevealOnScroll } from "../composables/useRevealOnScroll";
import { useSectionTransitionMotion } from "../composables/useSectionTransitionMotion";
import { useSurfaceMotion } from "../composables/useSurfaceMotion";
import { buildLocalizedProfile, getSiteCopy } from "../i18n/profileLocale";

const sectionToneMeta = {
  home: {
    index: "01",
    tone: "#ff6a3d",
    glow: "rgba(255, 106, 61, 0.24)",
    glowSoft: "rgba(255, 106, 61, 0.12)"
  },
  identity: {
    index: "02",
    tone: "#f6c85f",
    glow: "rgba(246, 200, 95, 0.22)",
    glowSoft: "rgba(246, 200, 95, 0.1)"
  },
  about: {
    index: "03",
    tone: "#7bf7d4",
    glow: "rgba(123, 247, 212, 0.22)",
    glowSoft: "rgba(123, 247, 212, 0.1)"
  },
  skills: {
    index: "04",
    tone: "#9ea9ff",
    glow: "rgba(158, 169, 255, 0.24)",
    glowSoft: "rgba(158, 169, 255, 0.11)"
  },
  projects: {
    index: "05",
    tone: "#ff8cb7",
    glow: "rgba(255, 140, 183, 0.22)",
    glowSoft: "rgba(255, 140, 183, 0.1)"
  },
  contact: {
    index: "06",
    tone: "#69d2ff",
    glow: "rgba(105, 210, 255, 0.24)",
    glowSoft: "rgba(105, 210, 255, 0.1)"
  }
};

// 页面里的局部交互状态，继续由页面壳组件统一编排。
const activeQuestionId = ref("");
const activeProjectId = ref("");
const { loading: introLoading } = useLoadingGate();
const { activeSection } = useActiveSection();
const { locale, toggleLocale, toggleLabel, toggleAriaLabel } = useLocale();
const { copiedLabel, copyToClipboard } = useClipboard();
const { profile, loading: profileLoading } = useProfileContent({ pollMs: 30000 });
const {
  visible: contactGuardVisible,
  challengePrompt,
  pendingItem,
  submitting: guardSubmitting,
  errorMessage: guardErrorMessage,
  guardMood,
  openDialog: openProtectedContactDialog,
  submitAnswer: submitProtectedContactAnswer,
  refreshChallenge: refreshProtectedContactChallenge,
  notifyGuardEditing,
  closeDialog: closeProtectedContactDialog
} = useProtectedContactAction(async (resolvedItem, requestedItem) => {
  const item = {
    ...resolvedItem,
    displayLabel: requestedItem?.displayLabel
  };

  // 验证通过后，再执行真正的复制或发送动作。
  if (item.copy) {
    await copyToClipboard(item.value, item.displayLabel ?? item.label);
    return;
  }

  if (item.href) {
    window.location.href = item.href;
  }
});

// 根据当前章节切换整页氛围色。
const localeCopy = computed(() => getSiteCopy(locale.value));
const navItems = computed(() => localeCopy.value.navItems);
const localizedProfile = computed(() => buildLocalizedProfile(profile.value, locale.value));
const sectionMeta = computed(() =>
  Object.fromEntries(
    Object.entries(sectionToneMeta).map(([id, meta]) => [
      id,
      {
        ...meta,
        label: localeCopy.value.sectionMeta[id] ?? id
      }
    ])
  )
);
const activeMeta = computed(() => sectionMeta.value[activeSection.value] ?? sectionMeta.value.home);
const appShellStyle = computed(() => ({
  "--active-tone": activeMeta.value.tone,
  "--active-glow": activeMeta.value.glow,
  "--active-glow-soft": activeMeta.value.glowSoft
}));
const currentYear = new Date().getFullYear();
const showLoading = computed(() => introLoading.value || profileLoading.value);
const activeQuestion = computed(
  () =>
    localizedProfile.value.questions.find((item) => item.id === activeQuestionId.value) ??
    localizedProfile.value.questions[0] ?? { id: "", prompt: "", answer: "" }
);

watch(
  () => localizedProfile.value.questions,
  (questions) => {
    if (!questions.some((item) => item.id === activeQuestionId.value)) {
      activeQuestionId.value = questions[0]?.id ?? "";
    }
  },
  { immediate: true, deep: true }
);

watch(
  () => localizedProfile.value.projects.items,
  (items) => {
    if (!items.some((item) => item.id === activeProjectId.value)) {
      activeProjectId.value = items[0]?.id ?? "";
    }
  },
  { immediate: true, deep: true }
);

useRevealOnScroll();
useSectionTransitionMotion();
useSurfaceMotion();
</script>

<template>
  <div class="app-shell" :style="appShellStyle">
    <LoadingScreen :loading="showLoading" :edition="localizedProfile.edition" :copy="localeCopy.loading" />

    <div class="background-noise" aria-hidden="true" />

    <ChapterBeacon :active-meta="activeMeta" />

    <MotionControlOrb />

    <SiteHeader
      :nav-items="navItems"
      :active-section="activeSection"
      :copy="localeCopy.header"
      :language-toggle-label="toggleLabel"
      :language-toggle-aria-label="toggleAriaLabel"
      @toggle-locale="toggleLocale"
    />

    <main class="page-content">
      <HeroSection
        :hero="localizedProfile.hero"
        :name-cn="localizedProfile.nameCn"
        :name-en="localizedProfile.nameEn"
        :role="localizedProfile.role"
      />
      <IdentitySection :deconstruction="localizedProfile.deconstruction" />
      <AboutSection
        :about="localizedProfile.about"
        :questions="localizedProfile.questions"
        :active-question="activeQuestion"
        @update:active-question="activeQuestionId = $event.id"
      />
      <SkillsSection :skills="localizedProfile.skills" />
      <ProjectsSection
        :projects="localizedProfile.projects"
        :active-project-id="activeProjectId"
        @update:active-project-id="activeProjectId = $event"
      />
      <ContactSection
        :contact="localizedProfile.contact"
        :copied-label="copiedLabel"
        :copied-text="localeCopy.copied"
        @copy="copyToClipboard"
        @protected-action="openProtectedContactDialog"
      />
    </main>

    <SiteFooter :current-year="currentYear" :copy="localeCopy.footer" />

    <ContactCaptchaDialog
      :visible="contactGuardVisible"
      :challenge-prompt="challengePrompt"
      :pending-item="pendingItem"
      :submitting="guardSubmitting"
      :error-message="guardErrorMessage"
      :guard-mood="guardMood"
      :copy="localeCopy.captcha"
      @close="closeProtectedContactDialog"
      @submit="submitProtectedContactAnswer"
      @refresh="refreshProtectedContactChallenge"
      @editing="notifyGuardEditing"
    />
  </div>
</template>
