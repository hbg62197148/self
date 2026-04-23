import { ref } from "vue";
import { createContactChallenge, verifyProtectedContact } from "../services/contactAccessApi";

const GUARD_MOOD_DELAY = 240;
const SUCCESS_HOLD_DURATION = 920;

export function useProtectedContactAction(onResolved) {
  const visible = ref(false);
  const challengePrompt = ref("");
  const pendingItem = ref(null);
  const challengeId = ref("");
  const submitting = ref(false);
  const errorMessage = ref("");
  const guardMood = ref("confused");

  let moodTimer = 0;
  let closeTimer = 0;

  const clearTimers = () => {
    if (moodTimer) {
      window.clearTimeout(moodTimer);
      moodTimer = 0;
    }

    if (closeTimer) {
      window.clearTimeout(closeTimer);
      closeTimer = 0;
    }
  };

  // 用户重新操作输入框时，立刻回到“思考中”的默认状态。
  const resetGuardMood = () => {
    clearTimers();
    guardMood.value = "confused";
  };

  // 给表情切换留一个很短的缓冲，让成功和失败反馈更自然。
  const scheduleGuardMood = (nextMood, delay = GUARD_MOOD_DELAY) => {
    if (moodTimer) {
      window.clearTimeout(moodTimer);
    }

    moodTimer = window.setTimeout(() => {
      guardMood.value = nextMood;
      moodTimer = 0;
    }, delay);
  };

  const closeDialog = () => {
    clearTimers();
    visible.value = false;
    challengePrompt.value = "";
    pendingItem.value = null;
    challengeId.value = "";
    submitting.value = false;
    errorMessage.value = "";
    guardMood.value = "confused";
  };

  // 每次打开或刷新时都重新申请验证码，避免复用旧题目。
  const loadChallenge = async ({ preserveMood = false } = {}) => {
    if (!pendingItem.value) {
      return;
    }

    if (!preserveMood) {
      resetGuardMood();
    }

    submitting.value = true;
    errorMessage.value = "";

    try {
      const challenge = await createContactChallenge(pendingItem.value.label);
      challengePrompt.value = challenge.prompt;
      challengeId.value = challenge.challengeId;
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : "验证码加载失败，请稍后重试。";
      scheduleGuardMood("wrong");
    } finally {
      submitting.value = false;
    }
  };

  const openDialog = async (item) => {
    pendingItem.value = item;
    visible.value = true;
    resetGuardMood();
    await loadChallenge();
  };

  // 验证通过后，再执行真正的复制或发送动作。
  const submitAnswer = async (answer) => {
    if (!pendingItem.value || !challengeId.value) {
      return;
    }

    clearTimers();
    submitting.value = true;
    errorMessage.value = "";

    try {
      const result = await verifyProtectedContact({
        label: pendingItem.value.label,
        challengeId: challengeId.value,
        answer
      });

      scheduleGuardMood("success");

      await new Promise((resolve) => {
        closeTimer = window.setTimeout(resolve, GUARD_MOOD_DELAY + SUCCESS_HOLD_DURATION);
      });

      await onResolved(result, pendingItem.value);
      closeDialog();
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : "验证码校验失败，请稍后重试。";
      scheduleGuardMood("wrong");
      await loadChallenge({ preserveMood: true });
    } finally {
      submitting.value = false;
    }
  };

  const refreshChallenge = async () => {
    resetGuardMood();
    await loadChallenge();
  };

  const notifyGuardEditing = () => {
    errorMessage.value = "";
    resetGuardMood();
  };

  return {
    visible,
    challengePrompt,
    pendingItem,
    submitting,
    errorMessage,
    guardMood,
    openDialog,
    submitAnswer,
    refreshChallenge,
    notifyGuardEditing,
    closeDialog
  };
}
