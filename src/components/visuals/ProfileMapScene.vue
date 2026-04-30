<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useMotionPreference } from "../../composables/useMotionPreference";

const props = defineProps({
  nodes: {
    type: Array,
    default: () => []
  },
  activeIndex: {
    type: Number,
    default: -1
  }
});

const NODE_POINTS = [
  { x: 28, y: 27 },
  { x: 72, y: 27 },
  { x: 72, y: 72 },
  { x: 28, y: 72 },
  { x: 50, y: 78 }
];

const ORBIT_CONFIG = [
  { scaleX: 0.34, scaleY: 0.23, opacity: 0.16, speed: 0.16, tilt: -0.06 },
  { scaleX: 0.27, scaleY: 0.29, opacity: 0.12, speed: -0.22, tilt: 0.12 },
  { scaleX: 0.42, scaleY: 0.18, opacity: 0.1, speed: 0.28, tilt: 0.04 }
];

const { isMotionLite } = useMotionPreference();

const containerRef = ref(null);
const canvasRef = ref(null);
const isUnavailable = ref(false);

let THREE = null;
let renderer = null;
let scene = null;
let camera = null;
let rootGroup = null;
let ringsGroup = null;
let particleSystem = null;
let particleMaterial = null;
let resizeObserver = null;
let resizeFallback = null;
let animationFrameId = 0;
let sceneStartedAt = 0;
let worldWidth = 100;
let worldHeight = 100;
let isDisposed = false;

const nodeRecords = [];
const lineRecords = [];

const loadThree = async () => {
  if (!THREE) {
    THREE = await import("three");
  }

  return THREE;
};

const safeColor = (value, fallback = "#ff6a3d") => {
  const color = new THREE.Color(fallback);

  try {
    color.setStyle(value || fallback);
  } catch {
    color.setStyle(fallback);
  }

  return color;
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
  ringsGroup = null;
  particleSystem = null;
  particleMaterial = null;
  nodeRecords.splice(0);
  lineRecords.splice(0);
};

const percentToWorld = (xPercent, yPercent) => ({
  x: (xPercent / 100 - 0.5) * worldWidth,
  y: (0.5 - yPercent / 100) * worldHeight
});

const createEllipseGeometry = () => {
  const points = [];
  const segments = 144;

  for (let index = 0; index <= segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0));
  }

  return new THREE.BufferGeometry().setFromPoints(points);
};

const updateRingScale = () => {
  ringsGroup?.children.forEach((ring) => {
    ring.scale.set(worldWidth * ring.userData.scaleX, worldHeight * ring.userData.scaleY, 1);
  });
};

const createRings = () => {
  ringsGroup = new THREE.Group();
  rootGroup.add(ringsGroup);

  ORBIT_CONFIG.forEach((config, index) => {
    const ring = new THREE.LineLoop(
      createEllipseGeometry(),
      new THREE.LineBasicMaterial({
        color: index === 1 ? 0x7bf7d4 : 0xf5f1e8,
        transparent: true,
        opacity: config.opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );

    ring.userData = {
      ...config,
      offset: index * 0.78
    };
    ring.rotation.x = config.tilt;
    ringsGroup.add(ring);
  });

  updateRingScale();
};

const createParticles = () => {
  const count = 96;
  const positions = new Float32Array(count * 3);
  const seeds = Array.from({ length: count }, (_, index) => ({
    angle: (index / count) * Math.PI * 2 + Math.sin(index * 1.77) * 0.24,
    radius: 0.31 + Math.random() * 0.14,
    speed: 0.18 + Math.random() * 0.22,
    phase: Math.random() * Math.PI * 2
  }));

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  particleMaterial = new THREE.PointsMaterial({
    color: 0x7bf7d4,
    size: 1.25,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.46,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  particleSystem = new THREE.Points(geometry, particleMaterial);
  particleSystem.userData = {
    positions,
    seeds
  };
  rootGroup.add(particleSystem);
};

const createLineGeometry = () => {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
  return geometry;
};

const createNodesAndLines = () => {
  props.nodes.forEach((node, index) => {
    const tone = safeColor(node.tone);
    const point = NODE_POINTS[index] ?? NODE_POINTS[NODE_POINTS.length - 1];

    const lineMaterial = new THREE.LineBasicMaterial({
      color: tone,
      transparent: true,
      opacity: 0.1,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const line = new THREE.Line(createLineGeometry(), lineMaterial);
    rootGroup.add(line);

    const group = new THREE.Group();
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: tone,
      transparent: true,
      opacity: 0.1,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: tone,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: tone,
      transparent: true,
      opacity: 0.24,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const halo = new THREE.Mesh(new THREE.SphereGeometry(3.2, 20, 10), haloMaterial);
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.15, 1), coreMaterial);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.25, 0.035, 8, 56), ringMaterial);

    ring.rotation.x = Math.PI / 2.6;
    group.add(halo, core, ring);
    rootGroup.add(group);

    nodeRecords.push({
      group,
      halo,
      core,
      ring,
      haloMaterial,
      coreMaterial,
      ringMaterial,
      point,
      basePosition: new THREE.Vector3(),
      index
    });
    lineRecords.push({
      line,
      material: lineMaterial,
      index
    });
  });
};

const updateNodePositions = () => {
  const center = new THREE.Vector3(0, 0, -8);

  nodeRecords.forEach((record) => {
    const position = percentToWorld(record.point.x, record.point.y);
    record.basePosition.set(position.x, position.y, Math.sin(record.index * 1.4) * 6);
    record.group.position.copy(record.basePosition);
  });

  lineRecords.forEach((record) => {
    const nodeRecord = nodeRecords[record.index];

    if (!nodeRecord) {
      return;
    }

    const positions = record.line.geometry.attributes.position;
    positions.setXYZ(0, center.x, center.y, center.z);
    positions.setXYZ(1, nodeRecord.basePosition.x, nodeRecord.basePosition.y, nodeRecord.basePosition.z);
    positions.needsUpdate = true;
  });
};

const updateActiveState = () => {
  const hasActive = props.activeIndex >= 0;
  const activeNode = props.nodes[props.activeIndex];

  if (particleMaterial && activeNode) {
    particleMaterial.color.copy(safeColor(activeNode.tone));
  }

  nodeRecords.forEach((record) => {
    const isActive = record.index === props.activeIndex;
    const faded = hasActive && !isActive;

    record.haloMaterial.opacity = isActive ? 0.28 : faded ? 0.04 : 0.1;
    record.coreMaterial.opacity = isActive ? 0.92 : faded ? 0.28 : 0.5;
    record.ringMaterial.opacity = isActive ? 0.62 : faded ? 0.08 : 0.24;
  });

  lineRecords.forEach((record) => {
    const isActive = record.index === props.activeIndex;
    record.material.opacity = isActive ? 0.52 : hasActive ? 0.04 : 0.1;
  });
};

const updateParticles = (elapsed) => {
  if (!particleSystem) {
    return;
  }

  const { positions, seeds } = particleSystem.userData;
  const activeBoost = props.activeIndex >= 0 ? 1.18 : 1;

  seeds.forEach((seed, index) => {
    const angle = seed.angle + elapsed * seed.speed;
    const wave = angle + seed.phase;
    const offset = index * 3;

    positions[offset] = Math.cos(angle) * worldWidth * seed.radius * activeBoost;
    positions[offset + 1] = Math.sin(angle) * worldHeight * seed.radius * 0.52 + Math.sin(wave) * 2.2;
    positions[offset + 2] = Math.sin(wave * 0.64) * 12;
  });

  particleSystem.geometry.attributes.position.needsUpdate = true;
  particleSystem.rotation.z = Math.sin(elapsed * 0.18) * 0.08;
};

const createSceneContent = () => {
  if (!THREE || !scene) {
    return;
  }

  clearSceneContent();

  rootGroup = new THREE.Group();
  scene.add(rootGroup);

  createRings();
  createParticles();
  createNodesAndLines();
  updateNodePositions();
  updateActiveState();
};

const updateSize = () => {
  const rect = containerRef.value?.getBoundingClientRect();

  if (!rect || !renderer || !camera) {
    return;
  }

  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  const aspect = width / height || 1;

  worldHeight = 100;
  worldWidth = worldHeight * aspect;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(width, height, false);

  camera.left = -worldWidth / 2;
  camera.right = worldWidth / 2;
  camera.top = worldHeight / 2;
  camera.bottom = -worldHeight / 2;
  camera.updateProjectionMatrix();

  updateRingScale();
  updateNodePositions();
};

const renderScene = () => {
  if (!renderer || !scene || !camera) {
    return;
  }

  if (!sceneStartedAt) {
    sceneStartedAt = window.performance.now();
  }

  const elapsed = (window.performance.now() - sceneStartedAt) / 1000;

  ringsGroup?.children.forEach((ring) => {
    ring.rotation.z = ring.userData.offset + elapsed * ring.userData.speed;
    ring.rotation.x = ring.userData.tilt + Math.sin(elapsed * 0.38 + ring.userData.offset) * 0.04;
  });

  nodeRecords.forEach((record) => {
    const isActive = record.index === props.activeIndex;
    const bob = isMotionLite.value ? 0 : Math.sin(elapsed * 1.1 + record.index * 0.72) * 0.9;
    const targetScale = isActive ? 1.32 : props.activeIndex >= 0 ? 0.88 : 1;

    record.group.position.set(record.basePosition.x, record.basePosition.y + bob, record.basePosition.z);
    record.group.rotation.y = elapsed * (0.36 + record.index * 0.02);
    record.group.scale.setScalar(record.group.scale.x + (targetScale - record.group.scale.x) * 0.08);
  });

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
  camera = new THREE.OrthographicCamera(-50, 50, 50, -50, -1000, 1000);
  camera.position.z = 120;

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
  () => props.nodes.map((node) => `${node.label}:${node.tone}`).join("|"),
  () => {
    createSceneContent();
    updateSize();
    renderScene();
  }
);

watch(
  () => props.activeIndex,
  () => {
    updateActiveState();
    renderScene();
    startAnimation();
  }
);

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
    :class="['profile-map-scene', { 'is-unavailable': isUnavailable }]"
    aria-hidden="true"
  >
    <canvas ref="canvasRef" class="profile-map-canvas" />
    <span class="profile-map-scene-fallback" />
  </div>
</template>
