<script setup>
import { RouterLink } from "vue-router";

defineProps({
  navItems: {
    type: Array,
    default: () => []
  },
  activeSection: {
    type: String,
    default: "home"
  }
});
</script>

<template>
  <header class="site-header">
    <a class="brand" href="#home">
      <span class="brand-mark">PI</span>
      <span class="brand-copy">
        <strong>Personal Issue</strong>
        <small>个人专刊</small>
      </span>
    </a>

    <nav class="site-nav" aria-label="页面导航">
      <a
        v-for="item in navItems"
        :key="item.id"
        class="nav-link"
        :class="{ 'is-active': activeSection === item.id }"
        :href="`#${item.id}`"
      >
        {{ item.label }}
      </a>

      <RouterLink class="nav-link" to="/admin">
        后台
      </RouterLink>
    </nav>
  </header>
</template>
