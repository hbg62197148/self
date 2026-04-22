import { computed, nextTick, onBeforeUnmount, ref } from "vue";

const CORE_POINT = {
  x: 43,
  y: 38
};

const MOTION_NODE_X = 35;
const INFLUENCE_RADIUS = 46;
const MAX_SHIFT = 16;

const parsePercent = (value) => Number.parseFloat(String(value).replace("%", "")) || 0;

export function useSkillUniverse(nodesSource) {
  const activeNodeId = ref(null);
  const isCorePulsing = ref(false);

  let pulseTimer = 0;

  const restartCorePulse = async () => {
    if (pulseTimer) {
      window.clearTimeout(pulseTimer);
    }

    if (isCorePulsing.value) {
      isCorePulsing.value = false;
      await nextTick();
    }

    isCorePulsing.value = true;

    pulseTimer = window.setTimeout(() => {
      isCorePulsing.value = false;
    }, 760);
  };

  const normalizedNodes = computed(() =>
    (nodesSource.value ?? []).map((node) => ({
      ...node,
      id: node.label,
      resolvedX: node.label === "Motion" ? MOTION_NODE_X : parsePercent(node.x),
      resolvedY: parsePercent(node.y)
    }))
  );

  const resolvedNodes = computed(() => {
    const activeNode = normalizedNodes.value.find((item) => item.id === activeNodeId.value);

    return normalizedNodes.value.map((node) => {
      if (!activeNode || node.id === activeNode.id) {
        return {
          ...node,
          offsetX: "0px",
          offsetY: "0px"
        };
      }

      const deltaX = node.resolvedX - activeNode.resolvedX;
      const deltaY = node.resolvedY - activeNode.resolvedY;
      const distance = Math.hypot(deltaX, deltaY);
      const influence = Math.max(0, 1 - distance / INFLUENCE_RADIUS);

      if (!influence || !distance) {
        return {
          ...node,
          offsetX: "0px",
          offsetY: "0px"
        };
      }

      const shift = MAX_SHIFT * influence;

      return {
        ...node,
        offsetX: `${((deltaX / distance) * shift).toFixed(2)}px`,
        offsetY: `${((deltaY / distance) * shift).toFixed(2)}px`
      };
    });
  });

  const activeLink = computed(() => {
    const activeNode = normalizedNodes.value.find((item) => item.id === activeNodeId.value);

    if (!activeNode) {
      return null;
    }

    const deltaX = activeNode.resolvedX - CORE_POINT.x;
    const deltaY = activeNode.resolvedY - CORE_POINT.y;
    const distance = Math.hypot(deltaX, deltaY) || 1;

    return {
      tone: activeNode.tone,
      x1: CORE_POINT.x + (deltaX / distance) * 10,
      y1: CORE_POINT.y + (deltaY / distance) * 7,
      x2: activeNode.resolvedX - (deltaX / distance) * 3.6,
      y2: activeNode.resolvedY - (deltaY / distance) * 3.6,
      nodeX: activeNode.resolvedX,
      nodeY: activeNode.resolvedY
    };
  });

  // 节点 hover 或 focus 时，更新当前被点亮的连接目标。
  const setActiveNode = (nodeId) => {
    activeNodeId.value = nodeId;
  };

  const clearActiveNode = () => {
    activeNodeId.value = null;
  };

  // 点击节点时给核心区域一次额外脉冲反馈。
  const activateNode = async (nodeId) => {
    activeNodeId.value = nodeId;
    await restartCorePulse();
  };

  onBeforeUnmount(() => {
    if (pulseTimer) {
      window.clearTimeout(pulseTimer);
    }
  });

  return {
    activeLink,
    activeNodeId,
    clearActiveNode,
    isCorePulsing,
    resolvedNodes,
    setActiveNode,
    activateNode
  };
}
