import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, Sparkles } from 'lucide-react';

export default function Shield3DViewer() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activePillarHover, setActivePillarHover] = useState<string>('Hover or drag to rotate the 3D Shield');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth;
    let height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 14);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambient = new THREE.AmbientLight(0xfff3e0, 1.2);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xfef08a, 3.5);
    keyLight.position.set(5, 8, 7);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x38bdf8, 2.5, 30);
    rimLight.position.set(-6, -4, 4);
    scene.add(rimLight);

    // 3D Shield Group
    const shieldGroup = new THREE.Group();
    scene.add(shieldGroup);

    // Main 5-sided Prism Shield (Pentagonal cylinder geometry)
    const cylinderGeo = new THREE.CylinderGeometry(4.2, 3.2, 1.4, 5);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.85,
      roughness: 0.22,
      emissive: 0x78350f,
      emissiveIntensity: 0.25
    });
    const shieldMesh = new THREE.Mesh(cylinderGeo, goldMat);
    shieldMesh.rotation.x = Math.PI / 2;
    shieldMesh.rotation.z = Math.PI / 5;
    shieldGroup.add(shieldMesh);

    // Outer wireframe edge accent
    const edgesGeo = new THREE.EdgesGeometry(cylinderGeo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0xfef08a, linewidth: 2 });
    const wireframeLines = new THREE.LineSegments(edgesGeo, lineMat);
    wireframeLines.rotation.x = Math.PI / 2;
    wireframeLines.rotation.z = Math.PI / 5;
    shieldGroup.add(wireframeLines);

    // Inner 3D Core Emblem (Octahedron jewel)
    const jewelGeo = new THREE.OctahedronGeometry(1.6);
    const jewelMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.6,
      metalness: 0.9,
      roughness: 0.1
    });
    const jewel = new THREE.Mesh(jewelGeo, jewelMat);
    shieldGroup.add(jewel);

    // 5 Orbiting Pillar Nodes in 3D
    const pillarColors = [0xf59e0b, 0x10b981, 0x38bdf8, 0xa855f7, 0xf43f5e];
    const pillarNodes: THREE.Mesh[] = [];

    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const x = Math.cos(angle) * 5.2;
      const y = Math.sin(angle) * 5.2;
      const nodeGeo = new THREE.SphereGeometry(0.42, 16, 16);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: pillarColors[i],
        emissive: pillarColors[i],
        emissiveIntensity: 0.8
      });
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.set(x, y, 0);
      shieldGroup.add(node);
      pillarNodes.push(node);
    }

    // Interactive Drag Controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
      previousMousePosition = { x, y };
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const y = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = x - previousMousePosition.x;
      const deltaY = y - previousMousePosition.y;

      shieldGroup.rotation.y += deltaX * 0.015;
      shieldGroup.rotation.x += deltaY * 0.015;

      previousMousePosition = { x, y };
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const onResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', onResize);
    container.addEventListener('mousedown', onPointerDown);
    container.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    container.addEventListener('touchstart', onPointerDown, { passive: true });
    container.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();

      if (!isDragging) {
        shieldGroup.rotation.y += 0.008;
        shieldGroup.rotation.x = Math.sin(elapsed * 0.8) * 0.15;
      }

      jewel.rotation.x += 0.02;
      jewel.rotation.y += 0.03;

      const pulse = Math.sin(elapsed * 3) * 0.1;
      jewel.scale.set(1 + pulse, 1 + pulse, 1 + pulse);

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
      container.removeEventListener('mousedown', onPointerDown);
      container.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      container.removeEventListener('touchstart', onPointerDown);
      container.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);

      renderer.dispose();
      cylinderGeo.dispose();
      goldMat.dispose();
      jewelGeo.dispose();
      jewelMat.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[280px] sm:h-[320px] rounded-3xl glass-panel border border-white/15 overflow-hidden flex flex-col items-center justify-between p-4 cursor-grab active:cursor-grabbing select-none group">
      {/* 3D Canvas element */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Header Badge */}
      <div className="relative z-10 w-full flex items-center justify-between pointer-events-none">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-white/15 text-[11px] font-semibold text-amber-300 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Interactive 3D Big Bro Shield (Mai Tera)</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-mono">
          <RotateCw className="w-3 h-3 text-neutral-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>360° Drag</span>
        </div>
      </div>

      {/* Footer 5 Pillars Guide */}
      <div className="relative z-10 w-full pt-2 border-t border-white/10 flex items-center justify-around text-[10px] sm:text-[11px] text-neutral-300 font-medium pointer-events-none backdrop-blur-sm bg-black/40 px-2 py-1 rounded-xl">
        <span className="text-amber-400">1. Money</span>
        <span className="text-emerald-400">2. Mentoring</span>
        <span className="text-sky-400">3. Language</span>
        <span className="text-purple-400">4. Career</span>
        <span className="text-rose-400">5. Health</span>
      </div>
    </div>
  );
}
