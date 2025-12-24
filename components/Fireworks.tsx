import React, { useEffect, useRef } from 'react';
import { Theme } from '../types';

interface FireworksProps {
  trigger: number;
  theme: Theme;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
  decay: number;
}

interface Rocket {
  x: number;
  y: number;
  startX: number;
  startY: number;
  targetY: number;
  startTime: number;
  flightDuration: number;
  color: string;
}

export const Fireworks: React.FC<FireworksProps> = ({ trigger, theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rocketsRef = useRef<Rocket[]>([]);
  const requestRef = useRef<number>(0);

  const getColors = () => {
    if (theme === 'christmas') {
      return ['#ef4444', '#22c55e', '#eab308', '#ffffff', '#f87171', '#4ade80']; // Red, Green, Gold, White
    }
    return ['#3b82f6', '#a855f7', '#ec4899', '#facc15', '#60a5fa', '#c084fc']; // Blue, Purple, Pink, Yellow
  };

  useEffect(() => {
    if (trigger === 0) return;

    const colors = getColors();
    const count = 3 + Math.floor(Math.random() * 3); // 3 to 5 rockets
    const now = Date.now();
    
    // Create rockets
    for (let i = 0; i < count; i++) {
      const startX = (window.innerWidth * 0.2) + (Math.random() * window.innerWidth * 0.6); // Random position in middle 60%
      const targetY = (window.innerHeight * 0.1) + (Math.random() * window.innerHeight * 0.3); // Top 10-40%
      const flightDuration = 1000; // 1 second flight to match the timer in App.tsx

      rocketsRef.current.push({
        x: startX,
        y: window.innerHeight + 10,
        startX,
        startY: window.innerHeight + 10,
        targetY,
        startTime: now,
        flightDuration,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }, [trigger, theme]);

  const explode = (x: number, y: number, color: string) => {
    const particleCount = 80;
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 2;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: color,
        alpha: 1,
        size: Math.random() * 3 + 1,
        decay: Math.random() * 0.015 + 0.005
      });
    }
    
    // Add some white sparkle particles
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 1;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: '#ffffff',
        alpha: 1,
        size: Math.random() * 2,
        decay: Math.random() * 0.03 + 0.01
      });
    }
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear with slight trail effect (optional, but clean clear is better for background)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Composite mode for glowing effect
    ctx.globalCompositeOperation = 'lighter';

    const now = Date.now();

    // Update Rockets
    for (let i = rocketsRef.current.length - 1; i >= 0; i--) {
      const r = rocketsRef.current[i];
      const elapsed = now - r.startTime;
      const progress = Math.min(elapsed / r.flightDuration, 1);
      
      // Ease out quad for upward movement
      const ease = 1 - (1 - progress) * (1 - progress);
      
      r.y = r.startY - (r.startY - r.targetY) * ease;
      
      // Wiggle X slightly
      r.x = r.startX + Math.sin(progress * 10) * 5;

      // Draw Rocket
      ctx.beginPath();
      ctx.arc(r.x, r.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = r.color;
      ctx.fill();
      
      // Draw tail
      ctx.beginPath();
      ctx.moveTo(r.x, r.y);
      ctx.lineTo(r.x, r.y + 15);
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      if (progress >= 1) {
        explode(r.x, r.y, r.color);
        rocketsRef.current.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08; // Gravity
      p.vx *= 0.96; // Air resistance
      p.vy *= 0.96;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        particlesRef.current.splice(i, 1);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      }
    }
    
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-0" // z-0 puts it in background stack
      style={{ mixBlendMode: 'screen' }}
    />
  );
};