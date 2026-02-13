import React from 'react';
import Image from 'next/image';


// Predefined gradients for deterministic fallback
const BACKGROUNDS = [
  'bg-gradient-to-br from-indigo-500 to-purple-600',
  'bg-gradient-to-br from-emerald-500 to-teal-600',
  'bg-gradient-to-br from-orange-500 to-red-600',
  'bg-gradient-to-br from-pink-500 to-rose-600',
  'bg-gradient-to-br from-blue-500 to-cyan-600',
  'bg-gradient-to-br from-yellow-500 to-amber-600',
  'bg-gradient-to-br from-violet-500 to-fuchsia-600',
  'bg-gradient-to-br from-slate-500 to-zinc-600',
];

interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string; // e.g. "JD"
  color?: string; // explicit color class or style
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'; // size preset
  className?: string; // arbitrary classes
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-24 h-24 text-3xl',
  '2xl': 'w-32 h-32 text-4xl',
};

export default function Avatar({ 
  src, 
  alt = 'Avatar', 
  fallback = '?', 
  color, 
  size = 'md',
  className = ''
}: AvatarProps) {
  
  // Deterministic color based on fallback string (name/initials)
  const getDeterministicColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % BACKGROUNDS.length;
    return BACKGROUNDS[index];
  };

  const bgColorClass = color || getDeterministicColor(fallback);

  return (
    <div 
      className={`
        relative rounded-full flex items-center justify-center font-bold text-white shadow-sm overflow-hidden shrink-0
        ${SIZE_CLASSES[size]}
        ${!src ? bgColorClass : ''}
        ${className}
      `}
      style={color && color.startsWith('#') ? { backgroundColor: color } : undefined}
    >
      {src ? (
        <Image 
          src={src} 
          alt={alt} 
          fill 
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : (
        <span>{fallback.substring(0, 2).toUpperCase()}</span>
      )}
    </div>
  );
}
