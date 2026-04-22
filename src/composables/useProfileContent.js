import { onBeforeUnmount, onMounted, ref } from "vue";
import { defaultProfile } from "../data/profile";
import { fetchProfile } from "../services/profileApi";

const cloneContent = (value) => JSON.parse(JSON.stringify(value));

export function useProfileContent(options = {}) {
  const { pollMs = 0 } = options;

  const profile = ref(cloneContent(defaultProfile));
  const loading = ref(true);
  const syncing = ref(false);
  const errorMessage = ref("");
  let timerId = null;

  const loadProfile = async ({ silent = false } = {}) => {
    if (!silent) {
      loading.value = true;
    }

    syncing.value = true;

    try {
      profile.value = cloneContent(await fetchProfile());
      errorMessage.value = "";
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : "内容加载失败";
    } finally {
      loading.value = false;
      syncing.value = false;
    }
  };

  onMounted(() => {
    // 页面启动后优先读取后台内容，不再依赖打包时的静态数据。
    loadProfile();

    if (pollMs > 0) {
      // 后台发布后，前台会定时拉取最新内容，不需要重新打包。
      timerId = window.setInterval(() => {
        loadProfile({ silent: true });
      }, pollMs);
    }
  });

  onBeforeUnmount(() => {
    if (timerId !== null) {
      window.clearInterval(timerId);
    }
  });

  return {
    profile,
    loading,
    syncing,
    errorMessage,
    loadProfile
  };
}
