import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { FaPlay, FaRedo, FaTrophy, FaClock } from "react-icons/fa";
import { sfx, haptic, shake } from './gameFeel';

const ARENA = 15; // half-size of the play field
const GAME_TIME = 60;

function OrbHunt() {
  const mountRef = useRef(null);
  const apiRef = useRef({});
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [highScore, setHighScore] = useState(
    () => Number(localStorage.getItem("orbHigh")) || 0
  );

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0b18);
    scene.fog = new THREE.Fog(0x0b0b18, 30, 62);

    const camera = new THREE.PerspectiveCamera(
      65,
      mount.clientWidth / mount.clientHeight,
      0.1,
      140
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    const dl = new THREE.DirectionalLight(0xffffff, 0.9);
    dl.position.set(6, 12, 6);
    scene.add(dl);

    // Corner mood lights — each corner a different color
    const cornerColors = [0x22d3ee, 0xd946ef, 0xf97316, 0x8b5cf6];
    cornerColors.forEach((c, i) => {
      const l = new THREE.PointLight(c, 55, 30, 1.8);
      l.position.set(i % 2 ? ARENA - 1 : -ARENA + 1, 5, i < 2 ? ARENA - 1 : -ARENA + 1);
      scene.add(l);
    });

    // Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(ARENA * 2, ARENA * 2),
      new THREE.MeshStandardMaterial({ color: 0x141428, roughness: 0.85 })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
    const grid = new THREE.GridHelper(ARENA * 2, 20, 0xe50914, 0x26264a);
    grid.position.y = 0.01;
    scene.add(grid);

    // Arena walls + glowing corner pillars
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xe50914,
      emissive: 0xe50914,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.4,
    });
    [
      [0, -ARENA, ARENA * 2, 0.02],
      [0, ARENA, ARENA * 2, 0.02],
      [-ARENA, 0, 0.02, ARENA * 2],
      [ARENA, 0, 0.02, ARENA * 2],
    ].forEach(([x, z, sx, sz]) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(sx, 1.2, sz), wallMat);
      wall.position.set(x, 0.6, z);
      scene.add(wall);
    });
    const pillarGeo = new THREE.BoxGeometry(0.7, 2.6, 0.7);
    const pillarTopGeo = new THREE.OctahedronGeometry(0.42, 0);
    const pillars = [];
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz], i) => {
      const mat = new THREE.MeshStandardMaterial({
        color: 0x1c1c2e,
        roughness: 0.6,
        metalness: 0.4,
      });
      const p = new THREE.Mesh(pillarGeo, mat);
      p.position.set(sx * ARENA, 1.3, sz * ARENA);
      scene.add(p);
      const topMat = new THREE.MeshStandardMaterial({
        color: cornerColors[i],
        emissive: cornerColors[i],
        emissiveIntensity: 1.6,
      });
      const top = new THREE.Mesh(pillarTopGeo, topMat);
      top.position.set(sx * ARENA, 3.1, sz * ARENA);
      scene.add(top);
      pillars.push(top);
    });

    // Star dome
    const starCount = 260;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() * 2 - 1) * 55;
      starPos[i * 3 + 1] = Math.random() * 26 + 3;
      starPos[i * 3 + 2] = (Math.random() * 2 - 1) * 55;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.12,
      transparent: true,
      opacity: 0.75,
    });
    scene.add(new THREE.Points(starGeo, starMat));

    // --- Player: energy sphere (rolling core + spinning shell + gold ring) ---
    const player = new THREE.Group();
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.72, 32, 32),
      new THREE.MeshStandardMaterial({
        color: 0xe50914,
        emissive: 0xe50914,
        emissiveIntensity: 0.55,
        roughness: 0.2,
        metalness: 0.15,
      })
    );
    player.add(core);

    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.98, 1),
      new THREE.MeshBasicMaterial({
        color: 0xff4d55,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
      })
    );
    player.add(shell);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.18, 0.05, 10, 40),
      new THREE.MeshStandardMaterial({
        color: 0xffc93c,
        emissive: 0xffc93c,
        emissiveIntensity: 1.3,
      })
    );
    ring.rotation.x = Math.PI / 2.4;
    player.add(ring);

    const glow = new THREE.PointLight(0xe50914, 2.2, 9);
    glow.position.y = 0.4;
    player.add(glow);

    player.position.y = 0.75;
    scene.add(player);

    // --- Orbs: glowing gems with halo rings ---
    const orbCoreGeo = new THREE.OctahedronGeometry(0.4, 0);
    const orbRingGeo = new THREE.TorusGeometry(0.58, 0.035, 8, 26);
    const orbs = [];
    const spawnOrb = () => {
      const hue = Math.random();
      const color = new THREE.Color().setHSL(hue, 0.9, 0.6);
      const g = new THREE.Group();

      const coreMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color.clone(),
        emissiveIntensity: 0.9,
        roughness: 0.15,
        flatShading: true,
      });
      const c = new THREE.Mesh(orbCoreGeo, coreMat);
      g.add(c);

      const ringMat = new THREE.MeshStandardMaterial({
        color: color.clone().offsetHSL(0, 0, 0.15),
        emissive: color.clone(),
        emissiveIntensity: 0.7,
        transparent: true,
        opacity: 0.85,
      });
      const r = new THREE.Mesh(orbRingGeo, ringMat);
      r.rotation.x = Math.random() * Math.PI;
      g.add(r);

      g.position.set(
        (Math.random() * 2 - 1) * (ARENA - 2),
        0.95,
        (Math.random() * 2 - 1) * (ARENA - 2)
      );
      g.userData = {
        core: c,
        ring: r,
        coreMat,
        ringMat,
        phase: Math.random() * Math.PI * 2,
        spin: 1.4 + Math.random() * 1.6,
      };
      scene.add(g);
      orbs.push(g);
    };

    const st = {
      running: false,
      vx: 0, vz: 0,
      keys: {},
      time: GAME_TIME,
      score: 0,
      raf: 0, last: performance.now(),
      t: 0,
    };
    apiRef.current.st = st;

    const onKey = (e, down) => {
      const k = e.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(k)) {
        e.preventDefault();
        st.keys[k] = down;
      }
    };
    const onKeyDown = (e) => onKey(e, true);
    const onKeyUp = (e) => onKey(e, false);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // Touch: push ball toward drag direction
    const touch = { active: false, x: 0, y: 0 };
    const setTouch = (e) => {
      const rect = mount.getBoundingClientRect();
      touch.x = (e.clientX - rect.left) / rect.width - 0.5;
      touch.y = (e.clientY - rect.top) / rect.height - 0.5;
    };
    const onPointerDown = (e) => {
      touch.active = true;
      setTouch(e);
    };
    const onPointerMove = (e) => {
      if (touch.active) setTouch(e);
    };
    const onPointerUp = () => (touch.active = false);
    mount.addEventListener("pointerdown", onPointerDown);
    mount.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    const endGame = () => {
      st.running = false;
      sfx.fail(); haptic([40, 30, 60]);
      setGameOver(true);
      setGameStarted(false);
      setHighScore((h) => {
        const next = Math.max(h, st.score);
        localStorage.setItem("orbHigh", String(next));
        return next;
      });
    };

    const loop = (now) => {
      st.raf = requestAnimationFrame(loop);
      const dt = Math.min((now - st.last) / 1000, 0.05);
      st.last = now;
      st.t += dt;

      // Orb animation always on: bob, spin, pulse
      orbs.forEach((o, i) => {
        const u = o.userData;
        o.position.y = 0.95 + Math.sin(st.t * 3 + u.phase) * 0.2;
        u.core.rotation.y += dt * u.spin;
        u.ring.rotation.z += dt * u.spin * 0.8;
        const pulse = 0.75 + Math.sin(st.t * 4 + u.phase) * 0.35;
        u.coreMat.emissiveIntensity = pulse;
        u.ringMat.emissiveIntensity = pulse * 0.8;
      });
      // Pillar tops slowly spin
      pillars.forEach((p, i) => (p.rotation.y += dt * (0.6 + i * 0.15)));
      // Player shell/ring counter-spin (independent of rolling)
      shell.rotation.y += dt * 0.9;
      shell.rotation.x -= dt * 0.4;
      ring.rotation.z += dt * 1.6;

      if (st.running) {
        st.time -= dt;
        setTimeLeft(Math.max(0, Math.ceil(st.time)));
        if (st.time <= 0) endGame();

        const ACC = 26;
        if (st.keys.arrowup || st.keys.w) st.vz -= ACC * dt;
        if (st.keys.arrowdown || st.keys.s) st.vz += ACC * dt;
        if (st.keys.arrowleft || st.keys.a) st.vx -= ACC * dt;
        if (st.keys.arrowright || st.keys.d) st.vx += ACC * dt;
        if (touch.active) {
          st.vx += touch.x * ACC * 2.2 * dt;
          st.vz += touch.y * ACC * 2.2 * dt;
        }

        // friction + clamp
        st.vx *= 1 - Math.min(1, 1.6 * dt);
        st.vz *= 1 - Math.min(1, 1.6 * dt);
        const vmax = 16;
        st.vx = Math.max(-vmax, Math.min(vmax, st.vx));
        st.vz = Math.max(-vmax, Math.min(vmax, st.vz));

        player.position.x += st.vx * dt;
        player.position.z += st.vz * dt;

        // walls bounce
        const lim = ARENA - 0.9;
        if (Math.abs(player.position.x) > lim) {
          player.position.x = Math.sign(player.position.x) * lim;
          st.vx *= -0.6;
        }
        if (Math.abs(player.position.z) > lim) {
          player.position.z = Math.sign(player.position.z) * lim;
          st.vz *= -0.6;
        }

        // rolling feel (core only — shell/ring spin on their own)
        core.rotation.z -= st.vx * dt * 1.2;
        core.rotation.x += st.vz * dt * 1.2;

        // collect orbs
        for (let i = orbs.length - 1; i >= 0; i--) {
          const o = orbs[i];
          const dx = o.position.x - player.position.x;
          const dz = o.position.z - player.position.z;
          if (dx * dx + dz * dz < 1.7) {
            scene.remove(o);
            o.userData.coreMat.dispose();
            o.userData.ringMat.dispose();
            orbs.splice(i, 1);
            st.score += 1;
            sfx.coin(); haptic(8);
            setScore(st.score);
            spawnOrb();
          }
        }
      }

      // Camera follows behind player
      const camTarget = new THREE.Vector3(
        player.position.x,
        9,
        player.position.z + 11
      );
      camera.position.lerp(camTarget, Math.min(1, dt * 4));
      camera.lookAt(player.position.x, 0.8, player.position.z);

      renderer.render(scene, camera);
    };
    st.raf = requestAnimationFrame(loop);

    const resetWorld = () => {
      player.position.set(0, 0.75, 0);
      st.vx = 0;
      st.vz = 0;
      while (orbs.length) {
        const o = orbs.pop();
        scene.remove(o);
        o.userData.coreMat.dispose();
        o.userData.ringMat.dispose();
      }
      for (let i = 0; i < 7; i++) spawnOrb();
    };
    apiRef.current.resetWorld = resetWorld;
    resetWorld();

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(st.raf);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointerup", onPointerUp);
      mount.removeEventListener("pointerdown", onPointerDown);
      mount.removeEventListener("pointermove", onPointerMove);
      orbs.forEach((o) => {
        o.userData.coreMat.dispose();
        o.userData.ringMat.dispose();
      });
      orbCoreGeo.dispose();
      orbRingGeo.dispose();
      pillarGeo.dispose();
      pillarTopGeo.dispose();
      starGeo.dispose();
      starMat.dispose();
      player.traverse((c) => {
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
    apiRef.current.resetWorld?.();
    const st = apiRef.current.st;
    st.time = GAME_TIME;
    st.score = 0;
    st.running = true;
    setScore(0);
    setTimeLeft(GAME_TIME);
    setGameOver(false);
    setGameStarted(true);
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-16 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
        <div className="bg-[#e50914] text-white px-3 py-1 rounded-md flex items-center gap-2">
          <FaTrophy /> <span className="font-bold">{score}</span>
        </div>
        <div className={`flex items-center gap-2 font-bold ${timeLeft <= 10 ? "text-[#e50914]" : "text-white"}`}>
          <FaClock /> {timeLeft}s
        </div>
        <span className="text-gray-400 text-sm">Best: {highScore}</span>
      </div>

      <div className="absolute inset-0 touch-none select-none">
        <div ref={mountRef} className="absolute inset-0" />

        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 text-center px-4">
            <h3 className="text-3xl font-bold text-[#e50914] mb-2">Orb Hunt 3D</h3>
            <p className="text-gray-300 mb-6">
              Roll the energy sphere with WASD/arrows (or drag) and grab as many orbs as you can in {GAME_TIME} seconds!
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
            <h3 className="text-3xl font-bold text-[#e50914] mb-1">Time's up!</h3>
            <p className="text-xl text-white mb-1">Orbs collected: {score}</p>
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

export default OrbHunt;
