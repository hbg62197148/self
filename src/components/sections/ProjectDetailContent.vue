<script setup>
defineProps({
  project: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <div class="project-detail-content">
    <div class="project-preview" :style="{ '--project-tone-step': project.index }" aria-hidden="true">
      <div class="project-preview-window">
        <span class="project-preview-browser-bar" />
        <div class="project-preview-hero">
          <span class="project-preview-kicker">{{ project.category }}</span>
          <strong>{{ project.index }}</strong>
        </div>
        <div class="project-preview-grid">
          <span v-for="item in project.signals" :key="item.label" />
        </div>
      </div>
      <div class="project-preview-panel project-preview-panel-a" />
      <div class="project-preview-panel project-preview-panel-b" />
    </div>

    <p class="project-description">{{ project.description }}</p>

    <div class="signal-grid">
      <article
        v-for="(item, index) in project.signals"
        :key="item.label"
        class="signal-card signal-card-project"
        :style="{ '--signal-order': index }"
      >
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </article>
    </div>

    <div class="stack-row">
      <span v-for="item in project.stack" :key="item" class="tag-chip">
        {{ item }}
      </span>
    </div>

    <div class="detail-list">
      <p v-for="item in project.details" :key="item">
        {{ item }}
      </p>
    </div>
  </div>
</template>
