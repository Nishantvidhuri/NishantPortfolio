import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { FaPlay, FaRedo, FaTrophy } from "react-icons/fa";
import { sfx, haptic, shake } from './gameFeel';

const BASE_SIZE = 3;
const BLOCK_H = 0.55;

function StackTower() {
  const mountRef = useRef(null);
  const apiRef = useRef({});
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(
    () => Number(localStorage.getItem("stackTowerHigh")) || 0
  );

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d0d1e);
    scene.fog = new THREE.Fog(0x0d0d1e, 26, 60);

    const aspect = mount.clientWidth / mount.clientHeight;
    const d = 5;
    const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 100);
    camera.position.set(8, 9, 8);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const dir = new THREE.DirectionalLight(0xffffff, 1.1);
    dir.position.set(6, 12, 4);
    scene.add(dir);
    // Mood lights from two sides
    const cool = new THREE.PointLight(0x22d3ee, 30, 40, 1.9);
    cool.position.set(-9, 6, 6);
    scene.add(cool);
    const warm = new THREE.PointLight(0xd946ef, 26, 40, 1.9);
    warm.position.set(9, 5, -6);
    scene.add(warm);

    // Star dome
    const starCount = 240;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() * 2 - 1) * 45;
      starPos[i * 3 + 1] = Math.random() * 30 - 4;
      starPos[i * 3 + 2] = (Math.random() * 2 - 1) * 45;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.09,
      transparent: true,
      opacity: 0.7,
    });
    scene.add(new THREE.Points(starGeo, starMat));

    const group = new THREE.Group(); // tower moves down as it grows
    scene.add(group);

    // Glowing pad under the tower
    const padGlow = new THREE.Mesh(
      new THREE.CircleGeometry(3.4, 40),
      new THREE.MeshBasicMaterial({
        color: 0xe50914,
        transparent: true,
        opacity: 0.18,
      })
    );
    padGlow.rotation.x = -Math.PI / 2;
    padGlow.position.y = -BLOCK_H / 2 - 0.01;
    group.add(padGlow);
    const padRing = new THREE.Mesh(
      new THREE.RingGeometry(3.4, 3.6, 40),
      new THREE.MeshBasicMaterial({
        color: 0xe50914,
        transparent: true,
        opacity: 0.5,
      })
    );
    padRing.rotation.x = -Math.PI / 2;
    padRing.position.y = -BLOCK_H / 2;
    group.add(padRing);

    const st = {
      running: false,
      level: 0,
      topBlock: null,
      moving: null,
      falling: [],
      flashes: [],
      raf: 0,
      last: performance.now(),
      t: 0,
    };
    apiRef.current.st = st;

    const makeBlock = (sizeX, sizeZ, x, z, level) => {
      const geo = new THREE.BoxGeometry(sizeX, BLOCK_H, sizeZ);
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL((level * 0.045 + 0.55) % 1, 0.72, 0.56),
        roughness: 0.35,
        metalness: 0.25,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, level * BLOCK_H, z);
      group.add(mesh);
      return { mesh, sizeX, sizeZ, x, z };
    };

    const resetWorld = () => {
      while (group.children.length) {
        const c = group.children[0];
        group.remove(c);
        c.geometry.dispose();
        c.material.dispose();
      }
      group.add(padGlow);
      group.add(padRing);
      st.falling.length = 0;
      st.flashes.length = 0;
      st.level = 0;
      group.position.y = 0;
      st.topBlock = makeBlock(BASE_SIZE, BASE_SIZE, 0, 0, 0);
      spawnMoving();
    };

    const spawnMoving = () => {
      st.level += 1;
      const axis = st.level % 2 === 1 ? "x" : "z";
      const prev = st.topBlock;
      const b = makeBlock(prev.sizeX, prev.sizeZ, prev.x, prev.z, st.level);
      const start = -6;
      if (axis === "x") b.mesh.position.x = start;
      else b.mesh.position.z = start;
      st.moving = { ...b, axis, dir: 1 };
    };

    const drop = () => {
      if (!st.running || !st.moving) return;
      const m = st.moving;
      const prev = st.topBlock;
      const axis = m.axis;
      const pos = m.mesh.position[axis];
      const prevPos = axis === "x" ? prev.x : prev.z;
      const size = axis === "x" ? m.sizeX : m.sizeZ;
      const delta = pos - prevPos;
      const overlap = size - Math.abs(delta);

      if (overlap <= 0.02) {
        st.falling.push({ mesh: m.mesh, vy: 0 });
        sfx.fail(); haptic([40, 30, 60]); shake(mount, 11);
        st.moving = null;
        st.running = false;
        setGameOver(true);
        setGameStarted(false);
        setHighScore((h) => {
          const next = Math.max(h, st.level - 1);
          localStorage.setItem("stackTowerHigh", String(next));
          return next;
        });
        return;
      }

      const perfect = Math.abs(delta) < 0.12;
      const newSize = perfect ? size : overlap;
      const newPos = perfect ? prevPos : prevPos + delta / 2;

      const sizeX = axis === "x" ? newSize : m.sizeX;
      const sizeZ = axis === "z" ? newSize : m.sizeZ;
      group.remove(m.mesh);
      m.mesh.geometry.dispose();
      const placed = makeBlock(
        sizeX,
        sizeZ,
        axis === "x" ? newPos : m.x,
        axis === "z" ? newPos : m.z,
        st.level
      );
      placed.mesh.material = m.mesh.material; // keep color

      if (perfect) {
        sfx.cheer(); haptic([12, 20, 12]);
        // white flash that decays in the loop
        placed.mesh.material.emissive = new THREE.Color(0xffffff);
        placed.mesh.material.emissiveIntensity = 0.9;
        st.flashes.push(placed.mesh.material);
      } else {
        const cutSize = size - overlap;
        const cutPos = newPos + (Math.sign(delta) * (newSize + cutSize)) / 2;
        const chunk = makeBlock(
          axis === "x" ? cutSize : m.sizeX,
          axis === "z" ? cutSize : m.sizeZ,
          axis === "x" ? cutPos : m.x,
          axis === "z" ? cutPos : m.z,
          st.level
        );
        chunk.mesh.material = placed.mesh.material.clone();
        st.falling.push({ mesh: chunk.mesh, vy: 0 });
      }

      if (!perfect) { sfx.thud(); haptic(10); }
      st.topBlock = placed;
      setScore(st.level);
      spawnMoving();
    };
    apiRef.current.drop = drop;

    const loop = (now) => {
      st.raf = requestAnimationFrame(loop);
      const dt = Math.min((now - st.last) / 1000, 0.05);
      st.last = now;
      st.t += dt;

      // pad pulse
      padGlow.material.opacity = 0.14 + Math.sin(st.t * 2.4) * 0.05;
      padRing.material.opacity = 0.4 + Math.sin(st.t * 2.4) * 0.15;

      if (st.moving && st.running) {
        const m = st.moving;
        const speed = 4.4 + st.level * 0.12;
        m.mesh.position[m.axis] += m.dir * speed * dt;
        if (m.mesh.position[m.axis] > 6) m.dir = -1;
        if (m.mesh.position[m.axis] < -6) m.dir = 1;
      }

      // perfect-drop flashes decay
      for (let i = st.flashes.length - 1; i >= 0; i--) {
        const mat = st.flashes[i];
        mat.emissiveIntensity *= 1 - Math.min(1, dt * 4);
        if (mat.emissiveIntensity < 0.03) {
          mat.emissiveIntensity = 0;
          st.flashes.splice(i, 1);
        }
      }

      // Falling chunks
      for (let i = st.falling.length - 1; i >= 0; i--) {
        const f = st.falling[i];
        f.vy += 22 * dt;
        f.mesh.position.y -= f.vy * dt;
        f.mesh.rotation.x += dt * 2;
        if (f.mesh.position.y < -20) {
          group.remove(f.mesh);
          f.mesh.geometry.dispose();
          st.falling.splice(i, 1);
        }
      }

      const targetY = -Math.max(0, st.level - 2) * BLOCK_H;
      group.position.y += (targetY - group.position.y) * Math.min(1, dt * 5);

      renderer.render(scene, camera);
    };
    st.raf = requestAnimationFrame(loop);

    const onKey = (e) => {
      if (e.code === "Space" || e.key === "Enter") {
        e.preventDefault();
        drop();
      }
    };
    const onPointer = () => drop();
    window.addEventListener("keydown", onKey);
    mount.addEventListener("pointerdown", onPointer);

    const onResize = () => {
      const a = mount.clientWidth / mount.clientHeight;
      camera.left = -d * a;
      camera.right = d * a;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    apiRef.current.resetWorld = resetWorld;
    resetWorld();

    return () => {
      cancelAnimationFrame(st.raf);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      mount.removeEventListener("pointerdown", onPointer);
      while (group.children.length) {
        const c = group.children[0];
        group.remove(c);
        c.geometry.dispose();
        c.material.dispose();
      }
      starGeo.dispose();
      starMat.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  const startGame = () => {
    apiRef.current.resetWorld?.();
    apiRef.current.st.running = true;
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
            <h3 className="text-3xl font-bold text-[#e50914] mb-2">Stack Tower 3D</h3>
            <p className="text-gray-300 mb-6">
              Tap, click, or press Space to drop the block. Perfect drops flash white!
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
            <h3 className="text-3xl font-bold text-[#e50914] mb-1">Tower Collapsed!</h3>
            <p className="text-xl text-white mb-1">Height: {score}</p>
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

export default StackTower;
