import { useEffect, useRef, useState } from 'react';
import { STUDENTS_DATA } from '../data/mockData';

interface Node3D {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  radius: number;
  color: string;
  name: string;
  module: string;
  isStudent: boolean;
  studentId?: number;
  pulsePhase: number;
}

export default function ThreeDepthHeroCanvas({ onSelectStudent }: { onSelectStudent?: (id: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredNode, setHoveredNode] = useState<{ name: string; module: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Camera and mouse state
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let time = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / width - 0.5;
      const ny = (e.clientY - rect.top) / height - 0.5;
      mouse.targetX = nx * 0.45;
      mouse.targetY = ny * 0.35;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const nx = (touch.clientX - rect.left) / width - 0.5;
        const ny = (touch.clientY - rect.top) / height - 0.5;
        mouse.targetX = nx * 0.3;
        mouse.targetY = ny * 0.25;
      }
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('resize', handleResize);

    // Initialize primary student nodes + ambient constellation particles
    const nodes: Node3D[] = [];

    // Student nodes arranged in a gentle protective orbital arc in 3D
    STUDENTS_DATA.forEach((student, index) => {
      const angle = (index / STUDENTS_DATA.length) * Math.PI * 2;
      const radiusX = 280 + (index % 3) * 45;
      const radiusY = 95 + (index % 2) * 35;
      const zOffset = Math.sin(angle * 2) * 120;

      nodes.push({
        x: Math.cos(angle) * radiusX,
        y: Math.sin(angle) * radiusY + 40,
        z: zOffset,
        baseX: Math.cos(angle) * radiusX,
        baseY: Math.sin(angle) * radiusY + 40,
        baseZ: zOffset,
        radius: 4.8,
        color: index % 2 === 0 ? '#f59e0b' : '#38bdf8', // Warm amber & soft cyan beacon
        name: student.name,
        module: student.module,
        isStudent: true,
        studentId: student.id,
        pulsePhase: index * 0.48
      });
    });

    // Ambient floating particles for deep cosmic sense of scale
    const ambientCount = 85;
    for (let i = 0; i < ambientCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const dist = 180 + Math.random() * 520;
      const x = dist * Math.sin(phi) * Math.cos(theta);
      const y = (dist * Math.sin(phi) * Math.sin(theta)) * 0.65 + 30;
      const z = dist * Math.cos(phi) - 50;

      nodes.push({
        x,
        y,
        z,
        baseX: x,
        baseY: y,
        baseZ: z,
        radius: 1.0 + Math.random() * 1.8,
        color: Math.random() > 0.4 ? 'rgba(255,255,255,0.7)' : 'rgba(245,158,11,0.5)',
        name: '',
        module: '',
        isStudent: false,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }

    const FOV = 480;

    const render = () => {
      time += 0.012;
      // Smooth camera interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height * 0.52;

      // Draw background atmospheric depth gradients
      // 1. Deep horizon arc glow
      const horizonY = height * 0.88;
      const horizonGrad = ctx.createRadialGradient(
        centerX,
        horizonY + 80,
        10,
        centerX,
        horizonY,
        width * 0.75
      );
      horizonGrad.addColorStop(0, 'rgba(245, 158, 11, 0.18)');
      horizonGrad.addColorStop(0.35, 'rgba(217, 119, 6, 0.08)');
      horizonGrad.addColorStop(0.7, 'rgba(14, 165, 233, 0.03)');
      horizonGrad.addColorStop(1, 'rgba(5, 5, 8, 0)');

      ctx.fillStyle = horizonGrad;
      ctx.beginPath();
      ctx.arc(centerX, horizonY + 80, width * 0.75, 0, Math.PI * 2);
      ctx.fill();

      // 2. Subtle central orbital ring in 3D
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(mouse.x * 0.4);
      ctx.beginPath();
      ctx.ellipse(0, 40, 360, 110, -0.15 + mouse.y * 0.3, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 12]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Rotate and project nodes
      const cosY = Math.cos(mouse.x + time * 0.06);
      const sinY = Math.sin(mouse.x + time * 0.06);
      const cosX = Math.cos(mouse.y * 0.8);
      const sinX = Math.sin(mouse.y * 0.8);

      interface ProjectedNode {
        px: number;
        py: number;
        pz: number;
        scale: number;
        node: Node3D;
      }

      const projected: ProjectedNode[] = [];

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        // Slight self-oscillation for student nodes
        const floatY = n.isStudent ? Math.sin(time * 1.5 + n.pulsePhase) * 6 : 0;
        const curY = n.baseY + floatY;

        // 3D rotation around Y then X
        const x1 = n.baseX * cosY - n.baseZ * sinY;
        const z1 = n.baseZ * cosY + n.baseX * sinY;

        const y2 = curY * cosX - z1 * sinX;
        const z2 = z1 * cosX + curY * sinX;

        // Distance perspective divide
        const cameraZ = z2 + 550;
        if (cameraZ > 30) {
          const scale = FOV / cameraZ;
          const px = centerX + x1 * scale;
          const py = centerY + y2 * scale;
          projected.push({ px, py, pz: cameraZ, scale, node: n });
        }
      }

      // Sort by depth (far to near)
      projected.sort((a, b) => b.pz - a.pz);

      // Draw connection lines between nearby student nodes (The Safety Net)
      const studentProjected = projected.filter((p) => p.node.isStudent);
      ctx.lineWidth = 0.9;

      for (let i = 0; i < studentProjected.length; i++) {
        for (let j = i + 1; j < studentProjected.length; j++) {
          const p1 = studentProjected[i];
          const p2 = studentProjected[j];
          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 180) {
            const alpha = (1 - dist / 180) * 0.22;
            ctx.strokeStyle = `rgba(245, 158, 11, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();
          }
        }
      }

      // Draw projected particles
      let currentHover: { name: string; module: string; x: number; y: number } | null = null;

      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        const n = p.node;
        const r = Math.max(0.8, n.radius * p.scale);

        if (n.isStudent) {
          // Glow halo for student nodes
          const pulse = (Math.sin(time * 3 + n.pulsePhase) + 1) * 0.5;
          const haloGrad = ctx.createRadialGradient(p.px, p.py, 0, p.px, p.py, r * 3.5);
          haloGrad.addColorStop(0, n.color === '#f59e0b' ? 'rgba(245, 158, 11, 0.45)' : 'rgba(56, 189, 248, 0.45)');
          haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = haloGrad;
          ctx.beginPath();
          ctx.arc(p.px, p.py, r * (3 + pulse * 1.5), 0, Math.PI * 2);
          ctx.fill();

          // Core node
          ctx.fillStyle = n.color;
          ctx.beginPath();
          ctx.arc(p.px, p.py, r, 0, Math.PI * 2);
          ctx.fill();

          // Check hover proximity to mouse
          const mouseCanvasX = (mouse.targetX / 0.45 + 0.5) * width;
          const mouseCanvasY = (mouse.targetY / 0.35 + 0.5) * height;
          const hDist = Math.hypot(p.px - mouseCanvasX, p.py - mouseCanvasY);

          if (hDist < 26 && !currentHover) {
            currentHover = {
              name: n.name,
              module: n.module,
              x: p.px,
              y: p.py
            };

            // Outer highlight ring
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(p.px, p.py, r + 4, 0, Math.PI * 2);
            ctx.stroke();
          }
        } else {
          // Ambient stars
          ctx.fillStyle = n.color;
          ctx.beginPath();
          ctx.arc(p.px, p.py, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      setHoveredNode(currentHover);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-auto overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Floating 3D Node Hover Card */}
      {hoveredNode && (
        <div
          className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 px-3 py-1.5 rounded-lg bg-neutral-900/90 border border-white/15 backdrop-blur-md shadow-xl transition-all duration-150"
          style={{ left: `${hoveredNode.x}px`, top: `${hoveredNode.y - 10}px` }}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-semibold text-white tracking-wide">{hoveredNode.name}</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-0.5 max-w-[190px] truncate">{hoveredNode.module}</p>
        </div>
      )}

      {/* Subtle depth vignette overlay */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#050508]/40 to-[#050508] pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#050508] via-[#050508]/80 to-transparent pointer-events-none" />
    </div>
  );
}
