<script setup>
import SectionHeading from "../SectionHeading.vue";
import Staged from "../Staged.vue";

defineProps({
  skills: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <section class="section panel" id="skills" data-reveal>
    <SectionHeading
      :issue="skills.issue"
      :title="skills.title"
      :copy="skills.copy"
    />

    <div class="skills-layout">
      <Staged as="article" class="panel-inset universe-stage" :order="2">
        <div class="orbit orbit-outer stage-fade" :style="{ '--stage-order': 0 }" />
        <div class="orbit orbit-middle stage-fade" :style="{ '--stage-order': 1 }" />
        <div class="orbit orbit-inner stage-fade" :style="{ '--stage-order': 2 }" />

        <div class="universe-core stage-subitem" :style="{ '--stage-order': 3 }">
          <span>Core System</span>
          <strong>{{ skills.core }}</strong>
          <p>{{ skills.coreNote }}</p>
        </div>

        <div
          v-for="(node, index) in skills.nodes"
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
