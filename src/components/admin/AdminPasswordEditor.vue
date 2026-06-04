<script setup>
import { reactive, ref } from "vue";

defineProps({
  submitting: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: ""
  },
  state: {
    type: String,
    default: "idle"
  }
});

const emit = defineEmits(["submit"]);

const form = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
});
const localError = ref("");

const resetForm = () => {
  form.currentPassword = "";
  form.newPassword = "";
  form.confirmPassword = "";
  localError.value = "";
};

const submitPassword = () => {
  if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
    localError.value = "请完整填写当前密码、新密码和确认密码。";
    return;
  }

  if (form.newPassword.length < 8) {
    localError.value = "新密码至少需要 8 位。";
    return;
  }

  if (form.currentPassword === form.newPassword) {
    localError.value = "新密码不能和当前密码相同。";
    return;
  }

  if (form.newPassword !== form.confirmPassword) {
    localError.value = "两次输入的新密码不一致。";
    return;
  }

  localError.value = "";
  emit("submit", {
    currentPassword: form.currentPassword,
    newPassword: form.newPassword
  });
};
</script>

<template>
  <form class="admin-stack" @submit.prevent="submitPassword" @reset.prevent="resetForm">
    <div class="admin-form-grid">
      <label class="admin-field">
        <span>当前密码</span>
        <input
          v-model="form.currentPassword"
          class="admin-input"
          type="password"
          autocomplete="current-password"
          placeholder="请输入当前密码"
        >
      </label>

      <label class="admin-field">
        <span>新密码</span>
        <input
          v-model="form.newPassword"
          class="admin-input"
          type="password"
          autocomplete="new-password"
          placeholder="至少 8 位"
        >
      </label>

      <label class="admin-field">
        <span>确认新密码</span>
        <input
          v-model="form.confirmPassword"
          class="admin-input"
          type="password"
          autocomplete="new-password"
          placeholder="再次输入新密码"
        >
      </label>
    </div>

    <p v-if="localError || message" class="admin-feedback" :class="[localError ? 'is-error' : `is-${state}`]">
      {{ localError || message }}
    </p>

    <div class="admin-toolbar">
      <button type="submit" class="button button-primary" :disabled="submitting">
        {{ submitting ? "修改中..." : "修改密码" }}
      </button>
      <button type="reset" class="button button-secondary" :disabled="submitting">
        清空
      </button>
    </div>
  </form>
</template>
