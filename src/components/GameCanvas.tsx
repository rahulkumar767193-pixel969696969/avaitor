import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PLANE_SVG } from '../constants';

interface GameCanvasProps {
  multiplier: number;
  isCrashed: boolean;
  isFlying: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
  type: 'fire' | 'spark' | 'smoke' | 'debris';
  rotation?: number;
  rotationSpeed?: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

interface Cloud {
  x: number;
  y: number;
  speed: number;
  scale: number;
  opacity: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ multiplier, isCrashed, isFlying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const particlesRef = useRef<Particle[]>([]);
  const cloudsRef = useRef<Cloud[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const [explosionActive, setExplosionActive] = useState(false);
  const [shake, setShake] = useState(false);

  // Initialize clouds
  useEffect(() => {
    const clouds: Cloud[] = [];
    for (let i = 0; i < 10; i++) {
      clouds.push({
        x: Math.random() * 1200,
        y: Math.random() * 400,
        speed: 0.1 + Math.random() * 0.3,
        scale: 0.8 + Math.random() * 1.2,
        opacity: 0.03 + Math.random() * 0.07,
      });
    }
    cloudsRef.current = clouds;
  }, []);

  useEffect(() => {
    if (isCrashed && !explosionActive) {
      setExplosionActive(true);
      setShake(true);
      createExplosion(lastPosRef.current.x, lastPosRef.current.y);
      setTimeout(() => setExplosionActive(false), 2000);
      setTimeout(() => setShake(false), 500);
    }
  }, [isCrashed]);

  const createExplosion = (x: number, y: number) => {
    const particles: Particle[] = [];
    
    // Fire particles
    for (let i = 0; i < 120; i++) {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15,
        life: 0.8 + Math.random() * 0.6,
        color: ['#ff4444', '#ffaa00', '#ff0000', '#ffff00'][Math.floor(Math.random() * 4)],
        size: 4 + Math.random() * 8,
        type: 'fire'
      });
    }

    // Spark particles
    for (let i = 0; i < 100; i++) {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 35,
        vy: (Math.random() - 0.5) * 35,
        life: 0.4 + Math.random() * 0.8,
        color: '#ffffff',
        size: 1 + Math.random() * 3,
        type: 'spark'
      });
    }

    // Debris particles
    for (let i = 0; i < 30; i++) {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10 - 5,
        life: 1.5 + Math.random() * 1.0,
        color: ['#333333', '#666666', '#ff0000'][Math.floor(Math.random() * 3)],
        size: 3 + Math.random() * 5,
        type: 'debris',
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2
      });
    }

    // Smoke particles
    for (let i = 0; i < 60; i++) {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6 - 3,
        life: 1.5 + Math.random() * 1.5,
        color: 'rgba(100, 100, 100, 0.4)',
        size: 15 + Math.random() * 25,
        type: 'smoke'
      });
    }

    particlesRef.current = particles;

    // Add shockwave
    shockwavesRef.current = [{
      x,
      y,
      radius: 0,
      maxRadius: 300,
      opacity: 0.8
    }];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const planeImg = new Image();
    planeImg.src = `data:image/svg+xml;base64,${btoa(PLANE_SVG)}`;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = canvas.parentElement?.clientHeight || 400;
    };

    window.addEventListener('resize', resize);
    resize();

    let animationFrame: number;
    const draw = () => {
      const now = Date.now();
      const elapsed = (now - startTimeRef.current) / 1000;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw Background Clouds
      ctx.save();
      cloudsRef.current.forEach(cloud => {
        cloud.x -= cloud.speed * (1 + Math.log10(multiplier + 1) * 0.5);
        if (cloud.x < -200) cloud.x = canvas.width + 200;
        
        ctx.globalAlpha = cloud.opacity;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        // Simple fluffy cloud shape
        ctx.arc(cloud.x, cloud.y, 30 * cloud.scale, 0, Math.PI * 2);
        ctx.arc(cloud.x + 20 * cloud.scale, cloud.y - 10 * cloud.scale, 25 * cloud.scale, 0, Math.PI * 2);
        ctx.arc(cloud.x + 40 * cloud.scale, cloud.y, 30 * cloud.scale, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
      
      const startX = 60;
      const startY = canvas.height - 60;

      // Draw Radial Sunburst Background
      ctx.save();
      ctx.translate(startX, startY);
      const rayCount = 24;
      const rayAngle = Math.PI / 2 / rayCount;
      for (let i = 0; i <= rayCount; i++) {
        const angle = -i * rayAngle;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * canvas.width * 2, Math.sin(angle) * canvas.width * 2);
        ctx.strokeStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.005)';
        ctx.lineWidth = 60;
        ctx.stroke();
      }
      ctx.restore();

      // Draw Dotted Axes
      ctx.save();
      ctx.setLineDash([2, 10]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      
      // Y Axis
      ctx.beginPath();
      ctx.moveTo(startX, 40);
      ctx.lineTo(startX, startY);
      ctx.stroke();
      
      // X Axis
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(canvas.width - 40, startY);
      ctx.stroke();

      // Axis Dots (Blue markers)
      ctx.setLineDash([]);
      ctx.fillStyle = '#2c5ff7';
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.arc(startX, startY - (i * (startY - 40) / 8), 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(startX + (i * (canvas.width - startX - 40) / 8), startY, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      if (isFlying || isCrashed) {
        const progress = Math.min(1, (multiplier - 1) / 15); 
        const endX = startX + (canvas.width - 200) * progress;
        const endY = startY - (canvas.height - 200) * Math.pow(progress, 1.5);

        lastPosRef.current = { x: endX, y: endY };

        // Draw Solid Fill Under Curve (Vibrant Red)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(startX + (endX - startX) * 0.3, startY, endX, endY);
        ctx.lineTo(endX, startY);
        ctx.closePath();
        ctx.fillStyle = 'rgba(225, 29, 72, 0.7)';
        ctx.fill();
        ctx.restore();

        // Draw Curve (Bright Red Line)
        ctx.beginPath();
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(startX + (endX - startX) * 0.3, startY, endX, endY);
        ctx.stroke();

        if (!isCrashed) {
          // Draw Plane (Red Silhouette)
          ctx.save();
          const bob = Math.sin(elapsed * 12) * 2;
          ctx.translate(endX, endY + bob);
          ctx.rotate(-Math.PI / 10);
          
          // Simple red plane silhouette
          ctx.fillStyle = '#ff0000';
          ctx.beginPath();
          ctx.moveTo(-30, 0);
          ctx.lineTo(30, 0);
          ctx.lineTo(20, -10);
          ctx.lineTo(-10, -10);
          ctx.closePath();
          ctx.fill();
          
          // Tail
          ctx.beginPath();
          ctx.moveTo(-30, 0);
          ctx.lineTo(-40, -15);
          ctx.lineTo(-25, -15);
          ctx.closePath();
          ctx.fill();
          
          // Wing
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-15, 15);
          ctx.lineTo(10, 15);
          ctx.closePath();
          ctx.fill();
          
          ctx.restore();
        }
      }

      // Draw Shockwaves
      shockwavesRef.current = shockwavesRef.current.filter(s => {
        s.radius += 10;
        s.opacity -= 0.02;
        if (s.opacity > 0 && s.radius < s.maxRadius) {
          ctx.save();
          ctx.strokeStyle = `rgba(255, 255, 255, ${s.opacity})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
          return true;
        }
        return false;
      });

      // Draw Particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.type === 'smoke') {
          p.vy -= 0.05; // Smoke rises
          p.vx *= 0.98;
        } else if (p.type === 'debris') {
          p.vy += 0.3; // Heavier gravity for debris
          p.vx *= 0.99;
          if (p.rotation !== undefined && p.rotationSpeed !== undefined) {
            p.rotation += p.rotationSpeed;
          }
        } else {
          p.vy += 0.2; // Gravity for fire and sparks
        }
        
        p.life -= 0.015;
        
        if (p.life > 0) {
          ctx.save();
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          
          if (p.type === 'spark') {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.type === 'debris') {
            ctx.translate(p.x, p.y);
            if (p.rotation !== undefined) ctx.rotate(p.rotation);
            ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
          } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
          }
          
          ctx.restore();
          return true;
        }
        return false;
      });

      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrame);
    };
  }, [multiplier, isCrashed, isFlying]);

  return (
    <motion.div 
      animate={shake ? {
        x: [0, -10, 10, -10, 10, 0],
        y: [0, 5, -5, 5, -5, 0]
      } : {}}
      transition={{ duration: 0.4 }}
      className="relative w-full h-full bg-[#000000] rounded-xl overflow-hidden border border-white/5 shadow-inner"
    >
      <canvas ref={canvasRef} className="absolute inset-0 z-10" />

      {/* Multiplier Display */}
      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
        <AnimatePresence mode="wait">
          {isFlying && (
            <motion.div
              key="multiplier"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="text-[120px] md:text-[160px] font-black text-white tracking-tighter"
            >
              {multiplier.toFixed(2)}x
            </motion.div>
          )}
          {isCrashed && (
            <motion.div
              key="crashed"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center"
            >
              <div className="text-5xl md:text-7xl font-black text-red-600 uppercase tracking-tighter mb-2">
                FLEW AWAY!
              </div>
              <div className="text-7xl md:text-9xl font-black text-white">
                {multiplier.toFixed(2)}x
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced Flash on Crash */}
      <AnimatePresence>
        {isCrashed && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0, 0.8, 0] }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-white z-[60] pointer-events-none"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.7, 0] }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="absolute inset-0 bg-red-600 z-50 pointer-events-none"
            />
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
