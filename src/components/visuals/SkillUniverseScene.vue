<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useMotionPreference } from "../../composables/useMotionPreference";

const props = defineProps({
  nodes: {
    type: Array,
    default: () => []
  },
  activeNodeId: {
    type: String,
    default: null
  },
  activeTone: {
    type: String,
    default: "#ff6a3d"
  },
  pulsing: {
    type: Boolean,
    default: false
  }
});

const CORE_POINT = {
  x: 50,
  y: 46
};

const ORBIT_CONFIG = [
  { x: 0.42, y: 0.41, opacity: 0.12, speed: 0.18, tilt: 0.18 },
  { x: 0.3, y: 0.3, opacity: 0.16, speed: -0.24, tilt: -0.12 },
  { x: 0.19, y: 0.2, opacity: 0.2, speed: 0.34, tilt: 0.08 }
];

const { isMotionLite } = useMotionPreference();

const containerRef = ref(null);
const canvasRef = ref(null);
const isUnavailable = ref(false);

let renderer = null;
let scene = null;
let camera = null;
let rootGroup = null;
let ringsGroup = null;
let coreGroup = null;
let coreGlowMaterial = null;
let coreInnerMaterial = null;
let resizeObserver = null;
let animationFrameId = 0;
let pulseStartedAt = 0;
let sceneStartedAt = 0;
let worldWidth = 100;
let worldHeight = 100;
let THREE = null;
let isDisposed = false;

const nodeRecords = new Map();
const linkRecords = new Map();
const activeParticles = [];

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
  coreGroup = null;
  coreGlowMaterial = null;
  coreInnerMaterial = null;
  nodeRecords.clear();
  linkRecords.clear();
  activeParticles.splice(0);
};

const percentToWorld = (xPercent, yPercent) => ({
  x: (Number(xPercent) / 100 - 0.5) * worldWidth,
  y: (0.5 - Number(yPercent) / 100) * worldHeight
});

const getCorePosition = () => percentToWorld(CORE_POINT.x, CORE_POINT.y);

const createOrbitGeometry = () => {
  const points = [];
  const segments = 144;

  for (let index = 0; index <= segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0));
  }

  return new THREE.BufferGeometry().setFromPoints(points);
};

const updateOrbitScale = () => {
  if (!ringsGroup) {
    return;
  }

  ringsGroup.children.forEach((ring) => {
    ring.scale.set(worldWidth * ring.userData.scaleX, worldHeight * ring.userData.scaleY, 1);
  });
};

const createRings = () => {
  ringsGroup = new THREE.Group();
  rootGroup.add(ringsGroup);

  ORBIT_CONFIG.forEach((config, index) => {
    const geometry = createOrbitGeometry();
    const material = new THREE.LineBasicMaterial({
      color: 0xf5f1e8,
      transparent: true,
      opacity: config.opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const ring = new THREE.LineLoop(geometry, material);

    ring.userData = {
      scaleX: config.x,
      scaleY: config.y,
      speed: config.speed,
      tilt: config.tilt,
      offset: index * 0.74
    };
    ring.rotation.x = config.tilt;
    ringsGroup.add(ring);
  });

  updateOrbitScale();
};

const createCore = () => {
  coreGroup = new THREE.Group();

  const corePosition = getCorePosition();
  coreGroup.position.set(corePosition.x, corePosition.y, -4);
  rootGroup.add(coreGroup);

  const activeColor = safeColor(props.activeTone);
  const glowGeometry = new THREE.SphereGeometry(8.2, 32, 16);
  coreGlowMaterial = new THREE.MeshBasicMaterial({
    color: activeColor,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const glow = new THREE.Mesh(glowGeometry, coreGlowMaterial);
  coreGroup.add(glow);

  const wire = new THREE.Mesh(
    new THREE.IcosahedronGeometry(5.6, 2),
    new THREE.MeshBasicMaterial({
      color: 0xf5f1e8,
      wireframe: true,
      transparent: true,
      opacity: 0.24
    })
  );
  coreGroup.add(wire);

  coreInnerMaterial = new THREE.MeshBasicMaterial({
    color: activeColor,
    transparent: true,
    opacity: 0.46,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const inner = new THREE.Mesh(new THREE.OctahedronGeometry(3.2, 1), coreInnerMaterial);
  coreGroup.add(inner);

  [
    { radius: 7.4, rotation: [Math.PI / 2.2, 0, 0] },
    { radius: 6.1, rotation: [0, Math.PI / 2.5, Math.PI / 7] },
    { radius: 4.8, rotation: [Math.PI / 3, Math.PI / 4, 0] }
  ].forEach((ringConfig) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(ringConfig.radius, 0.035, 8, 96),
      new THREE.MeshBasicMaterial({
        color: activeColor,
        transparent: true,
        opacity: 0.24,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );

    ring.rotation.set(...ringConfig.rotation);
    coreGroup.add(ring);
  });
};

const createLineGeometry = () => {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
  return geometry;
};

const createNodesAndLinks = () => {
  const linksGroup = new THREE.Group();
  const nodesGroup = new THREE.Group();

  rootGroup.add(linksGroup);
  rootGroup.add(nodesGroup);

  props.nodes.forEach((node, index) => {
    const tone = safeColor(node.tone);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: tone,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const line = new THREE.Line(createLineGeometry(), lineMaterial);

    linksGroup.add(line);
    linkRecords.set(node.id, {
      line,
      material: lineMaterial
    });

    const group = new THREE.Group();
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: tone,
      transparent: true,
      opacity: 0.62,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: tone,
      transparent: true,
      opacity: 0.1,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: tone,
      transparent: true,
      opacity: 0.36,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const halo = new THREE.Mesh(new THREE.SphereGeometry(3.6, 24, 12), haloMaterial);
    const sphere = new THREE.Mesh(new THREE.IcosahedronGeometry(1.55, 2), sphereMaterial);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.45, 0.035, 8, 64), ringMaterial);

    ring.rotation.x = Math.PI / 2.4;
    group.add(halo, sphere, ring);
    nodesGroup.add(group);

    nodeRecords.set(node.id, {
      group,
      sphere,
      halo,
      ring,
      sphereMaterial,
      haloMaterial,
      ringMaterial,
      basePosition: new THREE.Vector3(),
      baseZ: Math.sin(index * 1.42) * 7,
      index
    });
  });
};

const createActiveParticles = () => {
  for (let index = 0; index < 4; index += 1) {
    const material = new THREE.MeshBasicMaterial({
      color: safeColor(props.activeTone),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const particle = new THREE.Mesh(new THREE.SphereGeometry(0.58, 12, 8), material);

    particle.visible = false;
    particle.userData.offset = index / 4;
    activeParticles.push(particle);
    rootGroup.add(particle);
  }
};

const updateLinkGeometry = () => {
  const corePosition = coreGroup?.position ?? new THREE.Vector3();

  linkRecords.forEach((record, nodeId) => {
    const nodeRecord = nodeRecords.get(nodeId);

    if (!nodeRecord) {
      return;
    }

    const positions = record.line.geometry.attributes.position;
    positions.setXYZ(0, corePosition.x, corePosition.y, corePosition.z);
    positions.setXYZ(
      1,
      nodeRecord.group.position.x,
      nodeRecord.group.position.y,
      nodeRecord.group.position.z
    );
    positions.needsUpdate = true;
  });
};

const updateNodePositions = () => {
  const corePosition = getCorePosition();

  if (coreGroup) {
    coreGroup.position.set(corePosition.x, corePosition.y, -4);
  }

  props.nodes.forEach((node) => {
    const record = nodeRecords.get(node.id);

    if (!record) {
      return;
    }

    const position = percentToWorld(node.resolvedX, node.resolvedY);
    record.basePosition.set(position.x, position.y, record.baseZ);
    record.group.position.copy(record.basePosition);
  });

  updateLinkGeometry();
};

const updateActiveState = () => {
  if (!THREE) {
    return;
  }

  const activeColor = safeColor(props.activeTone);
  const hasActiveNode = Boolean(props.activeNodeId);

  coreGlowMaterial?.color.copy(activeColor);
  coreInnerMaterial?.color.copy(activeColor);

  coreGroup?.children.forEach((child) => {
    if (child.geometry?.type === "TorusGeometry") {
      child.material.color.copy(activeColor);
    }
  });

  nodeRecords.forEach((record, nodeId) => {
    const isActive = nodeId === props.activeNodeId;
    const faded = hasActiveNode && !isActive;

    record.sphereMaterial.opacity = isActive ? 0.96 : faded ? 0.34 : 0.62;
    record.haloMaterial.opacity = isActive ? 0.26 : faded ? 0.05 : 0.1;
    record.ringMaterial.opacity = isActive ? 0.64 : faded ? 0.14 : 0.36;
  });

  linkRecords.forEach((record, nodeId) => {
    const isActive = nodeId === props.activeNodeId;
    record.material.opacity = isActive ? 0.72 : hasActiveNode ? 0.06 : 0.12;
  });

  activeParticles.forEach((particle) => {
    particle.material.color.copy(activeColor);
    particle.visible = hasActiveNode;
    particle.material.opacity = hasActiveNode ? 0.62 : 0;
  });
};

const createSceneContent = () => {
  if (!THREE || !scene) {
    return;
  }

  clearSceneContent();

  rootGroup = new THREE.Group();
  scene.add(rootGroup);

  createRings();
  createCore();
  createNodesAndLinks();
  createActiveParticles();
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

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.setSize(width, height, false);

  camera.left = -worldWidth / 2;
  camera.right = worldWidth / 2;
  camera.top = worldHeight / 2;
  camera.bottom = -worldHeight / 2;
  camera.updateProjectionMatrix();

  updateOrbitScale();
  updateNodePositions();
};

const updateParticles = (elapsed) => {
  const activeRecord = nodeRecords.get(props.activeNodeId);

  if (!activeRecord || !coreGroup) {
    activeParticles.forEach((particle) => {
      particle.visible = false;
    });
    return;
  }

  const start = coreGroup.position;
  const end = activeRecord.group.position;

  activeParticles.forEach((particle, index) => {
    const progress = (elapsed * 0.34 + particle.userData.offset) % 1;
    const ease = 0.5 - Math.cos(progress * Math.PI) / 2;

    particle.visible = true;
    particle.position.lerpVectors(start, end, ease);
    particle.position.z += Math.sin((progress + index) * Math.PI * 2) * 1.4;
    particle.scale.setScalar(0.74 + Math.sin(progress * Math.PI) * 0.52);
    particle.material.opacity = 0.18 + Math.sin(progress * Math.PI) * 0.52;
  });
};

const renderScene = () => {
  if (!renderer || !scene || !camera) {
    return;
  }

  if (!sceneStartedAt) {
    sceneStartedAt = window.performance.now();
  }

  const elapsed = (window.performance.now() - sceneStartedAt) / 1000;
  const now = window.performance.now();
  const pulseProgress = pulseStartedAt ? Math.max(0, 1 - (now - pulseStartedAt) / 760) : 0;
  const pulseEase = pulseProgress * pulseProgress;

  ringsGroup?.children.forEach((ring) => {
    ring.rotation.z = ring.userData.offset + elapsed * ring.userData.speed;
    ring.rotation.x = ring.userData.tilt + Math.sin(elapsed * 0.42 + ring.userData.offset) * 0.045;
  });

  if (coreGroup) {
    coreGroup.rotation.y = elapsed * 0.42;
    coreGroup.rotation.x = Math.sin(elapsed * 0.54) * 0.14;
    coreGroup.scale.setScalar(1 + pulseEase * 0.12);
  }

  nodeRecords.forEach((record, nodeId) => {
    const isActive = nodeId === props.activeNodeId;
    const targetScale = isActive ? 1.28 + pulseEase * 0.2 : props.activeNodeId ? 0.9 : 1;
    const nextScale = isMotionLite.value ? targetScale : record.group.scale.x + (targetScale - record.group.scale.x) * 0.09;
    const bob = isMotionLite.value ? 0 : Math.sin(elapsed * 1.2 + record.index * 0.84) * 1.05;
    const driftZ = isMotionLite.value ? 0 : Math.cos(elapsed * 0.82 + record.index) * 1.7;

    record.group.position.set(record.basePosition.x, record.basePosition.y + bob, record.basePosition.z + driftZ);
    record.group.rotation.y = elapsed * (0.28 + record.index * 0.015);
    record.group.rotation.z = Math.sin(elapsed * 0.52 + record.index) * 0.12;
    record.group.scale.setScalar(nextScale);
  });

  updateLinkGeometry();
  updateParticles(elapsed);

  if (!pulseProgress) {
    pulseStartedAt = 0;
  }

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

  if (isDisposed) {
    return;
  }

  if (!canvasRef.value || !containerRef.value) {
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

  resizeObserver = new ResizeObserver(() => {
    updateSize();
    renderScene();
  });
  resizeObserver.observe(containerRef.value);

  if (!isMotionLite.value) {
    startAnimation();
  }
};

onMounted(initScene);

watch(
  () =>
    props.nodes
      .map((node) => `${node.id}:${node.resolvedX}:${node.resolvedY}:${node.tone}`)
      .join("|"),
  () => {
    createSceneContent();
    updateSize();
    renderScene();
  }
);

watch(
  () => [props.activeNodeId, props.activeTone],
  () => {
    updateActiveState();
    renderScene();
  }
);

watch(
  () => props.pulsing,
  (isPulsing) => {
    if (isPulsing) {
      pulseStartedAt = window.performance.now();
      startAnimation();
    }
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
    :class="['skill-universe-scene', { 'is-unavailable': isUnavailable }]"
    aria-hidden="true"
  >
    <canvas ref="canvasRef" class="skill-universe-canvas" />
    <span class="skill-universe-fallback" />
  </div>
</template>
