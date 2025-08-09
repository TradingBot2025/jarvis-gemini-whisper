import React, { useState } from 'react';

interface JarvisCoreProps {
  isListening: boolean;
  isProcessing: boolean;
}

const JarvisCore: React.FC<JarvisCoreProps> = ({ isListening, isProcessing }) => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Main Core Circle */}
      <div className={`
        w-48 h-48 rounded-full border-2 border-primary
        flex items-center justify-center relative
        ${isListening ? 'animate-pulse-glow' : ''}
        ${isProcessing ? 'animate-pulse' : ''}
        transition-all duration-300
      `}>
        {/* Inner Core */}
        <div className={`
          w-32 h-32 rounded-full border border-primary/50
          flex items-center justify-center relative
          ${isListening ? 'bg-primary/20' : 'bg-primary/10'}
          transition-all duration-300
        `}>
          {/* Center Dot */}
          <div className={`
            w-4 h-4 rounded-full bg-primary
            ${isListening || isProcessing ? 'animate-float' : ''}
            transition-all duration-300
          `} />
        </div>

        {/* Orbiting Elements */}
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`
              absolute w-2 h-2 bg-accent rounded-full
              ${isListening ? 'animate-orbit' : ''}
            `}
            style={{
              animationDelay: `${i * 2.67}s`,
              opacity: isListening ? 1 : 0.3
            }}
          />
        ))}
      </div>

      {/* Status Rings */}
      <div className="absolute w-64 h-64 border border-primary/20 rounded-full animate-pulse" />
      <div className="absolute w-80 h-80 border border-primary/10 rounded-full animate-pulse" 
           style={{ animationDelay: '1s' }} />
    </div>
  );
};

export default JarvisCore;