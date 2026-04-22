<script setup>
import { computed } from "vue";
import SectionHeading from "../SectionHeading.vue";
import Staged from "../Staged.vue";

const props = defineProps({
  deconstruction: {
    type: Object,
    required: true
  }
});

const identityLetters = computed(() => props.deconstruction.cards.map((item) => item.letter).join(""));
</script>

<template>
  <section class="section panel" id="identity" data-reveal>
    <SectionHeading
      :issue="deconstruction.issue"
      :title="deconstruction.title"
      :copy="deconstruction.copy"
    />

    <div class="identity-shell">
      <div class="name-stack" :aria-label="`${identityLetters} breakdown`">
        <span class="name-ghost" aria-hidden="true">
          <span
            v-for="item in deconstruction.cards"
            :key="`ghost-${item.letter}-${item.word}`"
            class="name-ghost-letter"
          >
            {{ item.letter }}
          </span>
        </span>

        <Staged
          v-for="(item, index) in deconstruction.cards"
          :key="item.letter + item.word"
          as="div"
          class="name-row"
          :order="2 + index"
          :style="{
            '--row-progress': (1 - index / Math.max(deconstruction.cards.length - 1, 1)).toFixed(3)
          }"
        >
          <span class="name-letter-shell" tabindex="0">
            <span class="name-letter">{{ item.letter }}</span>
            <span class="name-letter-overlay" aria-hidden="true">
              {{ item.zh }}
            </span>
          </span>

          <div class="name-copy">
            <em>{{ item.word }}</em>
            <small class="name-translation">{{ item.zh }}</small>
            <p>{{ item.text }}</p>
          </div>
        </Staged>
      </div>
    </div>
  </section>
</template>
