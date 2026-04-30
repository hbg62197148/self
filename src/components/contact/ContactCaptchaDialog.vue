<script setup>
import { computed, ref, watch } from "vue";
import ContactGuardMascot from "./ContactGuardMascot.vue";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  challengePrompt: {
    type: String,
    default: ""
  },
  pendingItem: {
    type: Object,
    default: null
  },
  submitting: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ""
  },
  guardMood: {
    type: String,
    default: "confused"
  },
  copy: {
    type: Object,
    default: () => ({
      emptyTitle: "联系方式验证",
      titleSuffix: "验证",
      titleSeparator: "",
      kicker: "Human Check",
      subtitle: "为了避免前台联系方式被随意抓取，请先完成一次验证码校验。",
      challengeLabel: "验证码",
      loading: "正在生成...",
      inputLabel: "输入结果",
      placeholder: "请输入上方验证码结果",
      refresh: "换一个验证码",
      cancel: "取消",
      submit: "确认继续",
      submitting: "验证中..."
    })
  }
});

const emit = defineEmits(["close", "submit", "refresh", "editing"]);

const answer = ref("");
const isInputFocused = ref(false);

const title = computed(() => {
  if (!props.pendingItem) {
    return props.copy.emptyTitle;
  }

  return `${props.pendingItem.displayLabel ?? props.pendingItem.label}${props.copy.titleSeparator ?? " "}${props.copy.titleSuffix}`;
});

const answerLength = computed(() => answer.value.trim().length);

// 弹窗每次打开时都清空输入，并把角色状态放回初始观察位。
watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      answer.value = "";
      isInputFocused.value = false;
    }
  }
);

// 刷新验证码后同步清空答案，避免旧输入和新题面混在一起。
watch(
  () => props.challengePrompt,
  (nextPrompt, previousPrompt) => {
    if (props.visible && nextPrompt !== previousPrompt) {
      answer.value = "";
    }
  }
);

const notifyEditing = () => {
  emit("editing");
};

const handleInputFocus = () => {
  isInputFocused.value = true;
  notifyEditing();
};

const handleInputBlur = () => {
  isInputFocused.value = false;
};

const handleInput = () => {
  notifyEditing();
};

const submitAnswer = () => {
  emit("submit", answer.value);
};
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="contact-guard-backdrop" @click.self="$emit('close')">
      <article class="contact-guard-card panel">
        <div class="contact-guard-layout">
          <ContactGuardMascot
            :mood="guardMood"
            :input-focused="isInputFocused"
            :answer-length="answerLength"
          />

          <div class="contact-guard-panel">
            <div class="contact-guard-head">
              <p class="admin-kicker">{{ copy.kicker }}</p>
              <h2>{{ title }}</h2>
              <p class="admin-subtitle">{{ copy.subtitle }}</p>
            </div>

            <div class="contact-guard-challenge">
              <span>{{ copy.challengeLabel }}</span>
              <strong>{{ challengePrompt || copy.loading }}</strong>
            </div>

            <label class="admin-field">
              <span>{{ copy.inputLabel }}</span>
              <input
                v-model="answer"
                class="admin-input"
                type="text"
                inputmode="numeric"
                :placeholder="copy.placeholder"
                :disabled="submitting || !challengePrompt"
                @focus="handleInputFocus"
                @click="notifyEditing"
                @blur="handleInputBlur"
                @input="handleInput"
                @keyup.enter="submitAnswer"
              >
            </label>

            <p v-if="errorMessage" class="admin-feedback is-error">
              {{ errorMessage }}
            </p>

            <div class="admin-toolbar">
              <button type="button" class="button button-secondary" :disabled="submitting" @click="$emit('refresh')">
                {{ copy.refresh }}
              </button>
              <button type="button" class="button button-secondary" :disabled="submitting" @click="$emit('close')">
                {{ copy.cancel }}
              </button>
              <button type="button" class="button button-primary" :disabled="submitting || !challengePrompt" @click="submitAnswer">
                {{ submitting ? copy.submitting : copy.submit }}
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>
  </Teleport>
</template>
