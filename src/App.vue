<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import SectionHeading from "./components/SectionHeading.vue";
import Staged from "./components/Staged.vue";
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

const loading = ref(true);
const activeQuestion = ref(profile.questions[0]);
const activeProjectId = ref(profile.projects.items[0].id);
const activeSection = ref("home");
const copiedLabel = ref(null);

const activeProject = computed(
  () => profile.projects.items.find((item) => item.id === activeProjectId.value) ?? profile.projects.items[0]
);
const activeMeta = computed(() => sectionMeta[activeSection.value] ?? sectionMeta.home);
const identityLetters = computed(() => profile.deconstruction.cards.map((item) => item.letter).join(""));
const appShellStyle = computed(() => ({
  "--active-tone": activeMeta.value.tone,
  "--active-glow": activeMeta.value.glow,
  "--active-glow-soft": activeMeta.value.glowSoft
}));
const currentYear = new Date().getFullYear();

let loadingTimerId = null;
let copiedResetTimerId = null;
let revealObserver = null;
let sectionObserver = null;

const handlePointerMove = (event) => {
  document.documentElement.style.setProperty("--pointer-x", `${event.clientX}px`);
  document.documentElement.style.setProperty("--pointer-y", `${event.clientY}px`);
};

const resetCopiedLabel = () => {
  if (copiedResetTimerId !== null) {
    window.clearTimeout(copiedResetTimerId);
  }

  copiedResetTimerId = window.setTimeout(() => {
    copiedLabel.value = null;
    copiedResetTimerId = null;
  }, 1200);
};

const copyToClipboard = async (text, label) => {
  if (!text) return;

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.top = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    copiedLabel.value = label ?? "Copied";
    resetCopiedLabel();
  } catch {
    // Ignore copy failures (permissions / unsupported browser).
  }
};

const isExternalLink = (href) => Boolean(href) && /^(https?:|mailto:)/.test(href);

watch(
  loading,
  (isLoading) => {
    document.body.style.overflow = isLoading ? "hidden" : "";
  },
  { immediate: true }
);

onMounted(() => {
  loadingTimerId = window.setTimeout(() => {
    loading.value = false;
    loadingTimerId = null;
  }, 1300);

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const shouldShow = entry.isIntersecting && entry.intersectionRatio >= 0.22;
        const shouldReset = !entry.isIntersecting || entry.intersectionRatio <= 0.08;

        if (shouldShow) {
          entry.target.classList.add("is-visible");
        } else if (shouldReset) {
          entry.target.classList.remove("is-visible");
        }
      });
    },
    {
      threshold: [0, 0.08, 0.22, 0.4, 0.6],
      rootMargin: "0px 0px -8% 0px"
    }
  );

  document.querySelectorAll("[data-reveal]").forEach((node) => {
    revealObserver.observe(node);
  });

  sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

      if (visible) {
        activeSection.value = visible.target.id;
      }
    },
    {
      threshold: [0.25, 0.45, 0.7]
    }
  );

  document.querySelectorAll("section[id]").forEach((section) => {
    sectionObserver.observe(section);
  });

  window.addEventListener("pointermove", handlePointerMove, { passive: true });
});

onBeforeUnmount(() => {
  if (loadingTimerId !== null) {
    window.clearTimeout(loadingTimerId);
  }

  if (copiedResetTimerId !== null) {
    window.clearTimeout(copiedResetTimerId);
  }

  revealObserver?.disconnect();
  sectionObserver?.disconnect();
  window.removeEventListener("pointermove", handlePointerMove);
  document.body.style.overflow = "";
});
</script>

<template>
  <div class="app-shell" :style="appShellStyle">
    <div class="loading-screen" :class="{ 'is-hidden': !loading }" :aria-hidden="!loading">
      <div class="loading-stack">
        <span class="loading-label">LOADING</span>
        <strong>{{ profile.edition }}</strong>
        <p>Vite profile issue is assembling...</p>
      </div>
    </div>

    <div class="background-noise" aria-hidden="true" />

    <aside class="chapter-beacon" aria-hidden="true">
      <span>{{ activeMeta.index }}</span>
      <strong>{{ activeMeta.label }}</strong>
    </aside>

    <header class="site-header">
      <a class="brand" href="#home">
        <span class="brand-mark">PI</span>
        <span class="brand-copy">
          <strong>Personal Issue</strong>
          <small>涓汉涓撳垔</small>
        </span>
      </a>

      <nav class="site-nav" aria-label="椤甸潰瀵艰埅">
        <a
          v-for="item in navItems"
          :key="item.id"
          class="nav-link"
          :class="{ 'is-active': activeSection === item.id }"
          :href="`#${item.id}`"
        >
          {{ item.label }}
        </a>
      </nav>
    </header>

    <main class="page-content">
      <section class="hero panel" id="home" data-reveal>
        <div class="hero-copy">
          <Staged as="p" class="section-kicker" :order="0">
            {{ profile.hero.issue }}
          </Staged>
          <Staged as="p" class="hero-eyebrow" :order="1">
            {{ profile.hero.eyebrow }}
          </Staged>

          <Staged as="h1" class="hero-title" :order="2">
            <span v-for="line in profile.hero.title" :key="line" class="hero-line">
              {{ line }}
            </span>
          </Staged>

          <Staged as="p" class="hero-subtitle" :order="3">
            {{ profile.hero.subtitle }}
          </Staged>

          <Staged class="hero-actions" :order="4">
            <a class="button button-primary" :href="profile.hero.primaryCta.href">
              {{ profile.hero.primaryCta.label }}
            </a>
            <a class="button button-secondary" :href="profile.hero.secondaryCta.href">
              {{ profile.hero.secondaryCta.label }}
            </a>
          </Staged>

          <div class="hero-stats">
            <Staged
              v-for="(item, index) in profile.hero.stats"
              :key="item.label"
              as="article"
              class="stat-card"
              :order="5 + index"
            >
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </Staged>
          </div>
        </div>

        <div class="hero-stage">
          <Staged class="portrait-shell" :order="2">
            <div class="portrait-card">
              <div class="portrait-glow portrait-glow-one" />
              <div class="portrait-glow portrait-glow-two" />
              <div class="portrait-grid" />
              <div class="portrait-disc" />
              <div class="portrait-plate">
                <span>{{ profile.nameCn }}</span>
                <strong>{{ profile.nameEn }}</strong>
              </div>
            </div>
            <div class="floating-pill floating-pill-top">{{ profile.role }}</div>
          </Staged>

          <Staged as="aside" class="hero-sidecard" :order="6">
            <p class="mini-label">Profile Pulse</p>
            <h2>{{ profile.role }}</h2>
            <p class="hero-summary">{{ profile.hero.summary }}</p>

            <div class="tag-strip">
              <span v-for="item in profile.hero.tags" :key="item" class="tag-chip">
                {{ item }}
              </span>
            </div>
          </Staged>
        </div>
      </section>

      <section class="section panel" id="identity" data-reveal>
        <SectionHeading
          :issue="profile.deconstruction.issue"
          :title="profile.deconstruction.title"
          :copy="profile.deconstruction.copy"
        />

        <div class="identity-shell">
          <div class="name-stack" :aria-label="`${identityLetters} breakdown`">
            <span class="name-ghost" aria-hidden="true">
              <span
                v-for="item in profile.deconstruction.cards"
                :key="`ghost-${item.letter}-${item.word}`"
                class="name-ghost-letter"
              >
                {{ item.letter }}
              </span>
            </span>

            <Staged
              v-for="(item, index) in profile.deconstruction.cards"
              :key="item.letter + item.word"
              as="div"
              class="name-row"
              :order="2 + index"
              :style="{
                '--row-progress': (1 - index / Math.max(profile.deconstruction.cards.length - 1, 1)).toFixed(3)
              }"
            >
              <span class="name-letter-shell" tabindex="0">
                <span class="name-letter">{{ item.letter }}</span>
                <span class="name-letter-overlay" aria-hidden="true">
                  {{ item.zh }}
                </span>
              </span>

              <div class="name-copy">
                <em>{{ item.word }}</em>
                <small class="name-translation">{{ item.zh }}</small>
                <p>{{ item.text }}</p>
              </div>
            </Staged>
          </div>
        </div>
      </section>

      <section class="section panel" id="about" data-reveal>
        <SectionHeading
          :issue="profile.about.issue"
          :title="profile.about.title"
          :copy="profile.about.copy"
        />

        <div class="about-layout">
          <Staged as="article" class="panel-inset about-story" :order="2">
            <Staged class="about-visual stage-subitem" :order="0">
              <span class="mini-label">{{ profile.about.portraitLabel }}</span>
              <div class="about-frame">
                <div class="about-spider-shell" aria-hidden="true">
                  <img
                    class="about-spider"
                    src="/about-spider.svg"
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div class="about-frame-core" />
                <div class="about-frame-outline" />
                <div class="about-frame-cross" />
              </div>
              <div class="snippet-stack">
                <span v-for="item in profile.about.snippets" :key="item" class="snippet-chip">
                  {{ item }}
                </span>
              </div>
            </Staged>

            <div class="story-copy">
              <Staged
                v-for="(paragraph, index) in profile.about.paragraphs"
                :key="paragraph"
                as="p"
                class="stage-subitem"
                :order="1 + index"
              >
                {{ paragraph }}
              </Staged>
            </div>
          </Staged>

          <Staged as="article" class="panel-inset ask-panel" :order="3">
            <Staged class="ask-panel-head stage-subitem" :order="0">
              <p class="mini-label">Ask The Profile</p>
              <span class="status-pill">Interactive</span>
            </Staged>

            <div :key="activeQuestion.id" class="answer-stage stage-subitem stage-swap" :style="{ '--stage-order': 1 }">
              <h3>{{ activeQuestion.prompt }}</h3>
              <p>{{ activeQuestion.answer }}</p>
            </div>

            <div class="question-list">
              <button
                v-for="(item, index) in profile.questions"
                :key="item.id"
                type="button"
                :class="['stage-subitem', 'question-button', { 'is-active': item.id === activeQuestion.id }]"
                :style="{ '--stage-order': 2 + index }"
                @click="activeQuestion = item"
              >
                {{ item.prompt }}
              </button>
            </div>

            <div class="fact-grid">
              <Staged
                v-for="(item, index) in profile.about.quickFacts"
                :key="item.label"
                as="article"
                class="fact-card stage-subitem"
                :order="6 + index"
              >
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </Staged>
            </div>
          </Staged>
        </div>
      </section>

      <section class="section panel" id="skills" data-reveal>
        <SectionHeading
          :issue="profile.skills.issue"
          :title="profile.skills.title"
          :copy="profile.skills.copy"
        />

        <div class="skills-layout">
          <Staged as="article" class="panel-inset universe-stage" :order="2">
            <div class="orbit orbit-outer stage-fade" :style="{ '--stage-order': 0 }" />
            <div class="orbit orbit-middle stage-fade" :style="{ '--stage-order': 1 }" />
            <div class="orbit orbit-inner stage-fade" :style="{ '--stage-order': 2 }" />

            <div class="universe-core stage-subitem" :style="{ '--stage-order': 3 }">
              <span>Core System</span>
              <strong>{{ profile.skills.core }}</strong>
              <p>{{ profile.skills.coreNote }}</p>
            </div>

            <div
              v-for="(node, index) in profile.skills.nodes"
              :key="node.label"
              class="universe-node stage-subitem"
              :style="{
                '--x': node.label === 'Motion' ? '35%' : node.x,
                '--y': node.y,
                '--tone': node.tone,
                '--stage-order': 4 + index
              }"
            >
              <span>{{ node.detail }}</span>
              <strong>{{ node.label }}</strong>
            </div>
          </Staged>

          <div class="skills-column">
            <Staged
              v-for="(group, index) in profile.skills.groups"
              :key="group.title"
              as="article"
              class="skill-card panel-inset"
              :order="3 + index"
            >
              <h3>{{ group.title }}</h3>
              <p>{{ group.note }}</p>
              <div class="skill-list">
                <span v-for="item in group.items" :key="item" class="skill-pill">
                  {{ item }}
                </span>
              </div>
            </Staged>
          </div>
        </div>
      </section>

      <section class="section panel" id="projects" data-reveal>
        <SectionHeading
          :issue="profile.projects.issue"
          :title="profile.projects.title"
          :copy="profile.projects.copy"
        />

        <div class="projects-layout">
          <div class="project-list">
            <Staged
              v-for="(item, index) in profile.projects.items"
              :key="item.id"
              as="button"
              type="button"
              :class="['project-tab', { 'is-active': item.id === activeProjectId }]"
              :order="2 + index"
              @click="activeProjectId = item.id"
            >
              <span class="project-index">{{ item.index }}</span>
              <div class="project-tab-copy">
                <small>{{ item.category }}</small>
                <strong>{{ item.title }}</strong>
                <p>{{ item.subtitle }}</p>
              </div>
            </Staged>
          </div>

          <article class="project-detail panel-inset stage-item" :style="{ '--stage-order': 6 }">
            <div :key="activeProject.id" class="project-detail-swap stage-swap">
              <div class="project-detail-head">
                <div>
                  <p class="mini-label">{{ activeProject.category }}</p>
                  <h3>{{ activeProject.title }}</h3>
                </div>
                <span class="detail-index">{{ activeProject.index }}</span>
              </div>

              <p class="project-description">{{ activeProject.description }}</p>

              <div class="signal-grid">
                <article v-for="item in activeProject.signals" :key="item.label" class="signal-card">
                  <span>{{ item.label }}</span>
                  <strong>{{ item.value }}</strong>
                </article>
              </div>

              <div class="stack-row">
                <span v-for="item in activeProject.stack" :key="item" class="tag-chip">
                  {{ item }}
                </span>
              </div>

              <div class="detail-list">
                <p v-for="item in activeProject.details" :key="item">
                  {{ item }}
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section class="section panel contact-section" id="contact" data-reveal>
        <SectionHeading
          :issue="profile.contact.issue"
          :title="profile.contact.title"
          :copy="profile.contact.copy"
        />

        <div class="contact-layout">
          <Staged as="article" class="contact-display panel-inset" :order="2">
            <p>{{ profile.contact.display }}</p>
            <span>{{ profile.contact.intro }}</span>
          </Staged>

          <div class="contact-grid">
            <Staged
              v-for="(item, index) in profile.contact.items"
              :key="item.label"
              as="article"
              class="contact-card panel-inset"
              :order="3 + index"
            >
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
              <button
                v-if="item.copy"
                type="button"
                class="contact-action"
                @click="copyToClipboard(item.value, item.label)"
              >
                {{ copiedLabel === item.label ? "Copied" : item.action }}
              </button>
              <a
                v-else
                class="contact-action"
                :href="item.href"
                :target="isExternalLink(item.href) ? '_blank' : undefined"
                :rel="isExternalLink(item.href) ? 'noreferrer' : undefined"
              >
                {{ item.action }}
              </a>
            </Staged>
          </div>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <span>Personal Issue | 涓汉涓撳垔 | Huang Binge</span>
      <span>{{ currentYear }}</span>
    </footer>
  </div>
</template>
