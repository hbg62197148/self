<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import AdminAboutEditor from "../components/admin/AdminAboutEditor.vue";
import AdminContactEditor from "../components/admin/AdminContactEditor.vue";
import AdminHeroEditor from "../components/admin/AdminHeroEditor.vue";
import AdminIdentityEditor from "../components/admin/AdminIdentityEditor.vue";
import AdminLoginForm from "../components/admin/AdminLoginForm.vue";
import AdminPanel from "../components/admin/AdminPanel.vue";
import AdminPasswordEditor from "../components/admin/AdminPasswordEditor.vue";
import AdminProjectsEditor from "../components/admin/AdminProjectsEditor.vue";
import AdminQuestionsEditor from "../components/admin/AdminQuestionsEditor.vue";
import AdminSkillsEditor from "../components/admin/AdminSkillsEditor.vue";
import AdminValidationSummary from "../components/admin/AdminValidationSummary.vue";
import { useProfileContent } from "../composables/useProfileContent";
import { changeAdminPassword, fetchAdminSession, loginAdmin, logoutAdmin } from "../services/adminAuthApi";
import { fetchDraftProfile, fetchProfileVersions, publishProfile, saveDraftProfile } from "../services/profileApi";
import { validateProfileDraft } from "../utils/profileValidation";

const cloneContent = (value) => JSON.parse(JSON.stringify(value));

const sectionLinks = [
  { id: "basic", label: "首页资料" },
  { id: "identity", label: "身份拆解" },
  { id: "about", label: "个人介绍" },
  { id: "questions", label: "问答区" },
  { id: "skills", label: "技能宇宙" },
  { id: "projects", label: "项目章节" },
  { id: "contact", label: "联系信息" },
  { id: "security", label: "账号安全" }
];

const { profile, loading, loadProfile } = useProfileContent();
const draft = ref(cloneContent(profile.value));
const lastLoadedDraft = ref(cloneContent(profile.value));
const draftLoaded = ref(false);
const saving = ref(false);
const savingAction = ref("");
const loadingAdminContent = ref(false);
const changingPassword = ref(false);
const loggingIn = ref(false);
const checkingSession = ref(true);
const isAuthenticated = ref(false);
const loginFormRef = ref(null);
const authMessage = ref("");
const authNotice = ref("");
const saveState = ref("idle");
const saveMessage = ref("");
const passwordState = ref("idle");
const passwordMessage = ref("");
const validationErrors = ref([]);
const versions = ref([]);

watch(
  profile,
  (nextProfile) => {
    if (!draftLoaded.value) {
      const nextDraft = cloneContent(nextProfile);
      draft.value = nextDraft;
      lastLoadedDraft.value = cloneContent(nextDraft);
    }
  },
  { immediate: true }
);

const isSavingDraft = computed(() => savingAction.value === "draft");
const isPublishing = computed(() => savingAction.value === "publish");

const updatedAt = computed(() => {
  const value = profile.value.meta?.updatedAt;

  if (!value) {
    return "尚未发布";
  }

  return new Date(value).toLocaleString("zh-CN", {
    hour12: false
  });
});

const applyDraft = (nextDraft) => {
  const clonedDraft = cloneContent(nextDraft);
  draft.value = clonedDraft;
  lastLoadedDraft.value = cloneContent(clonedDraft);
  draftLoaded.value = true;
};

const loadDraft = async () => {
  draftLoaded.value = true;
  const [nextDraft, nextVersions] = await Promise.all([fetchDraftProfile(), fetchProfileVersions()]);
  applyDraft(nextDraft);
  versions.value = nextVersions;
};

const loadAdminContent = async () => {
  loadingAdminContent.value = true;

  try {
    await Promise.all([loadProfile(), loadDraft()]);
  } finally {
    loadingAdminContent.value = false;
  }
};

const handleExpiredSession = (error) => {
  if (error instanceof Error && error.status === 401) {
    isAuthenticated.value = false;
    authMessage.value = "登录状态已失效，请重新登录后台。";
    return true;
  }

  return false;
};

const reloadAdminContent = async () => {
  saveState.value = "idle";
  saveMessage.value = "";

  try {
    await loadAdminContent();
  } catch (error) {
    if (handleExpiredSession(error)) return;

    saveState.value = "error";
    saveMessage.value = error instanceof Error ? error.message : "重新读取内容失败。";
  }
};

const ensureAdminSession = async () => {
  checkingSession.value = true;

  try {
    await fetchAdminSession();
    isAuthenticated.value = true;
    authMessage.value = "";
    await loadAdminContent();
  } catch (error) {
    if (error instanceof Error && error.status !== 401 && isAuthenticated.value) {
      saveState.value = "error";
      saveMessage.value = error.message;
    } else {
      isAuthenticated.value = false;
    }
  } finally {
    checkingSession.value = false;
  }
};

const submitLogin = async (credentials) => {
  loggingIn.value = true;
  authMessage.value = "";
  authNotice.value = "";

  try {
    await loginAdmin(credentials);
    await loadAdminContent();
    await loginFormRef.value?.playSuccessExit?.();
    isAuthenticated.value = true;
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
  authNotice.value = "";
  saveMessage.value = "";
  saveState.value = "idle";
  passwordMessage.value = "";
  passwordState.value = "idle";
  validationErrors.value = [];
  versions.value = [];
  draftLoaded.value = false;
  lastLoadedDraft.value = cloneContent(profile.value);
  draft.value = cloneContent(profile.value);
};

const resetDraft = () => {
  draft.value = cloneContent(lastLoadedDraft.value);
  saveState.value = "idle";
  saveMessage.value = "";
  validationErrors.value = [];
};

const saveDraft = async () => {
  saving.value = true;
  savingAction.value = "draft";
  saveState.value = "idle";
  saveMessage.value = "";

  try {
    const savedDraft = await saveDraftProfile(draft.value);
    applyDraft(savedDraft);
    saveState.value = "success";
    saveMessage.value = "草稿已保存，前台暂不会更新。";
    versions.value = await fetchProfileVersions();
  } catch (error) {
    if (handleExpiredSession(error)) return;

    saveState.value = "error";
    saveMessage.value = error instanceof Error ? error.message : "保存草稿失败。";
  } finally {
    saving.value = false;
    savingAction.value = "";
  }
};

const submitPasswordChange = async (passwords) => {
  changingPassword.value = true;
  passwordState.value = "idle";
  passwordMessage.value = "";

  try {
    await changeAdminPassword(passwords);
    authNotice.value = "密码已修改，请使用新密码重新登录。";
    authMessage.value = "";
    isAuthenticated.value = false;
    validationErrors.value = [];
    saveMessage.value = "";
    saveState.value = "idle";
    passwordState.value = "success";
    passwordMessage.value = "密码已修改。";
  } catch (error) {
    if (handleExpiredSession(error)) return;

    passwordState.value = "error";
    passwordMessage.value = error instanceof Error ? error.message : "修改密码失败，请稍后重试。";
  } finally {
    changingPassword.value = false;
  }
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
  savingAction.value = "publish";
  saveState.value = "idle";
  saveMessage.value = "";

  try {
    const publishedProfile = await publishProfile(draft.value);
    profile.value = cloneContent(publishedProfile);
    applyDraft(publishedProfile);
    saveState.value = "success";
    saveMessage.value = "内容已发布，前台会读取最新发布版本。";
    validationErrors.value = [];
    versions.value = await fetchProfileVersions();
  } catch (error) {
    if (handleExpiredSession(error)) return;

    saveState.value = "error";
    saveMessage.value = error instanceof Error ? error.message : "发布失败，请稍后重试。";
  } finally {
    saving.value = false;
    savingAction.value = "";
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
      ref="loginFormRef"
      :submitting="loggingIn"
      :error-message="authMessage"
      :notice-message="authNotice"
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
            <span>历史版本 {{ versions.length }} 条</span>
          </div>

          <div class="admin-toolbar">
            <button
              type="button"
              class="button button-secondary"
              :disabled="loading || loadingAdminContent || saving"
              @click="reloadAdminContent"
            >
              重新读取
            </button>
            <button
              type="button"
              class="button button-secondary"
              :disabled="loading || loadingAdminContent || saving"
              @click="resetDraft"
            >
              撤销未发布改动
            </button>
            <button
              type="button"
              class="button button-secondary"
              :disabled="loading || loadingAdminContent || saving"
              @click="saveDraft"
            >
              {{ isSavingDraft ? "保存中..." : "保存草稿" }}
            </button>
            <button
              type="button"
              class="button button-primary"
              :disabled="loading || loadingAdminContent || saving"
              @click="publishContent"
            >
              {{ isPublishing ? "发布中..." : "发布内容" }}
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

          <AdminPanel id="security" title="账号安全" description="修改后台登录密码，修改成功后需要重新登录。">
            <AdminPasswordEditor
              :submitting="changingPassword"
              :state="passwordState"
              :message="passwordMessage"
              @submit="submitPasswordChange"
            />
          </AdminPanel>
        </main>
      </div>
    </div>
  </div>
</template>
