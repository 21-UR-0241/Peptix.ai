import React from 'react';

function AnimatedLogo({ size = 60 }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block' }}
    >
      <defs>
        <linearGradient id="animGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 1 }}>
            <animate 
              attributeName="stop-color" 
              values="#6366f1;#8b5cf6;#6366f1" 
              dur="3s" 
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }}>
            <animate 
              attributeName="stop-color" 
              values="#8b5cf6;#6366f1;#8b5cf6" 
              dur="3s" 
              repeatCount="indefinite"
            />
          </stop>
        </linearGradient>
        
        <filter id="logoGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <g filter="url(#logoGlow)">
        {/* Left strand */}
        <path 
          d="M 30 20 Q 25 35 30 50 Q 35 65 30 80" 
          stroke="url(#animGradient)" 
          strokeWidth="4" 
          fill="none" 
          strokeLinecap="round"
        >
          <animate 
            attributeName="d" 
            values="M 30 20 Q 25 35 30 50 Q 35 65 30 80;M 30 20 Q 35 35 30 50 Q 25 65 30 80;M 30 20 Q 25 35 30 50 Q 35 65 30 80"
            dur="4s" 
            repeatCount="indefinite"
          />
        </path>
        
        {/* Right strand */}
        <path 
          d="M 70 20 Q 75 35 70 50 Q 65 65 70 80" 
          stroke="url(#animGradient)" 
          strokeWidth="4" 
          fill="none" 
          strokeLinecap="round"
        >
          <animate 
            attributeName="d" 
            values="M 70 20 Q 75 35 70 50 Q 65 65 70 80;M 70 20 Q 65 35 70 50 Q 75 65 70 80;M 70 20 Q 75 35 70 50 Q 65 65 70 80"
            dur="4s" 
            repeatCount="indefinite"
          />
        </path>
        
        {/* Connecting bonds */}
        <line x1="30" y1="25" x2="70" y2="25" stroke="url(#animGradient)" strokeWidth="3" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite"/>
        </line>
        <line x1="30" y1="40" x2="70" y2="40" stroke="url(#animGradient)" strokeWidth="3" opacity="0.6">
          <animate attributeName="opacity" values="0.6;0.3;0.6" dur="2s" begin="0.5s" repeatCount="indefinite"/>
        </line>
        <line x1="30" y1="55" x2="70" y2="55" stroke="url(#animGradient)" strokeWidth="3" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" begin="1s" repeatCount="indefinite"/>
        </line>
        <line x1="30" y1="70" x2="70" y2="70" stroke="url(#animGradient)" strokeWidth="3" opacity="0.6">
          <animate attributeName="opacity" values="0.6;0.3;0.6" dur="2s" begin="1.5s" repeatCount="indefinite"/>
        </line>
        
        {/* Particles */}
        <circle cx="30" cy="25" r="4" fill="#6366f1">
          <animate attributeName="r" values="4;5;4" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="70" cy="25" r="4" fill="#8b5cf6">
          <animate attributeName="r" values="4;5;4" dur="2s" begin="0.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="30" cy="55" r="4" fill="#8b5cf6">
          <animate attributeName="r" values="4;5;4" dur="2s" begin="1s" repeatCount="indefinite"/>
        </circle>
        <circle cx="70" cy="55" r="4" fill="#6366f1">
          <animate attributeName="r" values="4;5;4" dur="2s" begin="1.5s" repeatCount="indefinite"/>
        </circle>
      </g>
      
      {/* Sparkles */}
      <g>
        <circle cx="50" cy="15" r="2" fill="#a78bfa" opacity="0">
          <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite"/>
        </circle>
        <circle cx="85" cy="50" r="2" fill="#a78bfa" opacity="0">
          <animate attributeName="opacity" values="0;1;0" dur="3s" begin="1s" repeatCount="indefinite"/>
        </circle>
        <circle cx="15" cy="50" r="2" fill="#a78bfa" opacity="0">
          <animate attributeName="opacity" values="0;1;0" dur="3s" begin="2s" repeatCount="indefinite"/>
        </circle>
      </g>
    </svg>
  );
}

export default AnimatedLogo;