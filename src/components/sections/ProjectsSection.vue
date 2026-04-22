<script setup>
import { computed } from "vue";
import SectionHeading from "../SectionHeading.vue";
import Staged from "../Staged.vue";

const props = defineProps({
  projects: {
    type: Object,
    required: true
  },
  activeProjectId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(["update:activeProjectId"]);

const activeProject = computed(
  () => props.projects.items.find((item) => item.id === props.activeProjectId) ?? props.projects.items[0]
);

// 让左侧项目标签驱动右侧粘性详情面板。
const selectProject = (projectId) => {
  emit("update:activeProjectId", projectId);
};
</script>

<template>
  <section class="section panel" id="projects" data-reveal>
    <SectionHeading
      :issue="projects.issue"
      :title="projects.title"
      :copy="projects.copy"
    />

    <div class="projects-layout">
      <div class="project-list">
        <Staged
          v-for="(item, index) in projects.items"
          :key="item.id"
          as="button"
          type="button"
          :class="['project-tab', { 'is-active': item.id === activeProjectId }]"
          :order="2 + index"
          @click="selectProject(item.id)"
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
</template>
