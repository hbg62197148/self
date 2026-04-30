<script setup>
import { computed } from "vue";
import SectionHeading from "../SectionHeading.vue";
import Staged from "../Staged.vue";
import SkillUniverseScene from "../visuals/SkillUniverseScene.vue";
import { useSkillUniverse } from "../../composables/useSkillUniverse";

const props = defineProps({
  skills: {
    type: Object,
    required: true
  }
});

const skillNodes = computed(() => props.skills.nodes ?? []);

const {
  activeLink,
  activeNodeId,
  clearActiveNode,
  isCorePulsing,
  resolvedNodes,
  setActiveNode,
  activateNode
} = useSkillUniverse(skillNodes);
</script>

<template>
  <section class="section panel" id="skills" data-reveal>
    <SectionHeading
      :issue="skills.issue"
      :title="skills.title"
      :copy="skills.copy"
    />

    <div class="skills-layout">
      <Staged as="article" class="panel-inset universe-stage" :order="2" @mouseleave="clearActiveNode">
        <SkillUniverseScene
          :nodes="resolvedNodes"
          :active-node-id="activeNodeId"
          :active-tone="activeLink?.tone ?? '#ff6a3d'"
          :pulsing="isCorePulsing"
        />

        <div class="orbit orbit-outer stage-fade" :style="{ '--stage-order': 0 }" />
        <div class="orbit orbit-middle stage-fade" :style="{ '--stage-order': 1 }" />
        <div class="orbit orbit-inner stage-fade" :style="{ '--stage-order': 2 }" />

        <svg class="universe-links universe-links-fallback" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <g v-if="activeLink">
            <line
              class="universe-link-glow"
              :style="{ '--link-tone': activeLink.tone }"
              :x1="activeLink.x1"
              :y1="activeLink.y1"
              :x2="activeLink.x2"
              :y2="activeLink.y2"
            />
            <line
              class="universe-link-line"
              :style="{ '--link-tone': activeLink.tone }"
              :x1="activeLink.x1"
              :y1="activeLink.y1"
              :x2="activeLink.x2"
              :y2="activeLink.y2"
            />
            <circle
              class="universe-link-core"
              :style="{ '--link-tone': activeLink.tone }"
              :cx="activeLink.x1"
              :cy="activeLink.y1"
              r="0.95"
            />
            <circle
              class="universe-link-node"
              :style="{ '--link-tone': activeLink.tone }"
              :cx="activeLink.x2"
              :cy="activeLink.y2"
              r="1.12"
            />
          </g>
        </svg>

        <Staged
          class="universe-core-shell"
          :order="3"
          :style="{ '--core-tone': activeLink?.tone ?? 'rgba(255, 106, 61, 0.42)' }"
        >
          <div :class="['universe-core', { 'is-linked': activeLink, 'is-pulsing': isCorePulsing }]">
            <span>{{ skills.coreLabel ?? "Core System" }}</span>
            <strong>{{ skills.core }}</strong>
            <p>{{ skills.coreNote }}</p>
          </div>
        </Staged>

        <Staged
          v-for="(node, index) in resolvedNodes"
          :key="node.id"
          :class="['universe-node-shell', { 'is-active': node.id === activeNodeId }]"
          :order="4 + index"
          :style="{
            '--x': `${node.resolvedX}%`,
            '--y': `${node.resolvedY}%`,
            '--dx': node.offsetX,
            '--dy': node.offsetY,
            '--tone': node.tone
          }"
        >
          <button
            type="button"
            :class="['universe-node', { 'is-active': node.id === activeNodeId }]"
            :aria-label="`${node.label} / ${node.detail}`"
            @mouseenter="setActiveNode(node.id)"
            @focus="setActiveNode(node.id)"
            @blur="clearActiveNode"
            @click="activateNode(node.id)"
          >
            <span>{{ node.detail }}</span>
            <strong>{{ node.label }}</strong>
          </button>
        </Staged>
      </Staged>

      <div class="skills-column">
        <Staged
          v-for="(group, index) in skills.groups"
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
</template>
