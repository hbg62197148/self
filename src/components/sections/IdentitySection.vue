<script setup>
import { computed, ref } from "vue";
import { useIdentityMotion } from "../../composables/useIdentityMotion";
import SectionHeading from "../SectionHeading.vue";
import Staged from "../Staged.vue";

const props = defineProps({
  deconstruction: {
    type: Object,
    required: true
  }
});

const activeRowId = ref(null);
const activeLetterId = ref(null);

const rows = computed(() =>
  props.deconstruction.cards.map((item, index, source) => ({
    ...item,
    rowId: `${item.letter}-${index}`,
    rowProgress: (1 - index / Math.max(source.length - 1, 1)).toFixed(3)
  }))
);

const identityLetters = computed(() => props.deconstruction.cards.map((item) => item.letter).join(""));

const {
  setRowRef,
  setShellRef,
  setCopyRef,
  setFlipRef,
  activateRow,
  handleRowPointerMove,
  handleRowPointerEnter,
  handleRowPointerLeave,
  handleRowFocusOut,
  activateLetter,
  releaseLetter
} = useIdentityMotion(activeRowId, activeLetterId);

const getRowStyle = (row) => ({
  "--row-progress": row.rowProgress
});
</script>

<template>
  <section class="section panel" id="identity" data-reveal>
    <SectionHeading
      :issue="deconstruction.issue"
      :title="deconstruction.title"
      :copy="deconstruction.copy"
    />

    <div class="identity-shell">
      <div :class="['name-stack', { 'is-focused': Boolean(activeRowId) }]" :aria-label="`${identityLetters} breakdown`">
        <span class="name-ghost" aria-hidden="true">
          <span
            v-for="item in rows"
            :key="`ghost-${item.rowId}`"
            class="name-ghost-letter"
          >
            {{ item.letter }}
          </span>
        </span>

        <Staged
          v-for="(item, index) in rows"
          :key="item.rowId"
          :ref="(element) => setRowRef(item.rowId, element)"
          as="div"
          :class="[
            'name-row',
            {
              'is-active': item.rowId === activeRowId,
              'is-dimmed': activeRowId && item.rowId !== activeRowId
            }
          ]"
          :order="2 + index"
          :style="getRowStyle(item)"
          @mouseenter="handleRowPointerEnter(item.rowId)"
          @mousemove="handleRowPointerMove(item.rowId, $event)"
          @mouseleave="handleRowPointerLeave(item.rowId, $event)"
          @focusin="activateRow(item.rowId)"
          @focusout="handleRowFocusOut(item.rowId, $event)"
        >
          <span
            :ref="(element) => setShellRef(item.rowId, element)"
            class="name-letter-shell"
            tabindex="0"
            :aria-label="`${item.letter} / ${item.zh}`"
            @mouseenter="activateLetter(item.rowId)"
            @mouseleave="releaseLetter(item.rowId)"
            @focus="activateLetter(item.rowId)"
            @blur="releaseLetter(item.rowId)"
          >
            <span
              :ref="(element) => setFlipRef(item.rowId, element)"
              class="name-letter-flip"
              aria-hidden="true"
            >
              <span class="name-letter-face name-letter-front">
                <span class="name-letter">{{ item.letter }}</span>
              </span>
              <span class="name-letter-face name-letter-back">
                <span class="name-letter-overlay">
                  {{ item.zh }}
                </span>
              </span>
            </span>
          </span>

          <div :ref="(element) => setCopyRef(item.rowId, element)" class="name-copy">
            <em>{{ item.word }}</em>
            <small class="name-translation">{{ item.zh }}</small>
            <p>{{ item.text }}</p>
          </div>
        </Staged>
      </div>
    </div>
  </section>
</template>
