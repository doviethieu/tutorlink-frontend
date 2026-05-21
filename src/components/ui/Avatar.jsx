import React, { useMemo } from 'react';
import { User } from 'lucide-react';
import NiceAvatar from 'react-nice-avatar'; 

const sizeMap = {
  sm: 'h-8 w-8 text-[10px]',
  md: 'h-10 w-10 text-xs',
  lg: 'h-14 w-14 text-sm',
  xl: 'h-20 w-20 text-base',
};

const cn = (...classes) => classes.filter(Boolean).join(' ');

export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name, size = 'md', className }) {
  const avatarConfig = useMemo(() => buildAvatarConfig(name || 'tutorlink-user'), [name]);

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold text-white',
        'bg-white shadow-sm ring-1 ring-gray-200 dark:ring-gray-800',
        sizeMap[size],
        className,
      )}
    >
      {name ? (
        <NiceAvatar 
          className="h-full w-full" 
          style={{ width: '100%', height: '100%' }} 
          {...avatarConfig} 
        />
      ) : (
        <User className="h-1/2 w-1/2 text-gray-400" />
      )}
    </span>
  );
}

function buildAvatarConfig(seed) {
  const hash = hashSeed(seed);
  const pick = (items, offset) => items[(hash + offset) % items.length];
  
  return {
    sex: pick(['man', 'woman'], 1),
    faceColor: pick(['#F9C9B6', '#F6D0B1', '#E8B48F', '#DFA878'], 2),
    earSize: pick(['small', 'big'], 3),
    hairColor: pick(['#191919', '#4A312C', '#7C4A2D', '#A55F35'], 4),
    hairStyle: pick(['normal', 'thick', 'mohawk', 'womanLong', 'womanShort'], 5),
    hatColor: pick(['#0A66C2', '#057642', '#6B7280', '#B7791F'], 6),
    hatStyle: pick(['none', 'beanie', 'turban'], 7),
    eyeStyle: pick(['circle', 'oval', 'smile'], 8),
    glassesStyle: pick(['none', 'round', 'square'], 9),
    noseStyle: pick(['short', 'long', 'round'], 10),
    mouthStyle: pick(['laugh', 'smile', 'peace'], 11),
    shirtStyle: pick(['hoody', 'short', 'polo'], 12),
    shirtColor: pick(['#0A66C2', '#057642', '#7C3AED', '#334155', '#B45309'], 13),
    bgColor: pick(['#DCEBFA', '#DDF7EC', '#FDECC8', '#ECE7FF', '#FCE1E7'], 14),
    isGradient: true,
  };
}

function hashSeed(seed) {
  return seed.split('').reduce((hash, char) => {
    return (hash * 31 + char.charCodeAt(0)) >>> 0;
  }, 7);
}