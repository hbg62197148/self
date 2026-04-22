import { ref } from "vue";
import { createContactChallenge, verifyProtectedContact } from "../services/contactAccessApi";

export function useProtectedContactAction(onResolved) {
  const visible = ref(false);
  const challengePrompt = ref("");
  const pendingItem = ref(null);
  const challengeId = ref("");
  const submitting = ref(false);
  const errorMessage = ref("");

  const closeDialog = () => {
    visible.value = false;
    challengePrompt.value = "";
    pendingItem.value = null;
    challengeId.value = "";
    submitting.value = false;
    errorMessage.value = "";
  };

  // 每次打开弹层都重新向服务端申请验证码，避免重复利用旧挑战。
  const loadChallenge = async () => {
    if (!pendingItem.value) {
      return;
    }

    submitting.value = true;
    errorMessage.value = "";

    try {
      const challenge = await createContactChallenge(pendingItem.value.label);
      challengePrompt.value = challenge.prompt;
      challengeId.value = challenge.challengeId;
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : "验证码加载失败，请稍后重试。";
    } finally {
      submitting.value = false;
    }
  };

  const openDialog = async (item) => {
    pendingItem.value = item;
    visible.value = true;
    await loadChallenge();
  };

  // 只有验证码通过后，才会把真实联系方式交给后续动作处理。
  const submitAnswer = async (answer) => {
    if (!pendingItem.value || !challengeId.value) {
      return;
    }

    submitting.value = true;
    errorMessage.value = "";

    try {
      const result = await verifyProtectedContact({
        label: pendingItem.value.label,
        challengeId: challengeId.value,
        answer
      });

      await onResolved(result, pendingItem.value);
      closeDialog();
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : "验证码校验失败，请稍后重试。";
      await loadChallenge();
    } finally {
      submitting.value = false;
    }
  };

  return {
    visible,
    challengePrompt,
    pendingItem,
    submitting,
    errorMessage,
    openDialog,
    submitAnswer,
    refreshChallenge: loadChallenge,
    closeDialog
  };
}
