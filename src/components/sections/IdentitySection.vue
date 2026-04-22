<script setup>
import { computed, reactive, ref } from "vue";
import SectionHeading from "../SectionHeading.vue";
import Staged from "../Staged.vue";

const MAX_ROW_SHIFT = 12;

const props = defineProps({
  deconstruction: {
    type: Object,
    required: true
  }
});

const activeRowId = ref(null);
const rowShifts = reactive({});

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const rows = computed(() =>
  props.deconstruction.cards.map((item, index, source) => ({
    ...item,
    rowId: `${item.letter}-${index}`,
    rowProgress: (1 - index / Math.max(source.length - 1, 1)).toFixed(3)
  }))
);

const identityLetters = computed(() => props.deconstruction.cards.map((item) => item.letter).join(""));

// 记录当前聚焦的行，用来控制其余行的降亮状态。
const activateRow = (rowId) => {
  activeRowId.value = rowId;
};

const resetRowShift = (rowId) => {
  rowShifts[rowId] = "0px";
};

const releaseRow = (rowId) => {
  if (activeRowId.value === rowId) {
    activeRowId.value = null;
  }

  resetRowShift(rowId);
};

// 根据鼠标在当前行内的水平位置，生成轻微的横向视差偏移。
const handleRowPointerMove = (rowId, event) => {
  const rowBounds = event.currentTarget.getBoundingClientRect();
  const progress = (event.clientX - rowBounds.left) / rowBounds.width - 0.5;
  const shift = clamp(progress * MAX_ROW_SHIFT * 2, -MAX_ROW_SHIFT, MAX_ROW_SHIFT);

  activateRow(rowId);
  rowShifts[rowId] = `${shift.toFixed(2)}px`;
};

const handleRowFocusOut = (rowId, event) => {
  if (event.currentTarget.contains(event.relatedTarget)) {
    return;
  }

  releaseRow(rowId);
};

const handleRowPointerLeave = (rowId, event) => {
  if (event.currentTarget.contains(document.activeElement)) {
    resetRowShift(rowId);
    return;
  }

  releaseRow(rowId);
};

const getRowStyle = (row) => ({
  "--row-progress": row.rowProgress,
  "--row-shift": rowShifts[row.rowId] ?? "0px"
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
          @mouseenter="activateRow(item.rowId)"
          @mousemove="handleRowPointerMove(item.rowId, $event)"
          @mouseleave="handleRowPointerLeave(item.rowId, $event)"
          @focusin="activateRow(item.rowId)"
          @focusout="handleRowFocusOut(item.rowId, $event)"
        >
          <span class="name-letter-shell" tabindex="0" :aria-label="`${item.letter} / ${item.zh}`">
            <span class="name-letter-flip" aria-hidden="true">
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
