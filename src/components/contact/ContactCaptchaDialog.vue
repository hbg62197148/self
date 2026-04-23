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
  }
});

const emit = defineEmits(["close", "submit", "refresh", "editing"]);

const answer = ref("");
const isInputFocused = ref(false);

const title = computed(() => {
  if (!props.pendingItem) {
    return "联系方式验证";
  }

  return `${props.pendingItem.label} 验证`;
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
              <p class="admin-kicker">Human Check</p>
              <h2>{{ title }}</h2>
              <p class="admin-subtitle">为了避免前台联系方式被随意抓取，请先完成一次验证码校验。</p>
            </div>

            <div class="contact-guard-challenge">
              <span>验证码</span>
              <strong>{{ challengePrompt || "正在生成..." }}</strong>
            </div>

            <label class="admin-field">
              <span>输入结果</span>
              <input
                v-model="answer"
                class="admin-input"
                type="text"
                inputmode="numeric"
                placeholder="请输入上方验证码结果"
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
                换一个验证码
              </button>
              <button type="button" class="button button-secondary" :disabled="submitting" @click="$emit('close')">
                取消
              </button>
              <button type="button" class="button button-primary" :disabled="submitting || !challengePrompt" @click="submitAnswer">
                {{ submitting ? "验证中..." : "确认继续" }}
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>
  </Teleport>
</template>
