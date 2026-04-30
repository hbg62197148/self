<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useMotionPreference } from "../../composables/useMotionPreference";

const { isMotionLite } = useMotionPreference();

const containerRef = ref(null);
const canvasRef = ref(null);
const isUnavailable = ref(false);

let THREE = null;
let renderer = null;
let scene = null;
let camera = null;
let rootGroup = null;
let coreGroup = null;
let particleGroup = null;
let resizeObserver = null;
let resizeFallback = null;
let animationFrameId = 0;
let sceneStartedAt = 0;
let isDisposed = false;

const particleBands = [];

const loadThree = async () => {
  if (!THREE) {
    THREE = await import("three");
  }

  return THREE;
};

const disposeMaterial = (material) => {
  if (Array.isArray(material)) {
    material.forEach(disposeMaterial);
    return;
  }

  material?.dispose?.();
};

const disposeObject = (object) => {
  object.traverse((child) => {
    child.geometry?.dispose?.();
    disposeMaterial(child.material);
  });
};

const clearSceneContent = () => {
  if (!scene || !rootGroup) {
    return;
  }

  scene.remove(rootGroup);
  disposeObject(rootGroup);
  rootGroup = null;
  coreGroup = null;
  particleGroup = null;
  particleBands.splice(0);
};

const createCore = () => {
  coreGroup = new THREE.Group();
  rootGroup.add(coreGroup);

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(4.8, 32, 16),
    new THREE.MeshBasicMaterial({
      color: 0xff6a3d,
      transparent: true,
      opacity: 0.11,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  coreGroup.add(glow);

  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(3.7, 2),
    new THREE.MeshBasicMaterial({
      color: 0xf5f1e8,
      wireframe: true,
      transparent: true,
      opacity: 0.22
    })
  );
  coreGroup.add(shell);

  const crystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(2.2, 1),
    new THREE.MeshBasicMaterial({
      color: 0x7bf7d4,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  coreGroup.add(crystal);

  [
    { radius: 5.4, tube: 0.028, color: 0xff6a3d, opacity: 0.42, rotation: [1.26, 0.12, 0.18] },
    { radius: 4.35, tube: 0.024, color: 0x7bf7d4, opacity: 0.32, rotation: [0.38, 1.24, -0.34] },
    { radius: 3.25, tube: 0.022, color: 0x9ea9ff, opacity: 0.34, rotation: [1.78, -0.54, 0.92] }
  ].forEach((ringConfig) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(ringConfig.radius, ringConfig.tube, 8, 120),
      new THREE.MeshBasicMaterial({
        color: ringConfig.color,
        transparent: true,
        opacity: ringConfig.opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );

    ring.rotation.set(...ringConfig.rotation);
    coreGroup.add(ring);
  });
};

const createParticleBand = ({ count, color, size, radius, speed, yScale, zScale, phase }) => {
  const positions = new Float32Array(count * 3);
  const seeds = Array.from({ length: count }, (_, index) => ({
    angle: (index / count) * Math.PI * 2 + Math.sin(index * 2.17) * 0.18,
    radius: radius * (0.84 + Math.random() * 0.32),
    speed: speed * (0.82 + Math.random() * 0.36),
    phase: phase + Math.random() * Math.PI * 2
  }));

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color,
    size,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.76,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const points = new THREE.Points(geometry, material);
  points.userData = {
    positions,
    seeds,
    yScale,
    zScale
  };
  particleGroup.add(points);
  particleBands.push(points);
};

const createParticles = () => {
  particleGroup = new THREE.Group();
  rootGroup.add(particleGroup);

  createParticleBand({
    count: 96,
    color: 0xff8a5c,
    size: 0.14,
    radius: 5.9,
    speed: 0.62,
    yScale: 0.18,
    zScale: 0.5,
    phase: 0
  });
  createParticleBand({
    count: 78,
    color: 0x7bf7d4,
    size: 0.12,
    radius: 4.65,
    speed: -0.74,
    yScale: 0.32,
    zScale: 0.62,
    phase: 1.7
  });
  createParticleBand({
    count: 64,
    color: 0x9ea9ff,
    size: 0.11,
    radius: 3.45,
    speed: 0.94,
    yScale: 0.42,
    zScale: 0.72,
    phase: 3.1
  });
};

const updateParticles = (elapsed) => {
  particleBands.forEach((points, bandIndex) => {
    const { positions, seeds, yScale, zScale } = points.userData;

    seeds.forEach((seed, index) => {
      const angle = seed.angle + elapsed * seed.speed;
      const wave = angle * 0.82 + seed.phase;
      const offset = index * 3;

      positions[offset] = Math.cos(angle) * seed.radius;
      positions[offset + 1] = Math.sin(wave) * seed.radius * yScale;
      positions[offset + 2] = Math.sin(angle) * seed.radius * zScale;
    });

    points.geometry.attributes.position.needsUpdate = true;
    points.rotation.x = Math.sin(elapsed * 0.18 + bandIndex) * 0.12;
    points.rotation.y = elapsed * (0.08 + bandIndex * 0.025);
    points.rotation.z = Math.cos(elapsed * 0.15 + bandIndex) * 0.08;
  });
};

const createSceneContent = () => {
  if (!THREE || !scene) {
    return;
  }

  clearSceneContent();

  rootGroup = new THREE.Group();
  rootGroup.rotation.x = -0.08;
  scene.add(rootGroup);

  createCore();
  createParticles();
};

const updateSize = () => {
  const rect = containerRef.value?.getBoundingClientRect();

  if (!rect || !renderer || !camera) {
    return;
  }

  const size = Math.max(1, Math.floor(Math.min(rect.width, rect.height)));

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.setSize(Math.max(1, Math.floor(rect.width)), Math.max(1, Math.floor(rect.height)), false);

  camera.aspect = rect.width / rect.height || 1;
  camera.updateProjectionMatrix();

  const scale = Math.min(rect.width, rect.height) / size;
  rootGroup?.scale.setScalar(scale);
};

const renderScene = () => {
  if (!renderer || !scene || !camera) {
    return;
  }

  if (!sceneStartedAt) {
    sceneStartedAt = window.performance.now();
  }

  const elapsed = (window.performance.now() - sceneStartedAt) / 1000;

  if (coreGroup) {
    coreGroup.rotation.y = elapsed * 0.48;
    coreGroup.rotation.x = Math.sin(elapsed * 0.58) * 0.16;
    coreGroup.children.forEach((child, index) => {
      child.rotation.z += isMotionLite.value ? 0 : 0.0025 + index * 0.0008;
    });
  }

  if (rootGroup) {
    rootGroup.rotation.y = Math.sin(elapsed * 0.22) * 0.22;
    rootGroup.rotation.z = Math.cos(elapsed * 0.2) * 0.08;
  }

  updateParticles(elapsed);
  renderer.render(scene, camera);
};

const startAnimation = () => {
  if (!renderer || animationFrameId) {
    return;
  }

  const tick = () => {
    renderScene();

    if (!isMotionLite.value) {
      animationFrameId = window.requestAnimationFrame(tick);
      return;
    }

    animationFrameId = 0;
  };

  animationFrameId = window.requestAnimationFrame(tick);
};

const stopAnimation = () => {
  if (animationFrameId) {
    window.cancelAnimationFrame(animationFrameId);
    animationFrameId = 0;
  }

  renderScene();
};

const initScene = async () => {
  try {
    await loadThree();
  } catch {
    isUnavailable.value = true;
    return;
  }

  if (isDisposed || !canvasRef.value || !containerRef.value) {
    return;
  }

  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.value,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
  } catch {
    isUnavailable.value = true;
    return;
  }

  renderer.setClearColor(0x000000, 0);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 22);

  createSceneContent();
  updateSize();
  renderScene();

  if ("ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(() => {
      updateSize();
      renderScene();
    });
    resizeObserver.observe(containerRef.value);
  } else {
    resizeFallback = () => {
      updateSize();
      renderScene();
    };
    window.addEventListener("resize", resizeFallback);
  }

  if (!isMotionLite.value) {
    startAnimation();
  }
};

onMounted(initScene);

watch(
  isMotionLite,
  (liteMode) => {
    if (liteMode) {
      stopAnimation();
      return;
    }

    startAnimation();
  }
);

onBeforeUnmount(() => {
  isDisposed = true;
  stopAnimation();
  resizeObserver?.disconnect();
  resizeObserver = null;

  if (resizeFallback) {
    window.removeEventListener("resize", resizeFallback);
    resizeFallback = null;
  }

  clearSceneContent();
  renderer?.dispose();
  renderer = null;
  scene = null;
  camera = null;
});
</script>

<template>
  <div
    ref="containerRef"
    :class="['hero-signal-core-scene', { 'is-unavailable': isUnavailable }]"
    aria-hidden="true"
  >
    <canvas ref="canvasRef" class="hero-signal-core-canvas" />
    <span class="hero-signal-core-fallback" />
  </div>
</template>
