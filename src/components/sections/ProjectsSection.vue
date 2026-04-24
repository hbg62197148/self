<script setup>
import { ref, watch } from "vue";
import { useProjectPanelMotion } from "../../composables/useProjectPanelMotion";
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

const resolveProject = (projectId) =>
  props.projects.items.find((item) => item.id === projectId) ?? props.projects.items[0] ?? null;

const displayedProject = ref(resolveProject(props.activeProjectId));
const { detailPanelRef, detailSwapRef, switchProject } = useProjectPanelMotion(displayedProject);

let pendingTabElement = null;

// 左侧项目标签负责驱动右侧详情面板切换，并把点击来源交给 GSAP 做 showcase 过渡。
const selectProject = (projectId, event) => {
  pendingTabElement = event?.currentTarget ?? null;
  emit("update:activeProjectId", projectId);
};

watch(
  () => props.activeProjectId,
  (nextId) => {
    const nextProject = resolveProject(nextId);

    if (!nextProject || nextProject.id === displayedProject.value?.id) {
      return;
    }

    const sourceElement = pendingTabElement;
    pendingTabElement = null;
    switchProject(nextProject, sourceElement);
  }
);

watch(
  () => props.projects.items,
  (items) => {
    const nextProject = resolveProject(props.activeProjectId);

    if (!nextProject) {
      displayedProject.value = null;
      return;
    }

    if (!displayedProject.value || !items.some((item) => item.id === displayedProject.value.id)) {
      displayedProject.value = nextProject;
    }
  }
);
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
          :aria-pressed="item.id === activeProjectId"
          :class="['project-tab', { 'is-active': item.id === activeProjectId }]"
          :order="2 + index"
          @click="selectProject(item.id, $event)"
        >
          <span class="project-index">{{ item.index }}</span>
          <div class="project-tab-copy">
            <small>{{ item.category }}</small>
            <strong>{{ item.title }}</strong>
            <p>{{ item.subtitle }}</p>
          </div>
        </Staged>
      </div>

      <article ref="detailPanelRef" class="project-detail panel-inset stage-item" :style="{ '--stage-order': 6 }">
        <div
          v-if="displayedProject"
          ref="detailSwapRef"
          :key="displayedProject.id"
          class="project-detail-swap"
        >
          <div class="project-detail-head">
            <div>
              <p class="mini-label">{{ displayedProject.category }}</p>
              <h3>{{ displayedProject.title }}</h3>
            </div>
            <span class="detail-index">{{ displayedProject.index }}</span>
          </div>

          <p class="project-description">{{ displayedProject.description }}</p>

          <div class="signal-grid">
            <article
              v-for="(item, index) in displayedProject.signals"
              :key="item.label"
              class="signal-card signal-card-project"
              :style="{ '--signal-order': index }"
            >
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </article>
          </div>

          <div class="stack-row">
            <span v-for="item in displayedProject.stack" :key="item" class="tag-chip">
              {{ item }}
            </span>
          </div>

          <div class="detail-list">
            <p v-for="item in displayedProject.details" :key="item">
              {{ item }}
            </p>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
