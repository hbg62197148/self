<script setup>
defineProps({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  }
});
</script>

<template>
  <section :id="id" class="admin-panel panel">
    <header class="admin-panel-head">
      <div>
        <p class="admin-kicker">{{ id }}</p>
        <h2>{{ title }}</h2>
      </div>
      <p class="admin-panel-copy">{{ description }}</p>
    </header>

    <div class="admin-panel-body">
      <slot />
    </div>
  </section>
</template>
