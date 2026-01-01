import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.154.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.154.0/examples/jsm/controls/OrbitControls.js';

// Basic scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// Lights
scene.add(new THREE.HemisphereLight(0xffffbb, 0x080820, 1));
const dir = new THREE.DirectionalLight(0xffffff, 0.6);
dir.position.set(5, 10, 7);
scene.add(dir);

// Ground
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(400, 400),
  new THREE.MeshStandardMaterial({ color: 0x2b7a00 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Grid for reference
const grid = new THREE.GridHelper(200, 40, 0x444444, 0x666666);
scene.add(grid);

// Player (simple box)
const player = new THREE.Mesh(
  new THREE.BoxGeometry(1, 2, 1),
  new THREE.MeshStandardMaterial({ color: 0xffcc99 })
);
player.position.set(0, 1, 0);
scene.add(player);

// Vehicle (simple box)
const vehicle = new THREE.Mesh(
  new THREE.BoxGeometry(2, 1, 4),
  new THREE.MeshStandardMaterial({ color: 0xff0000 })
);
vehicle.position.set(6, 0.5, 0);
scene.add(vehicle);

// Camera follow params
let controlled = 'player';
const followOffset = new THREE.Vector3(0, 4, -8);

// Controls
const keys = {};
window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; if (e.key === 'e' || e.key === 'E') tryEnterExit(); if (e.key === 'r' || e.key === 'R') reset(); });
window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

// Player physics
const playerState = { vel: new THREE.Vector3(), speed: 6 };
// Vehicle physics
const vehicleState = { speed: 0, maxSpeed: 20, accel: 30, brake: 40, steer: 1.5 };

function tryEnterExit() {
  if (controlled === 'player') {
    const d = player.position.distanceTo(vehicle.position);
    if (d < 3) {
      controlled = 'vehicle';
      // hide player briefly
      player.visible = false;
      // place player inside car
    }
  } else {
    controlled = 'player';
    player.visible = true;
    // place player next to vehicle
    player.position.copy(vehicle.position).add(new THREE.Vector3(2.5, 0, 0));
  }
}

function reset() {
  player.position.set(0, 1, 0);
  playerState.vel.set(0, 0, 0);
  vehicle.position.set(6, 0.5, 0);
  vehicle.rotation.set(0, 0, 0);
  vehicleState.speed = 0;
  controlled = 'player';
  player.visible = true;
}

// Small helper to get forward direction of an object in XZ plane
function getForward(obj) {
  const forward = new THREE.Vector3(0, 0, -1);
  forward.applyQuaternion(obj.quaternion);
  forward.y = 0;
  forward.normalize();
  return forward;
}

// Camera smoothing
const cameraLerp = 0.12;

let last = performance.now();
function animate() {
  const now = performance.now();
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;

  // Player movement
  if (controlled === 'player') {
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();

    if (keys['w']) forward.z -= 1;
    if (keys['s']) forward.z += 1;
    if (keys['a']) forward.x -= 1;
    if (keys['d']) forward.x += 1;

    const dir = new THREE.Vector3(forward.x, 0, forward.z);
    if (dir.lengthSq() > 0) {
      dir.normalize();
      // move relative to camera orientation
      const camDir = new THREE.Vector3();
      camera.getWorldDirection(camDir);
      camDir.y = 0; camDir.normalize();
      const camRight = new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0), camDir).normalize();
      const move = new THREE.Vector3();
      move.copy(camDir).multiplyScalar(-dir.z).add(camRight.multiplyScalar(dir.x));
      move.normalize().multiplyScalar(playerState.speed * dt);
      player.position.add(move);
      // rotate player to movement dir
      player.lookAt(player.position.clone().add(move));
    }
  } else {
    // Vehicle controls
    if (keys['w']) vehicleState.speed += vehicleState.accel * dt;
    else if (keys['s']) vehicleState.speed -= vehicleState.brake * dt;
    else vehicleState.speed *= 0.98; // friction

    vehicleState.speed = THREE.MathUtils.clamp(vehicleState.speed, -vehicleState.maxSpeed, vehicleState.maxSpeed);

    let steer = 0;
    if (keys['a']) steer += 1;
    if (keys['d']) steer -= 1;

    // simple kinematic car
    const distance = vehicleState.speed * dt;
    vehicle.rotation.y += steer * vehicleState.steer * (distance / 2);
    const forward = getForward(vehicle);
    vehicle.position.addScaledVector(forward, distance);
  }

  // Keep player on ground
  player.position.y = 1;
  vehicle.position.y = 0.5;

  // Camera follow
  const target = (controlled === 'player') ? player : vehicle;
  const desired = new THREE.Vector3().copy(followOffset).applyQuaternion(target.quaternion).add(target.position);
  camera.position.lerp(desired, cameraLerp);
  camera.lookAt(target.position.clone().add(new THREE.Vector3(0, 1.5, 0)));

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// Initial camera placement
camera.position.set(0, 6, -10);
camera.lookAt(player.position);

// Optional orbital controls for debugging (press O to toggle)
let orbit; let orbitOn = false;
window.addEventListener('keydown', (e) => { if (e.key.toLowerCase() === 'o') { orbitOn = !orbitOn; if (orbitOn) { orbit = new OrbitControls(camera, renderer.domElement); } else if (orbit) { orbit.dispose(); orbit = null; } } });

animate();

// Debug helpers (console)
console.log('Prototype ready — WASD to move, E to enter/exit vehicle, R to reset');
