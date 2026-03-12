import * as THREE from "https://unpkg.com/three@0.164.1/build/three.module.js";
import { PointerLockControls } from "https://unpkg.com/three@0.164.1/examples/jsm/controls/PointerLockControls.js";

const canvas = document.querySelector("#scene");
const titleScreen = document.querySelector("#title-screen");
const pauseScreen = document.querySelector("#pause-screen");
const playBtn = document.querySelector("#play-btn");
const resumeBtn = document.querySelector("#resume-btn");
const hud = document.querySelector("#hud");
const coords = document.querySelector("#coords");

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x06080e);
scene.fog = new THREE.FogExp2(0x06080e, 0.013);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(0, 2, 22);

const controls = new PointerLockControls(camera, document.body);

const ambient = new THREE.HemisphereLight(0xb2c4ff, 0x151515, 0.42);
scene.add(ambient);

const moon = new THREE.DirectionalLight(0x6d84ff, 1.15);
moon.position.set(28, 35, -10);
moon.castShadow = true;
moon.shadow.mapSize.set(2048, 2048);
moon.shadow.camera.near = 0.5;
moon.shadow.camera.far = 120;
moon.shadow.camera.left = -40;
moon.shadow.camera.right = 40;
moon.shadow.camera.top = 40;
moon.shadow.camera.bottom = -40;
scene.add(moon);

const wetGroundMat = new THREE.MeshStandardMaterial({
  color: 0x1c1f2f,
  roughness: 0.15,
  metalness: 0.55
});

const ground = new THREE.Mesh(new THREE.PlaneGeometry(180, 180), wetGroundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const roadMat = new THREE.MeshStandardMaterial({ color: 0x0b0b10, roughness: 0.22, metalness: 0.62 });

function addRoad(width, depth, x = 0, z = 0) {
  const road = new THREE.Mesh(new THREE.BoxGeometry(width, 0.08, depth), roadMat);
  road.position.set(x, 0.04, z);
  road.receiveShadow = true;
  scene.add(road);
}

addRoad(24, 120, 0, 0);
addRoad(120, 26, 0, 0);
addRoad(14, 90, -36, 10);
addRoad(14, 95, 34, -4);

function addCrosswalk(x, z, horizontal = true) {
  const group = new THREE.Group();
  const stripeCount = 12;
  const stripeMat = new THREE.MeshBasicMaterial({ color: 0xf2f2f3 });
  for (let i = 0; i < stripeCount; i++) {
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(horizontal ? 2.4 : 8, 0.02, horizontal ? 8 : 2.4),
      stripeMat
    );
    stripe.position.set(horizontal ? -13 + i * 2.35 : 0, 0.07, horizontal ? 0 : -13 + i * 2.35);
    group.add(stripe);
  }
  group.position.set(x, 0, z);
  scene.add(group);
}

addCrosswalk(0, 0, true);
addCrosswalk(0, 0, false);
addCrosswalk(-36, 4, false);
addCrosswalk(34, -2, false);

const billboardColors = [0x31e5ff, 0xff2f9f, 0xffc83f, 0x67ff9c, 0x9146ff];

function createBuilding(x, z, w, h, d) {
  const baseColor = new THREE.Color().setHSL(0.62, 0.2, 0.09 + Math.random() * 0.12);
  const building = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.65, metalness: 0.15 })
  );
  building.position.set(x, h / 2, z);
  building.castShadow = true;
  building.receiveShadow = true;
  scene.add(building);

  const signCount = 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < signCount; i++) {
    const neonColor = billboardColors[Math.floor(Math.random() * billboardColors.length)];
    const signHeight = 2 + Math.random() * 6;
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(2 + Math.random() * 4, 2 + Math.random() * 4),
      new THREE.MeshStandardMaterial({
        color: neonColor,
        emissive: neonColor,
        emissiveIntensity: 1.5,
        roughness: 0.35,
        metalness: 0.2,
        side: THREE.DoubleSide
      })
    );

    const side = Math.random() > 0.5 ? 1 : -1;
    sign.position.set(x + side * (w / 2 + 0.05), signHeight + 1.5, z + (Math.random() - 0.5) * (d * 0.8));
    sign.rotation.y = side === 1 ? -Math.PI / 2 : Math.PI / 2;
    scene.add(sign);

    const glow = new THREE.PointLight(neonColor, 1.4, 8, 2);
    glow.position.copy(sign.position).add(new THREE.Vector3(side * 0.6, 0, 0));
    scene.add(glow);
  }
}

const buildingBands = [
  { xMin: -62, xMax: -16 },
  { xMin: 16, xMax: 62 },
  { xMin: -62, xMax: 62, zMin: 20, zMax: 60 },
  { xMin: -62, xMax: 62, zMin: -60, zMax: -20 }
];

for (let i = 0; i < 120; i++) {
  const band = buildingBands[Math.floor(Math.random() * buildingBands.length)];
  const w = 5 + Math.random() * 9;
  const d = 5 + Math.random() * 9;
  const h = 8 + Math.random() * 36;

  const x = THREE.MathUtils.randFloat(band.xMin, band.xMax);
  const zRangeMin = band.zMin ?? -62;
  const zRangeMax = band.zMax ?? 62;
  const z = THREE.MathUtils.randFloat(zRangeMin, zRangeMax);

  if (Math.abs(x) < 14 && Math.abs(z) < 16) continue;
  createBuilding(x, z, w, h, d);
}

const particlesGeom = new THREE.BufferGeometry();
const particleCount = 900;
const positions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  const i3 = i * 3;
  positions[i3] = THREE.MathUtils.randFloatSpread(180);
  positions[i3 + 1] = Math.random() * 45;
  positions[i3 + 2] = THREE.MathUtils.randFloatSpread(180);
}

particlesGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
const drizzle = new THREE.Points(
  particlesGeom,
  new THREE.PointsMaterial({ color: 0x94b1ff, size: 0.08, transparent: true, opacity: 0.7 })
);
scene.add(drizzle);

const move = { forward: false, back: false, left: false, right: false, up: false, down: false, sprint: false };

let gameStarted = false;

function startGame() {
  controls.lock();
}

function showPause(visible) {
  pauseScreen.classList.toggle("visible", visible);
}

playBtn.addEventListener("click", startGame);
resumeBtn.addEventListener("click", startGame);

document.addEventListener("keydown", (e) => {
  if (e.code === "KeyW") move.forward = true;
  if (e.code === "KeyS") move.back = true;
  if (e.code === "KeyA") move.left = true;
  if (e.code === "KeyD") move.right = true;
  if (e.code === "KeyQ") move.down = true;
  if (e.code === "KeyE") move.up = true;
  if (e.code === "ShiftLeft") move.sprint = true;
});

document.addEventListener("keyup", (e) => {
  if (e.code === "KeyW") move.forward = false;
  if (e.code === "KeyS") move.back = false;
  if (e.code === "KeyA") move.left = false;
  if (e.code === "KeyD") move.right = false;
  if (e.code === "KeyQ") move.down = false;
  if (e.code === "KeyE") move.up = false;
  if (e.code === "ShiftLeft") move.sprint = false;
});

controls.addEventListener("lock", () => {
  gameStarted = true;
  titleScreen.classList.remove("visible");
  showPause(false);
  hud.classList.remove("hidden");
});

controls.addEventListener("unlock", () => {
  if (gameStarted) {
    showPause(true);
  }
});

const clock = new THREE.Clock();

function animate() {
  const delta = clock.getDelta();
  const speed = (move.sprint ? 19 : 10) * delta;

  if (controls.isLocked) {
    if (move.forward) controls.moveForward(speed);
    if (move.back) controls.moveForward(-speed);
    if (move.left) controls.moveRight(-speed);
    if (move.right) controls.moveRight(speed);
    if (move.up) camera.position.y += speed;
    if (move.down) camera.position.y -= speed;

    camera.position.y = THREE.MathUtils.clamp(camera.position.y, 1.5, 20);
  }

  coords.textContent = `X: ${camera.position.x.toFixed(1)} Y: ${camera.position.y.toFixed(1)} Z: ${camera.position.z.toFixed(1)}`;

  const rain = drizzle.geometry.attributes.position;
  for (let i = 0; i < particleCount; i++) {
    const yIndex = i * 3 + 1;
    rain.array[yIndex] -= delta * 22;
    if (rain.array[yIndex] < 0.2) {
      rain.array[yIndex] = 45;
    }
  }
  rain.needsUpdate = true;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
