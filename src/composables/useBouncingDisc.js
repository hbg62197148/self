import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const FRAME_PADDING = 16;
const MIN_SPEED = 16;
const MAX_SPEED = 26;
const DRIFT_INTERVAL = 2600;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const randomRange = (min, max) => min + Math.random() * (max - min);

const createRandomVelocity = () => {
  const speed = randomRange(MIN_SPEED, MAX_SPEED);
  return Math.random() > 0.5 ? speed : -speed;
};

const clampVelocity = (value) => {
  const direction = value >= 0 ? 1 : -1;
  return direction * clamp(Math.abs(value), MIN_SPEED, MAX_SPEED);
};

export function useBouncingDisc() {
  const portraitCardRef = ref(null);
  const portraitDiscRef = ref(null);
  const position = ref({ x: 0, y: 0 });
  const isReady = ref(false);

  const bounds = {
    maxX: 0,
    maxY: 0
  };

  let velocityX = createRandomVelocity();
  let velocityY = createRandomVelocity();
  let animationFrameId = 0;
  let lastFrameTime = 0;
  let resizeObserver = null;
  let driftTimerId = 0;
  let removeResizeFallback = null;

  const portraitDiscStyle = computed(() => ({
    transform: `translate3d(${position.value.x}px, ${position.value.y}px, 0)`,
    opacity: isReady.value ? 1 : 0
  }));

  // 读取容器和圆球尺寸，并把运动范围限制在边框内。
  const measureBounds = () => {
    const container = portraitCardRef.value;
    const disc = portraitDiscRef.value;

    if (!container || !disc) {
      return;
    }

    bounds.maxX = Math.max(0, container.clientWidth - disc.offsetWidth - FRAME_PADDING * 2);
    bounds.maxY = Math.max(0, container.clientHeight - disc.offsetHeight - FRAME_PADDING * 2);

    if (!isReady.value) {
      position.value = {
        x: clamp(bounds.maxX * randomRange(0.36, 0.76), 0, bounds.maxX),
        y: clamp(bounds.maxY * randomRange(0.08, 0.32), 0, bounds.maxY)
      };
      isReady.value = true;
    } else {
      position.value = {
        x: clamp(position.value.x, 0, bounds.maxX),
        y: clamp(position.value.y, 0, bounds.maxY)
      };
    }

    lastFrameTime = 0;
  };

  // 定期加入一点随机扰动，让轨迹不会过于机械。
  const nudgeVelocity = () => {
    velocityX = clampVelocity(velocityX + randomRange(-3.2, 3.2));
    velocityY = clampVelocity(velocityY + randomRange(-3.2, 3.2));
  };

  const step = (timestamp) => {
    if (!isReady.value) {
      animationFrameId = window.requestAnimationFrame(step);
      return;
    }

    if (!lastFrameTime) {
      lastFrameTime = timestamp;
    }

    const delta = Math.min((timestamp - lastFrameTime) / 1000, 0.032);
    lastFrameTime = timestamp;

    let nextX = position.value.x + velocityX * delta;
    let nextY = position.value.y + velocityY * delta;

    if (nextX <= 0 || nextX >= bounds.maxX) {
      nextX = clamp(nextX, 0, bounds.maxX);
      velocityX = -velocityX;
      velocityY = clampVelocity(velocityY + randomRange(-2.6, 2.6));
    }

    if (nextY <= 0 || nextY >= bounds.maxY) {
      nextY = clamp(nextY, 0, bounds.maxY);
      velocityY = -velocityY;
      velocityX = clampVelocity(velocityX + randomRange(-2.6, 2.6));
    }

    position.value = {
      x: nextX,
      y: nextY
    };

    animationFrameId = window.requestAnimationFrame(step);
  };

  onMounted(() => {
    measureBounds();
    animationFrameId = window.requestAnimationFrame(step);
    driftTimerId = window.setInterval(nudgeVelocity, DRIFT_INTERVAL);

    if ("ResizeObserver" in window) {
      resizeObserver = new window.ResizeObserver(() => {
        measureBounds();
      });

      if (portraitCardRef.value) {
        resizeObserver.observe(portraitCardRef.value);
      }

      if (portraitDiscRef.value) {
        resizeObserver.observe(portraitDiscRef.value);
      }
    } else {
      const handleResize = () => {
        measureBounds();
      };

      window.addEventListener("resize", handleResize, { passive: true });
      removeResizeFallback = () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  });

  onBeforeUnmount(() => {
    if (animationFrameId) {
      window.cancelAnimationFrame(animationFrameId);
    }

    if (driftTimerId) {
      window.clearInterval(driftTimerId);
    }

    if (resizeObserver) {
      resizeObserver.disconnect();
    }

    if (removeResizeFallback) {
      removeResizeFallback();
    }
  });

  return {
    portraitCardRef,
    portraitDiscRef,
    portraitDiscStyle
  };
}
