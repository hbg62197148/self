<script setup>
import { ref, watch } from "vue";
import { useProjectPanelMotion } from "../../composables/useProjectPanelMotion";
import ProjectDetailContent from "./ProjectDetailContent.vue";
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
const expandedProjectId = ref("");
const { detailPanelRef, detailSwapRef, switchProject } = useProjectPanelMotion(displayedProject);

let pendingTabElement = null;

// 左侧项目标签负责驱动右侧详情面板切换，并把点击来源交给 GSAP 做 showcase 过渡。
const selectProject = (projectId, event) => {
  pendingTabElement = event?.currentTarget ?? null;
  expandedProjectId.value = expandedProjectId.value === projectId ? "" : projectId;
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

    if (!items.some((item) => item.id === expandedProjectId.value)) {
      expandedProjectId.value = "";
    }

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
        <template v-for="(item, index) in projects.items" :key="item.id">
          <Staged
            as="button"
            type="button"
            :aria-pressed="item.id === activeProjectId"
            :aria-expanded="expandedProjectId === item.id"
            :aria-controls="`project-accordion-${item.id}`"
            :class="[
              'project-tab',
              {
                'is-active': item.id === activeProjectId,
                'is-expanded': expandedProjectId === item.id
              }
            ]"
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

          <Transition name="project-accordion">
            <article
              v-if="expandedProjectId === item.id"
              :id="`project-accordion-${item.id}`"
              class="project-accordion-detail panel-inset"
            >
              <ProjectDetailContent :project="item" />
            </article>
          </Transition>
        </template>
      </div>

      <article ref="detailPanelRef" class="project-detail panel-inset stage-item" :style="{ '--stage-order': 6 }">
        <div
          v-if="displayedProject"
          ref="detailSwapRef"
          :key="displayedProject.id"
          class="project-detail-swap"
        >
          <ProjectDetailContent :project="displayedProject" />
        </div>
      </article>
    </div>
  </section>
</template>
