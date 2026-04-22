import { onBeforeUnmount, ref } from "vue";

export function useClipboard(resetDelay = 1200) {
  const copiedLabel = ref(null);
  let resetTimerId = null;

  // 复制成功后，短暂显示反馈文案，再自动恢复默认状态。
  const scheduleReset = () => {
    if (resetTimerId !== null) {
      window.clearTimeout(resetTimerId);
    }

    resetTimerId = window.setTimeout(() => {
      copiedLabel.value = null;
      resetTimerId = null;
    }, resetDelay);
  };

  const copyToClipboard = async (text, label) => {
    if (!text) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        textarea.style.top = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      copiedLabel.value = label ?? "Copied";
      scheduleReset();
    } catch {
      // 浏览器权限不足或不支持复制时，静默跳过即可。
    }
  };

  onBeforeUnmount(() => {
    if (resetTimerId !== null) {
      window.clearTimeout(resetTimerId);
    }
  });

  return {
    copiedLabel,
    copyToClipboard
  };
}
