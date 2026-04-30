<script setup>
import Staged from "../Staged.vue";
import HeroSignalCoreScene from "../visuals/HeroSignalCoreScene.vue";
import { useHeroMotion } from "../../composables/useHeroMotion";

defineProps({
  hero: {
    type: Object,
    required: true
  },
  nameCn: {
    type: String,
    default: ""
  },
  nameEn: {
    type: String,
    default: ""
  },
  role: {
    type: String,
    default: ""
  }
});

const splitHeroLine = (line) => Array.from(String(line));

// 首屏的漂浮球、标题拆字、视差和 CTA 微交互都交给 GSAP 统一处理。
const {
  heroSectionRef,
  portraitCardRef,
  portraitDiscFrameRef,
  portraitDiscRef,
  portraitGlowOneRef,
  portraitGlowTwoRef,
  floatingPillRef,
  primaryCtaRef,
  secondaryCtaRef
} = useHeroMotion();
</script>

<template>
  <section ref="heroSectionRef" class="hero panel" id="home" data-reveal>
    <div class="hero-copy">
      <Staged as="p" class="section-kicker" :order="0">
        {{ hero.issue }}
      </Staged>
      <Staged as="p" class="hero-eyebrow" :order="1">
        {{ hero.eyebrow }}
      </Staged>

      <Staged as="h1" class="hero-title" :order="2">
        <span v-for="line in hero.title" :key="line" class="hero-line" :aria-label="line">
          <span
            v-for="(char, charIndex) in splitHeroLine(line)"
            :key="`${line}-${charIndex}`"
            class="hero-char"
            aria-hidden="true"
          >
            {{ char === " " ? "\u00a0" : char }}
          </span>
        </span>
      </Staged>

      <Staged as="p" class="hero-subtitle" :order="3">
        {{ hero.subtitle }}
      </Staged>

      <Staged class="hero-actions" :order="4">
        <a ref="primaryCtaRef" class="button button-primary hero-cta" :href="hero.primaryCta.href">
          <span class="hero-cta-spotlight" aria-hidden="true" />
          <span class="hero-cta-label">{{ hero.primaryCta.label }}</span>
        </a>
        <a ref="secondaryCtaRef" class="button button-secondary hero-cta" :href="hero.secondaryCta.href">
          <span class="hero-cta-spotlight" aria-hidden="true" />
          <span class="hero-cta-label">{{ hero.secondaryCta.label }}</span>
        </a>
      </Staged>

      <div class="hero-stats">
        <Staged
          v-for="(item, index) in hero.stats"
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
        <div ref="portraitCardRef" class="portrait-card">
          <div ref="portraitGlowOneRef" class="portrait-glow portrait-glow-one" />
          <div ref="portraitGlowTwoRef" class="portrait-glow portrait-glow-two" />
          <div class="portrait-grid" />
          <div ref="portraitDiscFrameRef" class="portrait-disc-frame">
            <div ref="portraitDiscRef" class="portrait-disc portrait-signal-core">
              <HeroSignalCoreScene />
            </div>
          </div>
          <div class="portrait-plate">
            <span>{{ nameCn }}</span>
            <strong>{{ nameEn }}</strong>
          </div>
        </div>
        <div ref="floatingPillRef" class="floating-pill floating-pill-top">{{ role }}</div>
      </Staged>

      <Staged as="aside" class="hero-sidecard" :order="6">
        <p class="mini-label">{{ hero.profilePulseLabel ?? "Profile Pulse" }}</p>
        <h2>{{ role }}</h2>
        <p class="hero-summary">{{ hero.summary }}</p>

        <div class="tag-strip">
          <span v-for="item in hero.tags" :key="item" class="tag-chip">
            {{ item }}
          </span>
        </div>
      </Staged>
    </div>
  </section>
</template>
