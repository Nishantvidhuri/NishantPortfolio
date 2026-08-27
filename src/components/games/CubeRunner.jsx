import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { FaPlay, FaRedo, FaTrophy } from "react-icons/fa";

const LANES = [-2.6, 0, 2.6];

function CubeRunner() {
  const mountRef = useRef(null);
  const stateRef = useRef({ running: false });
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(
    () => Number(localStorage.getItem("cubeRunnerHigh")) || 0
  );

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // --- Scene setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a12);
    scene.fog = new THREE.Fog(0x0a0a12, 20, 58);

    const camera = new THREE.PerspectiveCamera(
      68,
      mount.clientWidth / mount.clientHeight,
      0.1,
      120
    );
    camera.position.set(0, 3.4, 7);
    camera.lookAt(0, 0.8, -12);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const dir = new THREE.DirectionalLight(0xffffff, 1.1);
    dir.position.set(4, 8, 4);
    scene.add(dir);

    // Moving neon grid floor (two tiles leapfrogging for infinite scroll)
    const grids = [0, -40].map((z) => {
      const g = new THREE.GridHelper(40, 24, 0xe50914, 0x1f1f2e);
      g.position.set(0, 0, z);
      scene.add(g);
      return g;
    });

    // Glowing lane pylons rushing past for speed feel
    const pylonGeo = new THREE.BoxGeometry(0.28, 1.3, 0.28);
    const pylonMat = new THREE.MeshStandardMaterial({
      color: 0xe50914,
      emissive: 0xe50914,
      emissiveIntensity: 1.1,
    });
    const pylons = [];
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 9; i++) {
        const p = new THREE.Mesh(pylonGeo, pylonMat);
        p.position.set(side * 4.2, 0.65, 4 - i * 8);
        scene.add(p);
        pylons.push(p);
      }
    }

    // Streaming starfield
    const starCount = 320;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() * 2 - 1) * 34;
      starPos[i * 3 + 1] = Math.random() * 17 + 1;
      starPos[i * 3 + 2] = -Math.random() * 90 + 10;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.09,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // --- Player ship: designed to look good FROM BEHIND (the camera view) ---
    const ship = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xe50914,
      roughness: 0.3,
      metalness: 0.35,
      flatShading: true,
    });

    // Flat dart fuselage
    const bodyGeo = new THREE.ConeGeometry(0.62, 2.1, 4);
    bodyGeo.rotateY(Math.PI / 4); // flat square cross-section
    bodyGeo.rotateX(-Math.PI / 2); // nose forward (-z)
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.scale.y = 0.5; // sleek, flattened profile
    body.position.z = -0.2;
    ship.add(body);

    // Swept delta wing (one wide slab at the rear)
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x9c0810,
      roughness: 0.45,
      flatShading: true,
    });
    const wing = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.09, 0.85), wingMat);
    wing.position.set(0, -0.06, 0.5);
    ship.add(wing);

    // Wingtip fins (vertical, like a podracer)
    const finGeo = new THREE.BoxGeometry(0.07, 0.34, 0.62);
    const finL = new THREE.Mesh(finGeo, wingMat);
    finL.position.set(-1.17, 0.12, 0.5);
    ship.add(finL);
    const finR = new THREE.Mesh(finGeo, wingMat);
    finR.position.set(1.17, 0.12, 0.5);
    ship.add(finR);

    // Tail fin
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.45, 0.6), bodyMat);
    tail.position.set(0, 0.28, 0.55);
    ship.add(tail);

    // Cockpit bubble, embedded toward the nose
    const cockpit = new THREE.Mesh(
      new THREE.SphereGeometry(0.17, 12, 12),
      new THREE.MeshStandardMaterial({
        color: 0xbfe8ff,
        emissive: 0x9fd9ff,
        emissiveIntensity: 0.9,
        roughness: 0.1,
      })
    );
    cockpit.scale.set(1, 0.75, 1.5);
    cockpit.position.set(0, 0.17, -0.45);
    ship.add(cockpit);

    // Twin engine exhausts with short flames pointing back
    const nozzleMat = new THREE.MeshStandardMaterial({
      color: 0x2a2a2e,
      roughness: 0.6,
      metalness: 0.6,
    });
    const nozzleGeo = new THREE.CylinderGeometry(0.13, 0.16, 0.3, 10);
    nozzleGeo.rotateX(Math.PI / 2);
    const flameMat = new THREE.MeshStandardMaterial({
      color: 0xff9a2a,
      emissive: 0xff7b1c,
      emissiveIntensity: 2.4,
      transparent: true,
      opacity: 0.95,
    });
    const flameGeo = new THREE.ConeGeometry(0.12, 0.55, 8);
    flameGeo.rotateX(Math.PI / 2); // tip points backwards (+z)
    const flames = [];
    [-0.4, 0.4].forEach((x) => {
      const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
      nozzle.position.set(x, 0, 0.85);
      ship.add(nozzle);
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.set(x, 0, 1.25);
      ship.add(flame);
      flames.push(flame);
    });

    const engineLight = new THREE.PointLight(0xff7b1c, 2.2, 6);
    engineLight.position.set(0, 0.2, 1.3);
    ship.add(engineLight);
    const shipGlow = new THREE.PointLight(0xe50914, 1.4, 9);
    shipGlow.position.set(0, 1.2, 0);
    ship.add(shipGlow);

    ship.position.set(0, 0.75, 0);
    scene.add(ship);

    // --- Obstacles: varied neon shapes ---
    const obstacleGeos = [
      new THREE.IcosahedronGeometry(0.95, 0),
      new THREE.DodecahedronGeometry(0.95, 0),
      new THREE.TorusGeometry(0.72, 0.3, 8, 14),
      new THREE.ConeGeometry(0.85, 1.7, 5),
      new THREE.OctahedronGeometry(1.0, 0),
      new THREE.TorusKnotGeometry(0.55, 0.2, 48, 8),
    ];

    const st = {
      running: false,
      lane: 1,
      obstacles: [],
      speed: 14,
      spawnTimer: 0,
      score: 0,
      raf: 0,
      last: performance.now(),
      t: 0,
    };
    stateRef.current = st;

    const spawnObstacle = () => {
      const geo = obstacleGeos[Math.floor(Math.random() * obstacleGeos.length)];
      const hue = Math.random();
      const color = new THREE.Color().setHSL(hue, 0.85, 0.55);
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: new THREE.Color().setHSL(hue, 0.85, 0.28),
        emissiveIntensity: 0.9,
        roughness: 0.35,
        flatShading: true,
      });
      const m = new THREE.Mesh(geo, mat);
      m.position.set(LANES[Math.floor(Math.random() * 3)], 1.0, -60);
      m.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      m.userData.spin = {
        x: (Math.random() - 0.5) * 2.4,
        y: (Math.random() - 0.5) * 2.4,
      };
      scene.add(m);
      st.obstacles.push(m);
    };

    const endGame = () => {
      st.running = false;
      setGameOver(true);
      setGameStarted(false);
      const final = Math.floor(st.score);
      setHighScore((h) => {
        const next = Math.max(h, final);
        localStorage.setItem("cubeRunnerHigh", String(next));
        return next;
      });
    };

    const loop = (now) => {
      st.raf = requestAnimationFrame(loop);
      const dt = Math.min((now - st.last) / 1000, 0.05);
      st.last = now;
      st.t += dt;

      // Engine flame flicker (always alive)
      const flick = 0.8 + Math.sin(st.t * 34) * 0.22 + Math.random() * 0.1;
      const stretch = flick * (st.running ? 1 + st.speed * 0.012 : 1);
      flames.forEach((f, i) => f.scale.set(1, 1, i === 0 ? stretch : stretch * 0.92));
      engineLight.intensity = 1.8 + Math.sin(st.t * 40) * 0.6;

      if (!st.running) {
        // Idle: gentle hover + slow show-off yaw
        ship.position.y = 0.75 + Math.sin(st.t * 2.2) * 0.12;
        ship.rotation.y = Math.sin(st.t * 0.7) * 0.5;
        ship.rotation.z = Math.sin(st.t * 1.4) * 0.08;
        renderer.render(scene, camera);
        return;
      }

      st.speed += dt * 0.55;
      st.score += dt * st.speed;
      setScore(Math.floor(st.score));

      // Slide ship toward its lane, banking into the turn
      const targetX = LANES[st.lane];
      ship.position.x += (targetX - ship.position.x) * Math.min(1, dt * 14);
      ship.position.y = 0.75 + Math.sin(st.t * 6) * 0.05;
      ship.rotation.y = 0;
      ship.rotation.z = THREE.MathUtils.clamp((ship.position.x - targetX) * 0.45, -0.55, 0.55);
      ship.rotation.x = -0.04;

      // Speed-based FOV kick
      camera.fov = 66 + Math.min(16, st.speed * 0.28);
      camera.updateProjectionMatrix();

      // Scroll world
      grids.forEach((g) => {
        g.position.z += st.speed * dt;
        if (g.position.z > 20) g.position.z -= 80;
      });
      pylons.forEach((p) => {
        p.position.z += st.speed * dt;
        if (p.position.z > 8) p.position.z -= 72;
      });
      const pos = starGeo.attributes.position;
      for (let i = 0; i < starCount; i++) {
        pos.array[i * 3 + 2] += st.speed * dt * 0.55;
        if (pos.array[i * 3 + 2] > 12) pos.array[i * 3 + 2] -= 100;
      }
      pos.needsUpdate = true;

      // Spawn + move obstacles
      st.spawnTimer -= dt;
      if (st.spawnTimer <= 0) {
        spawnObstacle();
        if (Math.random() < 0.35) spawnObstacle();
        st.spawnTimer = Math.max(0.32, 1.05 - st.speed * 0.012);
      }
      for (let i = st.obstacles.length - 1; i >= 0; i--) {
        const o = st.obstacles[i];
        o.position.z += st.speed * dt;
        o.rotation.x += dt * o.userData.spin.x;
        o.rotation.y += dt * o.userData.spin.y;
        if (o.position.z > 8) {
          scene.remove(o);
          o.material.dispose();
          st.obstacles.splice(i, 1);
        } else if (
          Math.abs(o.position.z - ship.position.z) < 1.25 &&
          Math.abs(o.position.x - ship.position.x) < 1.25
        ) {
          endGame();
        }
      }

      renderer.render(scene, camera);
    };
    st.raf = requestAnimationFrame(loop);

    // Controls — keys + swipe left/right
    const move = (dirn) => {
      st.lane = Math.max(0, Math.min(2, st.lane + dirn));
    };
    const onKey = (e) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") move(-1);
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") move(1);
    };
    // Swipe: exactly ONE lane change per swipe gesture — triggers as soon
    // as the finger crosses the threshold, then ignores the rest of the
    // drag until the finger lifts. Flick again for the next lane.
    const swipe = { active: false, startX: 0, consumed: false };
    const onPointerDown = (e) => {
      swipe.active = true;
      swipe.consumed = false;
      swipe.startX = e.clientX;
    };
    const onPointerMove = (e) => {
      if (!swipe.active || swipe.consumed || !st.running) return;
      const dx = e.clientX - swipe.startX;
      if (Math.abs(dx) > 30) {
        move(dx > 0 ? 1 : -1);
        swipe.consumed = true;
      }
    };
    const onPointerUp = () => {
      swipe.active = false;
    };
    window.addEventListener("keydown", onKey);
    mount.addEventListener("pointerdown", onPointerDown);
    mount.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(st.raf);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointerup", onPointerUp);
      mount.removeEventListener("pointerdown", onPointerDown);
      mount.removeEventListener("pointermove", onPointerMove);
      st.obstacles.forEach((o) => o.material.dispose());
      obstacleGeos.forEach((g) => g.dispose());
      pylonGeo.dispose();
      pylonMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      ship.traverse((c) => {
        if (c.isMesh) {
          c.geometry.dispose();
          c.material.dispose();
        }
      });
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  const startGame = () => {
    const st = stateRef.current;
    // Reset world
    st.obstacles?.forEach((o) => o.parent?.remove(o));
    if (st.obstacles) st.obstacles.length = 0;
    st.lane = 1;
    st.speed = 14;
    st.score = 0;
    st.spawnTimer = 0.4;
    st.running = true;
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-16 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
        <div className="bg-[#e50914] text-white px-3 py-1 rounded-md flex items-center gap-2">
          <FaTrophy /> <span className="font-bold">{score}</span>
        </div>
        <span className="text-gray-400 text-sm">Best: {highScore}</span>
      </div>

      <div className="absolute inset-0 touch-none select-none">
        <div ref={mountRef} className="absolute inset-0" />

        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 text-center px-4">
            <h3 className="text-3xl font-bold text-[#e50914] mb-2">Cube Runner 3D</h3>
            <p className="text-gray-300 mb-6">
              Dodge the blocks! Arrow keys / A–D, or swipe left & right.
            </p>
            <button
              onClick={startGame}
              className="flex items-center bg-[#e50914] text-white px-6 py-3 rounded-md hover:bg-[#f6121d] font-bold"
            >
              <FaPlay className="mr-2" /> Start
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 text-center px-4">
            <h3 className="text-3xl font-bold text-[#e50914] mb-1">Crashed!</h3>
            <p className="text-xl text-white mb-1">Score: {score}</p>
            <p className="text-gray-400 mb-5">Best: {highScore}</p>
            <button
              onClick={startGame}
              className="flex items-center bg-[#e50914] text-white px-6 py-3 rounded-md hover:bg-[#f6121d] font-bold"
            >
              <FaRedo className="mr-2" /> Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CubeRunner;
