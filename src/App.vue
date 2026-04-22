<script setup>
import { computed, ref } from "vue";
import ChapterBeacon from "./components/layout/ChapterBeacon.vue";
import LoadingScreen from "./components/layout/LoadingScreen.vue";
import SiteFooter from "./components/layout/SiteFooter.vue";
import SiteHeader from "./components/layout/SiteHeader.vue";
import AboutSection from "./components/sections/AboutSection.vue";
import ContactSection from "./components/sections/ContactSection.vue";
import HeroSection from "./components/sections/HeroSection.vue";
import IdentitySection from "./components/sections/IdentitySection.vue";
import ProjectsSection from "./components/sections/ProjectsSection.vue";
import SkillsSection from "./components/sections/SkillsSection.vue";
import { useActiveSection } from "./composables/useActiveSection";
import { useClipboard } from "./composables/useClipboard";
import { useLoadingGate } from "./composables/useLoadingGate";
import { usePointerGlow } from "./composables/usePointerGlow";
import { useRevealOnScroll } from "./composables/useRevealOnScroll";
import { profile } from "./data/profile";

const navItems = [
  { id: "home", label: "Home" },
  { id: "identity", label: "Identity" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skill Universe" },
  { id: "projects", label: "Chapters" },
  { id: "contact", label: "Contact" }
];

const sectionMeta = {
  home: {
    index: "01",
    label: "Opening Signal",
    tone: "#ff6a3d",
    glow: "rgba(255, 106, 61, 0.24)",
    glowSoft: "rgba(255, 106, 61, 0.12)"
  },
  identity: {
    index: "02",
    label: "Identity Breakdown",
    tone: "#f6c85f",
    glow: "rgba(246, 200, 95, 0.22)",
    glowSoft: "rgba(246, 200, 95, 0.1)"
  },
  about: {
    index: "03",
    label: "Profile Interior",
    tone: "#7bf7d4",
    glow: "rgba(123, 247, 212, 0.22)",
    glowSoft: "rgba(123, 247, 212, 0.1)"
  },
  skills: {
    index: "04",
    label: "Skill Universe",
    tone: "#9ea9ff",
    glow: "rgba(158, 169, 255, 0.24)",
    glowSoft: "rgba(158, 169, 255, 0.11)"
  },
  projects: {
    index: "05",
    label: "Selected Chapters",
    tone: "#ff8cb7",
    glow: "rgba(255, 140, 183, 0.22)",
    glowSoft: "rgba(255, 140, 183, 0.1)"
  },
  contact: {
    index: "06",
    label: "Contact Finale",
    tone: "#69d2ff",
    glow: "rgba(105, 210, 255, 0.24)",
    glowSoft: "rgba(105, 210, 255, 0.1)"
  }
};

// 页面里的局部交互状态，继续由页面壳组件统一编排。
const activeQuestion = ref(profile.questions[0]);
const activeProjectId = ref(profile.projects.items[0].id);
const { loading } = useLoadingGate();
const { activeSection } = useActiveSection();
const { copiedLabel, copyToClipboard } = useClipboard();

// 根据当前章节切换整页氛围色。
const activeMeta = computed(() => sectionMeta[activeSection.value] ?? sectionMeta.home);
const appShellStyle = computed(() => ({
  "--active-tone": activeMeta.value.tone,
  "--active-glow": activeMeta.value.glow,
  "--active-glow-soft": activeMeta.value.glowSoft
}));
const currentYear = new Date().getFullYear();

useRevealOnScroll();
usePointerGlow();
</script>

<template>
  <div class="app-shell" :style="appShellStyle">
    <LoadingScreen :loading="loading" :edition="profile.edition" />

    <div class="background-noise" aria-hidden="true" />

    <ChapterBeacon :active-meta="activeMeta" />

    <SiteHeader :nav-items="navItems" :active-section="activeSection" />

    <main class="page-content">
      <HeroSection :hero="profile.hero" :name-cn="profile.nameCn" :name-en="profile.nameEn" :role="profile.role" />
      <IdentitySection :deconstruction="profile.deconstruction" />
      <AboutSection
        :about="profile.about"
        :questions="profile.questions"
        :active-question="activeQuestion"
        @update:active-question="activeQuestion = $event"
      />
      <SkillsSection :skills="profile.skills" />
      <ProjectsSection
        :projects="profile.projects"
        :active-project-id="activeProjectId"
        @update:active-project-id="activeProjectId = $event"
      />
      <ContactSection
        :contact="profile.contact"
        :copied-label="copiedLabel"
        @copy="copyToClipboard"
      />
    </main>

    <SiteFooter :current-year="currentYear" />
  </div>
</template>
