<script setup>
import { reactive, ref } from "vue";
import { RouterLink } from "vue-router";

const props = defineProps({
  submitting: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ""
  }
});

const emit = defineEmits(["submit"]);

const credentials = reactive({
  username: "",
  password: ""
});
const localError = ref("");

const submitLogin = () => {
  // 登录前先做基础校验，避免空表单直接发请求。
  if (!credentials.username.trim() || !credentials.password.trim()) {
    localError.value = "请输入账号和密码。";
    return;
  }

  localError.value = "";
  emit("submit", {
    username: credentials.username.trim(),
    password: credentials.password
  });
};
</script>

<template>
  <div class="admin-auth-shell">
    <article class="admin-login-card panel">
      <div class="admin-login-copy">
        <p class="admin-kicker">Content Admin</p>
        <h1>后台登录</h1>
        <p class="admin-subtitle">输入正确的账号和密码后，才能进入内容管理后台。</p>
      </div>

      <form class="admin-login-form" @submit.prevent="submitLogin">
        <label class="admin-field">
          <span>账号</span>
          <input
            v-model="credentials.username"
            class="admin-input"
            type="text"
            autocomplete="username"
            placeholder="请输入后台账号"
          >
        </label>

        <label class="admin-field">
          <span>密码</span>
          <input
            v-model="credentials.password"
            class="admin-input"
            type="password"
            autocomplete="current-password"
            placeholder="请输入后台密码"
          >
        </label>

        <p v-if="localError || errorMessage" class="admin-feedback is-error">
          {{ localError || errorMessage }}
        </p>

        <div class="admin-toolbar">
          <button type="submit" class="button button-primary" :disabled="submitting">
            {{ submitting ? "登录中..." : "登录后台" }}
          </button>
          <RouterLink class="button button-secondary" to="/">返回前台</RouterLink>
        </div>
      </form>
    </article>
  </div>
</template>
