import React, { useState, useEffect } from 'react';
import { Palette, Sparkles } from 'lucide-react';

export type AmbientTheme = 'bistro' | 'emerald' | 'sunset' | 'midnight' | 'neon';

interface ThemeConfig {
  id: AmbientTheme;
  name: string;
  emoji: string;
  bgClass: string;
  glow1: string;
  glow2: string;
  glow3: string;
  accentText: string;
}

export const AMBIENT_THEMES: Record<AmbientTheme, ThemeConfig> = {
  bistro: {
    id: 'bistro',
    name: 'Warm Bistro',
    emoji: '🍷',
    bgClass: 'bg-amber-50/40',
    glow1: 'rgba(251, 146, 60, 0.18)', // orange
    glow2: 'rgba(245, 158, 11, 0.15)', // amber
    glow3: 'rgba(239, 68, 68, 0.10)',  // red
    accentText: 'text-amber-800',
  },
  emerald: {
    id: 'emerald',
    name: 'Mint Lounge',
    emoji: '🍸',
    bgClass: 'bg-emerald-50/40',
    glow1: 'rgba(16, 185, 129, 0.18)', // emerald
    glow2: 'rgba(20, 184, 166, 0.15)', // teal
    glow3: 'rgba(6, 182, 212, 0.10)',  // cyan
    accentText: 'text-emerald-800',
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Rooftop',
    emoji: '🌅',
    bgClass: 'bg-rose-50/40',
    glow1: 'rgba(244, 63, 94, 0.18)',  // rose
    glow2: 'rgba(168, 85, 247, 0.15)', // purple
    glow3: 'rgba(249, 115, 22, 0.12)', // orange
    accentText: 'text-rose-800',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Velvet',
    emoji: '🌙',
    bgClass: 'bg-slate-100/70',
    glow1: 'rgba(99, 102, 241, 0.20)', // indigo
    glow2: 'rgba(59, 130, 246, 0.16)', // blue
    glow3: 'rgba(139, 92, 246, 0.12)', // violet
    accentText: 'text-indigo-800',
  },
  neon: {
    id: 'neon',
    name: 'Cyber Diner',
    emoji: '⚡',
    bgClass: 'bg-cyan-50/40',
    glow1: 'rgba(6, 182, 212, 0.22)',  // cyan
    glow2: 'rgba(236, 72, 153, 0.15)', // pink
    glow3: 'rgba(234, 179, 8, 0.12)',  // yellow
    accentText: 'text-cyan-800',
  },
};

interface InteractiveBackgroundProps {
  currentTheme: AmbientTheme;
  onThemeChange: (theme: AmbientTheme) => void;
}

export const InteractiveBackground: React.FC<InteractiveBackgroundProps> = ({
  currentTheme,
  onThemeChange,
}) => {
  const [mousePos, setMousePos] = useState({ x: 50, y: 30 });
  const theme = AMBIENT_THEMES[currentTheme] || AMBIENT_THEMES.bistro;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Compute mouse percentage relative to window size
      const xPercent = Math.round((e.clientX / window.innerWidth) * 100);
      const yPercent = Math.round((e.clientY / window.innerHeight) * 100);
      setMousePos({ x: xPercent, y: yPercent });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      {/* Dynamic atmospheric mesh background */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-colors duration-700 ease-in-out overflow-hidden"
        style={{
          background: `
            radial-gradient(circle 600px at ${mousePos.x}% ${mousePos.y}%, ${theme.glow1} 0%, transparent 70%),
            radial-gradient(circle 700px at 15% 20%, ${theme.glow2} 0%, transparent 60%),
            radial-gradient(circle 800px at 85% 80%, ${theme.glow3} 0%, transparent 60%)
          `,
        }}
      >
        {/* Subtle decorative grid/grain layer */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(#000000 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Floating Theme Vibe Switcher Pill (Floating subtle control) */}
      <div className="fixed bottom-4 left-4 z-40 hidden sm:flex items-center gap-1 rounded-full border border-neutral-200/90 bg-white/90 p-1 shadow-lg backdrop-blur-md transition-all hover:bg-white">
        <div className="flex items-center gap-1 px-2 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
          <Palette className="h-3 w-3 text-neutral-600" />
          <span>Vibe</span>
        </div>
        {(Object.keys(AMBIENT_THEMES) as AmbientTheme[]).map((themeKey) => {
          const t = AMBIENT_THEMES[themeKey];
          const isSelected = currentTheme === themeKey;
          return (
            <button
              key={themeKey}
              type="button"
              onClick={() => onThemeChange(themeKey)}
              title={`Switch ambiance to ${t.name}`}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-neutral-900 text-white shadow-xs scale-105'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <span>{t.emoji}</span>
              <span className="text-[11px]">{t.name}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
