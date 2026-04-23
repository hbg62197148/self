import { nextTick, onBeforeUnmount } from "vue";
import { gsap } from "gsap";

const MAX_ROW_SHIFT = 12;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function useIdentityMotion(activeRowId, activeLetterId) {
  const rowRefs = new Map();
  const shellRefs = new Map();
  const copyRefs = new Map();
  const flipRefs = new Map();
  const shiftState = new Map();
  const motions = new Map();

  const ensureMotion = (rowId) => {
    if (motions.has(rowId)) {
      return motions.get(rowId);
    }

    const row = rowRefs.get(rowId);
    const shell = shellRefs.get(rowId);
    const copy = copyRefs.get(rowId);
    const flip = flipRefs.get(rowId);

    if (!row || !shell || !copy || !flip) {
      return null;
    }

    const motion = {
      rowX: gsap.quickTo(row, "x", { duration: 0.42, ease: "power3.out" }),
      shellX: gsap.quickTo(shell, "x", { duration: 0.42, ease: "power3.out" }),
      shellY: gsap.quickTo(shell, "y", { duration: 0.34, ease: "power3.out" }),
      shellRotate: gsap.quickTo(shell, "rotation", { duration: 0.42, ease: "power3.out" }),
      copyX: gsap.quickTo(copy, "x", { duration: 0.42, ease: "power3.out" }),
      flipRotate: gsap.quickTo(flip, "rotateX", { duration: 0.42, ease: "power3.out" })
    };

    gsap.set(flip, {
      rotateX: 0,
      transformOrigin: "center center"
    });

    motions.set(rowId, motion);
    return motion;
  };

  const setRowRef = async (rowId, element) => {
    if (element) {
      rowRefs.set(rowId, element);
      await nextTick();
      ensureMotion(rowId);
      return;
    }

    rowRefs.delete(rowId);
    motions.delete(rowId);
  };

  const setShellRef = async (rowId, element) => {
    if (element) {
      shellRefs.set(rowId, element);
      await nextTick();
      ensureMotion(rowId);
      return;
    }

    shellRefs.delete(rowId);
    motions.delete(rowId);
  };

  const setCopyRef = async (rowId, element) => {
    if (element) {
      copyRefs.set(rowId, element);
      await nextTick();
      ensureMotion(rowId);
      return;
    }

    copyRefs.delete(rowId);
    motions.delete(rowId);
  };

  const setFlipRef = async (rowId, element) => {
    if (element) {
      flipRefs.set(rowId, element);
      await nextTick();
      ensureMotion(rowId);
      return;
    }

    flipRefs.delete(rowId);
    motions.delete(rowId);
  };

  // 同步一整行的位移反馈，让行、字母牌和说明文案保持一条运动节奏。
  const syncRowShift = (rowId, shift = 0) => {
    const motion = ensureMotion(rowId);

    if (!motion) {
      return;
    }

    shiftState.set(rowId, shift);

    const isLetterActive = activeLetterId.value === rowId;
    motion.rowX(shift);
    motion.shellX(shift * 0.72);
    motion.shellY(isLetterActive ? -4 : -Math.min(Math.abs(shift) * 0.14, 2.6));
    motion.shellRotate(isLetterActive ? -2.8 : shift * 0.16);
    motion.copyX(shift * 0.42);
  };

  const activateRow = (rowId) => {
    activeRowId.value = rowId;
  };

  const releaseRow = (rowId) => {
    if (activeRowId.value === rowId) {
      activeRowId.value = null;
    }

    shiftState.set(rowId, 0);
    syncRowShift(rowId, 0);
  };

  // 根据鼠标在当前行内的水平位置，生成更丝滑的横向视差偏移。
  const handleRowPointerMove = (rowId, event) => {
    const rowBounds = event.currentTarget.getBoundingClientRect();
    const progress = (event.clientX - rowBounds.left) / rowBounds.width - 0.5;
    const shift = clamp(progress * MAX_ROW_SHIFT * 2, -MAX_ROW_SHIFT, MAX_ROW_SHIFT);

    activateRow(rowId);
    syncRowShift(rowId, shift);
  };

  const handleRowPointerEnter = (rowId) => {
    activateRow(rowId);
    syncRowShift(rowId, shiftState.get(rowId) ?? 0);
  };

  const handleRowPointerLeave = (rowId, event) => {
    if (event.currentTarget.contains(document.activeElement)) {
      syncRowShift(rowId, 0);
      return;
    }

    releaseRow(rowId);
  };

  const handleRowFocusOut = (rowId, event) => {
    if (event.currentTarget.contains(event.relatedTarget)) {
      return;
    }

    releaseRow(rowId);
  };

  // 字母牌的翻面单独用 GSAP 驱动，这样 hover 和键盘聚焦都更顺。
  const activateLetter = (rowId) => {
    activeLetterId.value = rowId;
    const motion = ensureMotion(rowId);
    motion?.flipRotate(90);
    syncRowShift(rowId, shiftState.get(rowId) ?? 0);
  };

  const releaseLetter = (rowId) => {
    if (activeLetterId.value === rowId) {
      activeLetterId.value = null;
    }

    const motion = ensureMotion(rowId);
    motion?.flipRotate(0);
    syncRowShift(rowId, shiftState.get(rowId) ?? 0);
  };

  onBeforeUnmount(() => {
    gsap.killTweensOf([
      ...rowRefs.values(),
      ...shellRefs.values(),
      ...copyRefs.values(),
      ...flipRefs.values()
    ]);
  });

  return {
    activeRowId,
    activeLetterId,
    setRowRef,
    setShellRef,
    setCopyRef,
    setFlipRef,
    activateRow,
    releaseRow,
    handleRowPointerMove,
    handleRowPointerEnter,
    handleRowPointerLeave,
    handleRowFocusOut,
    activateLetter,
    releaseLetter
  };
}
