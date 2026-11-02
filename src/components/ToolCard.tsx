import React, { useRef, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { ToolDefinition } from '../data/toolsRegistry';
import { ToolIcon } from './ToolIcon';

interface ToolCardProps {
  tool: ToolDefinition;
  onNavigate: (href: string, e: React.MouseEvent<HTMLAnchorElement>) => void;
  index?: number;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onNavigate, index = 0 }) => {
  const href = `/${tool.slug}/`;
  const cardRef = useRef<HTMLAnchorElement | null>(null);

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate tilt angle: max 7 degrees
    const rotateX = ((centerY - y) / centerY) * 7;
    const rotateY = ((x - centerX) / centerX) * 7;

    setTilt({ x: rotateX, y: rotateY });
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.18,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
      whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{
        duration: 0.55,
        delay: Math.min(index * 0.05, 0.4),
        ease: [0.21, 1, 0.36, 1],
      }}
      style={{
        transformPerspective: 1000,
        transformStyle: 'preserve-3d',
      }}
      className="h-full"
    >
      <a
        ref={cardRef}
        href={href}
        onClick={(e) => onNavigate(href, e)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: 'preserve-3d',
        }}
        className="group relative flex flex-col justify-between h-full p-5 sm:p-6 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/90 hover:border-indigo-500/70 dark:hover:border-indigo-500/70 hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-950/30 transition-[border-color,box-shadow,transform] duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 overflow-hidden"
      >
        {/* 3D Specular Glare Overlay */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(99, 102, 241, ${glare.opacity}), transparent 65%)`,
          }}
          aria-hidden="true"
        />

        {/* Top Ambient Glow Edge */}
        <div
          className="pointer-events-none absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/0 to-transparent group-hover:via-indigo-500/60 transition-all duration-300"
          aria-hidden="true"
        />

        <div style={{ transform: 'translateZ(14px)' }} className="relative z-10">
          <div className="flex items-center justify-between gap-3 mb-3.5">
            <div className="inline-flex items-center gap-3">
              <span
                style={{ transform: 'translateZ(20px)' }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/60 dark:from-indigo-950/80 dark:to-slate-800/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/60 inline-flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200"
              >
                <ToolIcon name={tool.iconName} className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {tool.name}
                </h3>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {tool.category}
                </span>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
            {tool.shortDescription}
          </p>
        </div>

        <div
          style={{ transform: 'translateZ(12px)' }}
          className="relative z-10 mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400"
        >
          <span className="inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">
            <span>Open Tool</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </span>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
            Free · Local
          </span>
        </div>
      </a>
    </motion.div>
  );
};
