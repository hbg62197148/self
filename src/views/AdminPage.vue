<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import AdminAboutEditor from "../components/admin/AdminAboutEditor.vue";
import AdminContactEditor from "../components/admin/AdminContactEditor.vue";
import AdminHeroEditor from "../components/admin/AdminHeroEditor.vue";
import AdminIdentityEditor from "../components/admin/AdminIdentityEditor.vue";
import AdminLoginForm from "../components/admin/AdminLoginForm.vue";
import AdminPanel from "../components/admin/AdminPanel.vue";
import AdminProjectsEditor from "../components/admin/AdminProjectsEditor.vue";
import AdminQuestionsEditor from "../components/admin/AdminQuestionsEditor.vue";
import AdminSkillsEditor from "../components/admin/AdminSkillsEditor.vue";
import AdminValidationSummary from "../components/admin/AdminValidationSummary.vue";
import { useProfileContent } from "../composables/useProfileContent";
import { fetchAdminSession, loginAdmin, logoutAdmin } from "../services/adminAuthApi";
import { saveProfile } from "../services/profileApi";
import { validateProfileDraft } from "../utils/profileValidation";

const cloneContent = (value) => JSON.parse(JSON.stringify(value));

const sectionLinks = [
  { id: "basic", label: "首页资料" },
  { id: "identity", label: "身份拆解" },
  { id: "about", label: "个人介绍" },
  { id: "questions", label: "问答区" },
  { id: "skills", label: "技能宇宙" },
  { id: "projects", label: "项目章节" },
  { id: "contact", label: "联系信息" }
];

const { profile, loading, loadProfile } = useProfileContent();
const draft = ref(cloneContent(profile.value));
const saving = ref(false);
const loggingIn = ref(false);
const checkingSession = ref(true);
const isAuthenticated = ref(false);
const authMessage = ref("");
const saveState = ref("idle");
const saveMessage = ref("");
const validationErrors = ref([]);

watch(
  profile,
  (nextProfile) => {
    draft.value = cloneContent(nextProfile);
  },
  { immediate: true }
);

const updatedAt = computed(() => {
  const value = profile.value.meta?.updatedAt;

  if (!value) {
    return "尚未发布";
  }

  return new Date(value).toLocaleString("zh-CN", {
    hour12: false
  });
});

const ensureAdminSession = async () => {
  checkingSession.value = true;

  try {
    await fetchAdminSession();
    isAuthenticated.value = true;
    authMessage.value = "";
  } catch {
    isAuthenticated.value = false;
  } finally {
    checkingSession.value = false;
  }
};

const submitLogin = async (credentials) => {
  loggingIn.value = true;
  authMessage.value = "";

  try {
    await loginAdmin(credentials);
    isAuthenticated.value = true;
    await loadProfile();
  } catch (error) {
    authMessage.value = error instanceof Error ? error.message : "登录失败，请稍后重试。";
    isAuthenticated.value = false;
  } finally {
    loggingIn.value = false;
  }
};

const submitLogout = async () => {
  await logoutAdmin();
  isAuthenticated.value = false;
  authMessage.value = "";
  saveMessage.value = "";
  saveState.value = "idle";
  validationErrors.value = [];
};

const resetDraft = () => {
  draft.value = cloneContent(profile.value);
  saveState.value = "idle";
  saveMessage.value = "";
  validationErrors.value = [];
};

const publishContent = async () => {
  const nextValidationErrors = validateProfileDraft(draft.value);
  validationErrors.value = nextValidationErrors;

  if (nextValidationErrors.length > 0) {
    saveState.value = "error";
    saveMessage.value = `还有 ${nextValidationErrors.length} 处内容需要修正后才能发布。`;
    return;
  }

  saving.value = true;
  saveState.value = "idle";
  saveMessage.value = "";

  try {
    const savedProfile = await saveProfile(draft.value);
    profile.value = cloneContent(savedProfile);
    draft.value = cloneContent(savedProfile);
    saveState.value = "success";
    saveMessage.value = "内容已发布，前台会自动读取最新版本。";
    validationErrors.value = [];
  } catch (error) {
    saveState.value = "error";
    saveMessage.value = error instanceof Error ? error.message : "保存失败，请稍后重试。";

    if (error instanceof Error && error.status === 401) {
      isAuthenticated.value = false;
      authMessage.value = "登录状态已失效，请重新登录后台。";
    }
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  // 后台页面打开时先确认登录状态，未登录则只显示登录入口。
  ensureAdminSession();
});
</script>

<template>
  <div class="admin-page">
    <div v-if="checkingSession" class="admin-auth-shell">
      <article class="admin-login-card panel">
        <p class="admin-kicker">Content Admin</p>
        <h1>检查登录状态中...</h1>
        <p class="admin-subtitle">正在确认你是否已经登录后台。</p>
      </article>
    </div>

    <AdminLoginForm
      v-else-if="!isAuthenticated"
      :submitting="loggingIn"
      :error-message="authMessage"
      @submit="submitLogin"
    />

    <div v-else class="admin-shell">
      <header class="admin-header panel">
        <div>
          <p class="admin-kicker">Content Admin</p>
          <h1>内容管理后台</h1>
          <p class="admin-subtitle">在这里维护个人介绍、技能、项目和联系信息，发布后前台会自动拉取最新内容。</p>
        </div>

        <div class="admin-header-actions">
          <div class="admin-status" :class="[`is-${saveState}`]">
            <strong>最近发布</strong>
            <span>{{ updatedAt }}</span>
          </div>

          <div class="admin-toolbar">
            <button type="button" class="button button-secondary" :disabled="loading || saving" @click="loadProfile()">
              重新读取
            </button>
            <button type="button" class="button button-secondary" :disabled="loading || saving" @click="resetDraft">
              撤销未发布改动
            </button>
            <button type="button" class="button button-primary" :disabled="loading || saving" @click="publishContent">
              {{ saving ? "发布中..." : "发布内容" }}
            </button>
            <button type="button" class="button button-secondary" @click="submitLogout">
              退出登录
            </button>
            <RouterLink class="button button-secondary" to="/">返回前台</RouterLink>
          </div>
        </div>
      </header>

      <p v-if="saveMessage" class="admin-feedback" :class="[`is-${saveState}`]">
        {{ saveMessage }}
      </p>

      <AdminValidationSummary :errors="validationErrors" />

      <div class="admin-layout">
        <aside class="admin-sidebar panel-inset">
          <strong>编辑目录</strong>
          <nav class="admin-anchor-list">
            <a v-for="item in sectionLinks" :key="item.id" :href="`#${item.id}`">
              {{ item.label }}
            </a>
          </nav>
        </aside>

        <main class="admin-content">
          <AdminPanel id="basic" title="首页资料" description="这里管理站点基础信息和首屏文案。">
            <AdminHeroEditor :model="draft" />
          </AdminPanel>

          <AdminPanel id="identity" title="身份拆解" description="维护身份拆解区的标题、副文案和卡片内容。">
            <AdminIdentityEditor :model="draft.deconstruction" />
          </AdminPanel>

          <AdminPanel id="about" title="个人介绍" description="编辑关于我、段落简介、摘要标签和快速信息。">
            <AdminAboutEditor :model="draft.about" />
          </AdminPanel>

          <AdminPanel id="questions" title="问答区" description="维护互动问答区的问题和答案内容。">
            <AdminQuestionsEditor :model="draft.questions" />
          </AdminPanel>

          <AdminPanel id="skills" title="技能宇宙" description="编辑技能核心说明、节点与能力分组。">
            <AdminSkillsEditor :model="draft.skills" />
          </AdminPanel>

          <AdminPanel id="projects" title="项目章节" description="新增、排序并编辑项目卡片与详情内容。">
            <AdminProjectsEditor :model="draft.projects" />
          </AdminPanel>

          <AdminPanel id="contact" title="联系信息" description="维护联系区标题、说明和联系卡片。">
            <AdminContactEditor :model="draft.contact" />
          </AdminPanel>
        </main>
      </div>
    </div>
  </div>
</template>
