import React from 'react';
import { SnakeTailProps } from '@/types/snakeProps';

const SnakeTail: React.FC<SnakeTailProps> = ({ color, reverse = false }) => (
  <svg
    viewBox="0 0 100 100"
    className={`w-8 h-8 md:w-10 md:h-10 drop-shadow-md transition-transform shrink-0 ${
      reverse ? 'scale-x-[-1]' : ''
    }`}
    aria-hidden="true"
  >
    {/* Dynamic tail fill matching the snake decade color */}
    <path
      d="M 80 50 Q 60 20, 40 30 Q 20 40, 10 50 Q 20 60, 40 70 Q 60 80, 80 50 Z"
      className={color ? `fill-gradient-${color}` : 'text-amber-500'}
      fill="currentColor"
    />
    {/* Rattle segments */}
    <rect x="2" y="42" width="6" height="16" rx="3" fill="#f59e0b" />
    <rect x="9" y="39" width="6" height="22" rx="3" fill="#d97706" />
    <rect x="16" y="36" width="6" height="28" rx="3" fill="#b45309" />
  </svg>
);

export default SnakeTail;