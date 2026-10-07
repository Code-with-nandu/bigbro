import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { STUDENTS_DATA } from '../data/mockData';

interface ThreeHeroWebGLProps {
  onSelectStudent?: (id: number) => void;
}

export default function ThreeHeroWebGL({ onSelectStudent }: ThreeHeroWebGLProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredStudent, setHoveredStudent] = useState<{
    id: number;
    name: string;
    module: string;
    x: number;
    y: number;
  } | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // --- Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050508, 0.0018);

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 2000);
    camera.position.set(0, 20, 320);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xfff5e6, 0.9);
    scene.add(ambientLight);

    const amberLight = new THREE.PointLight(0xf59e0b, 3.5, 450);
    amberLight.position.set(0, 40, 60);
    scene.add(amberLight);

    const cyanLight = new THREE.PointLight(0x38bdf8, 2.5, 400);
    cyanLight.position.set(0, -60, -40);
    scene.add(cyanLight);

    // --- Central 3D Celestial Core: The ₹10k Shield Geode ---
    const coreGroup = new THREE.Group();
    coreGroup.position.set(0, -10, 0);
    scene.add(coreGroup);

    // 1. Inner glowing nucleus (Icosahedron)
    const nucleusGeo = new THREE.IcosahedronGeometry(28, 1);
    const nucleusMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      emissive: 0xb45309,
      emissiveIntensity: 0.6,
      roughness: 0.3,
      metalness: 0.8,
      wireframe: false,
      transparent: true,
      opacity: 0.85
    });
    const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
    coreGroup.add(nucleus);

    // 2. Wireframe protective crystalline outer cage
    const wireGeo = new THREE.IcosahedronGeometry(36, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xfde68a,
      wireframe: true,
      transparent: true,
      opacity: 0.32
    });
    const wireframe = new THREE.Mesh(wireGeo, wireMat);
    coreGroup.add(wireframe);

    // 3. Central pulsing point cloud inside core
    const corePartGeo = new THREE.BufferGeometry();
    const corePartCount = 180;
    const corePartPos = new Float32Array(corePartCount * 3);
    for (let i = 0; i < corePartCount; i++) {
      const radius = 10 + Math.random() * 22;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      corePartPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      corePartPos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      corePartPos[i * 3 + 2] = radius * Math.cos(phi);
    }
    corePartGeo.setAttribute('position', new THREE.BufferAttribute(corePartPos, 3));
    const corePartMat = new THREE.PointsMaterial({
      color: 0xfbbf24,
      size: 2.2,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const corePoints = new THREE.Points(corePartGeo, corePartMat);
    coreGroup.add(corePoints);

    // --- 3D Orbital Rings ---
    const ringGroup = new THREE.Group();
    coreGroup.add(ringGroup);

    const createRing = (radius: number, tiltX: number, tiltZ: number, color: number, opacity: number) => {
      const curve = new THREE.EllipseCurve(0, 0, radius, radius * 0.94, 0, Math.PI * 2, false, 0);
      const points = curve.getPoints(96);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending
      });
      const line = new THREE.Line(geometry, material);
      line.rotation.x = tiltX;
      line.rotation.z = tiltZ;
      ringGroup.add(line);
      return line;
    };

    const ring1 = createRing(80, Math.PI / 2.3, 0.25, 0xf59e0b, 0.35);
    const ring2 = createRing(115, Math.PI / 1.9, -0.4, 0x38bdf8, 0.28);
    const ring3 = createRing(150, Math.PI / 2.1, 0.6, 0xfde68a, 0.2);

    // --- 13 Student 3D Satellite Beacons ---
    interface StudentOrb {
      mesh: THREE.Mesh;
      glowSprite: THREE.Sprite;
      studentData: typeof STUDENTS_DATA[0];
      orbitRadius: number;
      orbitSpeed: number;
      orbitTilt: number;
      orbitPhase: number;
      baseY: number;
    }

    const studentOrbs: StudentOrb[] = [];
    const interactiveMeshes: THREE.Mesh[] = [];

    // Create custom soft glow texture for satellites
    const createGlowTexture = (colorHex: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, colorHex);
        gradient.addColorStop(0.3, colorHex);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const amberGlowTex = createGlowTexture('rgba(245, 158, 11, 0.9)');
    const cyanGlowTex = createGlowTexture('rgba(56, 189, 248, 0.9)');

    STUDENTS_DATA.forEach((student, index) => {
      const isAmber = index % 2 === 0;
      const baseRadius = 75 + (index % 4) * 22;
      const speed = 0.0035 + (index % 5) * 0.0008 * (index % 2 === 0 ? 1 : -1);
      const tilt = (index / STUDENTS_DATA.length) * Math.PI * 0.7 - 0.35;
      const phase = (index / STUDENTS_DATA.length) * Math.PI * 2;

      // 3D sphere for student
      const orbGeo = new THREE.SphereGeometry(2.8, 16, 16);
      const orbMat = new THREE.MeshStandardMaterial({
        color: isAmber ? 0xf59e0b : 0x38bdf8,
        emissive: isAmber ? 0xd97706 : 0x0284c7,
        emissiveIntensity: 0.9,
        roughness: 0.2,
        metalness: 0.5
      });
      const orbMesh = new THREE.Mesh(orbGeo, orbMat);
      orbMesh.userData = { studentId: student.id, studentData: student };

      // Halo sprite
      const spriteMat = new THREE.SpriteMaterial({
        map: isAmber ? amberGlowTex : cyanGlowTex,
        color: 0xffffff,
        transparent: true,
        blending: THREE.AdditiveBlending
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(16, 16, 1);
      orbMesh.add(sprite);

      coreGroup.add(orbMesh);
      interactiveMeshes.push(orbMesh);

      studentOrbs.push({
        mesh: orbMesh,
        glowSprite: sprite,
        studentData: student,
        orbitRadius: baseRadius,
        orbitSpeed: speed,
        orbitTilt: tilt,
        orbitPhase: phase,
        baseY: (index % 3 - 1) * 18
      });
    });

    // Connecting lines in 3D (The safety net between students)
    const netLinesGeo = new THREE.BufferGeometry();
    const maxLines = 13 * 4;
    const netPositions = new Float32Array(maxLines * 6);
    netLinesGeo.setAttribute('position', new THREE.BufferAttribute(netPositions, 3));
    const netLinesMat = new THREE.LineBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.24,
      blending: THREE.AdditiveBlending
    });
    const netLines = new THREE.LineSegments(netLinesGeo, netLinesMat);
    coreGroup.add(netLines);

    // --- Atmospheric 3D Star & Cosmic Dust Particles ---
    const starCount = 550;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const cAmber = new THREE.Color(0xf59e0b);
    const cWhite = new THREE.Color(0xffffff);
    const cCyan = new THREE.Color(0x38bdf8);

    for (let i = 0; i < starCount; i++) {
      const radius = 90 + Math.random() * 520;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      starPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = (radius * Math.sin(phi) * Math.sin(theta)) * 0.7;
      starPos[i * 3 + 2] = radius * Math.cos(phi);

      const mixType = Math.random();
      const col = mixType > 0.6 ? cAmber : mixType > 0.4 ? cCyan : cWhite;
      starColors[i * 3] = col.r;
      starColors[i * 3 + 1] = col.g;
      starColors[i * 3 + 2] = col.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // --- Mouse, Touch, & Parallax Controls ---
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const raycaster = new THREE.Raycaster();
    const mouseRayVec = new THREE.Vector2(-999, -999);
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    let rotationVelocity = { x: 0, y: 0.002 };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const rect = container.getBoundingClientRect();
      const normX = ((clientX - rect.left) / width) * 2 - 1;
      const normY = -(((clientY - rect.top) / height) * 2 - 1);

      mouse.targetX = normX * 0.45;
      mouse.targetY = normY * 0.35;

      mouseRayVec.x = normX;
      mouseRayVec.y = normY;

      if (isDragging) {
        const deltaX = clientX - dragStart.x;
        const deltaY = clientY - dragStart.y;
        coreGroup.rotation.y += deltaX * 0.005;
        coreGroup.rotation.x += deltaY * 0.005;
        dragStart.x = clientX;
        dragStart.y = clientY;
      }
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      setIsInteracting(true);
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      dragStart.x = clientX;
      dragStart.y = clientY;
    };

    const handlePointerUp = () => {
      isDragging = false;
      setTimeout(() => setIsInteracting(false), 2000);
    };

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    // Scroll parallax
    let scrollY = 0;
    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });
    container.addEventListener('mousemove', handlePointerMove, { passive: true });
    container.addEventListener('touchmove', handlePointerMove, { passive: true });
    container.addEventListener('mousedown', handlePointerDown);
    container.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchend', handlePointerUp);

    // --- Animation Loop ---
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();

      // Camera smooth interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      // Parallax camera adjustments based on scroll
      camera.position.x = mouse.x * 60;
      camera.position.y = 20 + mouse.y * 40 - scrollY * 0.08;
      camera.position.z = 320 + scrollY * 0.12;
      camera.lookAt(0, -10, 0);

      // Core rotation
      if (!isDragging) {
        coreGroup.rotation.y += rotationVelocity.y;
        coreGroup.rotation.x = Math.sin(elapsed * 0.3) * 0.08;
      }

      // Pulse nucleus
      const pulse = Math.sin(elapsed * 2.2) * 0.06;
      nucleus.scale.set(1 + pulse, 1 + pulse, 1 + pulse);
      wireframe.rotation.y -= 0.003;
      wireframe.rotation.z += 0.002;

      // Rotate orbital rings
      ring1.rotation.z += 0.0015;
      ring2.rotation.z -= 0.002;
      ring3.rotation.z += 0.001;

      // Background stars slow drift
      stars.rotation.y += 0.0004;

      // Update student satellite positions
      const currentPosList: THREE.Vector3[] = [];

      studentOrbs.forEach((orb, i) => {
        orb.orbitPhase += orb.orbitSpeed;
        const x = Math.cos(orb.orbitPhase) * orb.orbitRadius;
        const z = Math.sin(orb.orbitPhase) * orb.orbitRadius;
        const y = Math.sin(orb.orbitPhase + orb.orbitTilt) * 28 + orb.baseY;

        orb.mesh.position.set(x, y, z);
        currentPosList.push(orb.mesh.position.clone());

        // Gentle sprite breathing
        const sPulse = Math.sin(elapsed * 3 + i) * 2;
        orb.glowSprite.scale.set(16 + sPulse, 16 + sPulse, 1);
      });

      // Update safety-net lines between nearest student satellites
      let lineIndex = 0;
      const positions = netLinesGeo.attributes.position.array as Float32Array;

      for (let i = 0; i < currentPosList.length; i++) {
        for (let j = i + 1; j < currentPosList.length; j++) {
          const p1 = currentPosList[i];
          const p2 = currentPosList[j];
          const dist = p1.distanceTo(p2);

          if (dist < 85 && lineIndex < maxLines) {
            positions[lineIndex * 6] = p1.x;
            positions[lineIndex * 6 + 1] = p1.y;
            positions[lineIndex * 6 + 2] = p1.z;
            positions[lineIndex * 6 + 3] = p2.x;
            positions[lineIndex * 6 + 4] = p2.y;
            positions[lineIndex * 6 + 5] = p2.z;
            lineIndex++;
          }
        }
      }

      // Clear remaining line slots
      for (let k = lineIndex * 6; k < maxLines * 6; k++) {
        positions[k] = 0;
      }
      netLinesGeo.attributes.position.needsUpdate = true;

      // Raycasting for hovered student orb
      raycaster.setFromCamera(mouseRayVec, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const student = hit.userData.studentData;

        // Project 3D coordinate to screen coordinates for tooltip
        const screenPos = hit.position.clone();
        screenPos.applyMatrix4(coreGroup.matrixWorld);
        screenPos.project(camera);

        const screenX = (screenPos.x * 0.5 + 0.5) * width;
        const screenY = (-(screenPos.y * 0.5) + 0.5) * height;

        setHoveredStudent({
          id: student.id,
          name: student.name,
          module: student.module,
          x: screenX,
          y: screenY
        });

        // Hover scale
        hit.scale.lerp(new THREE.Vector3(1.6, 1.6, 1.6), 0.2);
        document.body.style.cursor = 'pointer';
      } else {
        setHoveredStudent(null);
        interactiveMeshes.forEach((mesh) => {
          mesh.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        });
        document.body.style.cursor = 'default';
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('touchmove', handlePointerMove);
      container.removeEventListener('mousedown', handlePointerDown);
      container.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchend', handlePointerUp);

      // Dispose Three.js objects
      renderer.dispose();
      nucleusGeo.dispose();
      nucleusMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      corePartGeo.dispose();
      corePartMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      netLinesGeo.dispose();
      netLinesMat.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-auto overflow-hidden select-none cursor-grab active:cursor-grabbing"
    >
      {/* 3D Student Beacon Interactive Hover Tooltip */}
      {hoveredStudent && (
        <div
          className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-4 px-3.5 py-2 rounded-xl bg-neutral-950/95 border border-amber-400/40 backdrop-blur-md shadow-2xl text-left transition-all duration-75"
          style={{ left: `${hoveredStudent.x}px`, top: `${hoveredStudent.y}px` }}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs font-bold text-white tracking-wide">{hoveredStudent.name}</span>
            <span className="text-[10px] text-amber-300 font-mono">#{hoveredStudent.id}</span>
          </div>
          <p className="text-[11px] text-neutral-300 mt-1 max-w-[210px] line-clamp-2">
            {hoveredStudent.module}
          </p>
          <div className="text-[10px] text-amber-400/90 font-medium mt-1">
            Click to view trainee profile →
          </div>
        </div>
      )}

      {/* Floating 3D Navigation Guide Pill */}
      <div className="absolute top-24 left-6 z-20 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 border border-white/10 backdrop-blur-md text-[11px] text-neutral-400 pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>3D Orbital Engine · Drag to rotate · Inspect Big Bro Trainees (May 13 / Mai Tera)</span>
      </div>

      {/* Subtle depth vignette overlay */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#050508]/30 to-[#050508] pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#050508] via-[#050508]/80 to-transparent pointer-events-none" />
    </div>
  );
}
