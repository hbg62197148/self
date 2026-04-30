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
    <div class="project-detail-head">
      <div>
        <p class="mini-label">{{ project.category }}</p>
        <h3>{{ project.title }}</h3>
      </div>
      <span class="detail-index">{{ project.index }}</span>
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
