import { SnakeHeadProps } from "@/types/snakeProps"
import React from "react"

const SnakeHead: React.FC<SnakeHeadProps> = ({ color, reverse = false }) => (
  <svg
    viewBox="0 0 100 100"
    className={`w-9 h-9 md:w-11 md:h-11 drop-shadow-md transition-transform ${reverse ? 'scale-x-[-1]' : ''}`}
  >
    <path d="M 20 50 Q 20 10, 60 10 C 85 10, 95 30, 95 50 C 95 70, 85 90, 60 90 Q 20 90, 20 50 Z" className={`fill-gradient-${color}`} fill="currentColor" />
    <circle cx="65" cy="32" r="10" fill="#ffffff" />
    <circle cx="68" cy="32" r="5" fill="#0f172a" />
    <circle cx="70" cy="30" r="2" fill="#ffffff" />
    <path d="M 95 50 L 115 50 M 115 50 L 122 43 M 115 50 L 122 57" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" fill="none" />
    <path d="M 60 70 Q 72 75, 82 68" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none" />
    <circle cx="82" cy="38" r="3" fill="#f43f5e" opacity="0.6" />
  </svg>
);

export default SnakeHead;