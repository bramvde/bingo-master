import React, { useMemo, useEffect, useState } from 'react';

export const ChristmasScene: React.FC<{ active: boolean }> = ({ active }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate random stars
  const stars = useMemo(() => Array.from({ length: 50 }).map(() => ({
    cx: Math.random() * 100,
    cy: Math.random() * 60, // Top 60% only
    r: Math.random() * 0.2 + 0.05,
    opacity: Math.random() * 0.7 + 0.3,
    delay: Math.random() * 5
  })), []);

  // Generate random trees
  const trees = useMemo(() => Array.from({ length: 35 }).map(() => {
    // Bias x towards edges slightly to frame the center content? No, random is fine.
    const x = Math.random() * 100;
    // y position 0-10 relative to the bottom hill area
    const yOffset = Math.random() * 5; 
    const size = 3 + Math.random() * 4; // Height in %
    return {
      x,
      y: 90 + yOffset, 
      size,
      color: Math.random() > 0.5 ? '#166534' : '#14532d' // green-800 vs green-900
    };
  }).sort((a, b) => a.y - b.y), []);

  if (!active) return null;

  return (
    <div className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* SVG Container */}
      <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        
        {/* Moon */}
        <circle cx="85" cy="15" r="4" fill="#fefce8" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.9;0.8" dur="4s" repeatCount="indefinite" />
        </circle>
        
        {/* Stars */}
        {stars.map((star, i) => (
          <circle 
            key={i} 
            cx={`${star.cx}%`} 
            cy={`${star.cy}%`} 
            r={star.r} 
            fill="white" 
            opacity={star.opacity}
          >
             <animate attributeName="opacity" values={`${star.opacity};${star.opacity * 0.2};${star.opacity}`} dur={`${2 + star.delay}s`} repeatCount="indefinite" />
          </circle>
        ))}

        {/* Distant Mountains */}
        <path d="M0 100 L 15 65 L 35 90 L 55 60 L 80 95 L 100 70 V 100 H 0 Z" fill="#1e293b" opacity="0.4" />
        <path d="M20 100 L 40 70 L 60 95 L 90 65 L 100 80 V 100 H 20 Z" fill="#0f172a" opacity="0.3" />

        {/* Rolling Hills (Snow) */}
        <path d="M0 85 Q 30 80 60 88 T 100 82 V 100 H 0 Z" fill="#e2e8f0" />
        <path d="M0 92 Q 40 88 80 95 T 100 90 V 100 H 0 Z" fill="#f8fafc" />

      </svg>

      {/* Render Trees separately to handle Aspect Ratio better if needed, 
          but putting them in the same SVG with percentage coords is robust enough for background */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
         {trees.map((tree, i) => (
           <g key={i}>
             {/* Simple triangle tree */}
             <path 
               d={`M ${tree.x} ${tree.y - tree.size} L ${tree.x - (tree.size * 0.25)} ${tree.y} L ${tree.x + (tree.size * 0.25)} ${tree.y} Z`} 
               fill={tree.color} 
             />
             {/* Snow cap */}
             <path 
               d={`M ${tree.x} ${tree.y - tree.size} L ${tree.x - (tree.size * 0.15)} ${tree.y - (tree.size * 0.4)} L ${tree.x + (tree.size * 0.15)} ${tree.y - (tree.size * 0.4)} Z`} 
               fill="white" opacity="0.8"
             />
           </g>
         ))}
      </svg>

      {/* Vignette Overlay for atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]"></div>
    </div>
  );
};