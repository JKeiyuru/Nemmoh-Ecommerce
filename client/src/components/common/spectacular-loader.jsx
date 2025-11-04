/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
import React from 'react';

const SpectacularLoader = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-white to-amber-50/30 flex items-center justify-center overflow-hidden">
      {/* Subtle animated background elements */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 300 + 100}px`,
              height: `${Math.random() * 300 + 100}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, ${
                i % 2 === 0 
                  ? 'rgba(251, 191, 36, 0.05)' 
                  : 'rgba(156, 163, 175, 0.05)'
              } 0%, transparent 70%)`,
              animation: `float-elegant ${8 + Math.random() * 6}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Main loader container */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Elegant rotating rings */}
        <div className="relative w-32 h-32">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-400/40 border-r-amber-400/40 animate-spin-elegant" />
          
          {/* Middle ring */}
          <div className="absolute inset-3 rounded-full border-2 border-transparent border-b-gray-400/30 border-l-gray-400/30 animate-spin-elegant-reverse" />
          
          {/* Inner glow */}
          <div className="absolute inset-6 rounded-full bg-gradient-to-br from-amber-100/40 to-gray-100/40 animate-pulse-gentle">
            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 animate-scale-pulse shadow-lg shadow-amber-400/50" />
            </div>
          </div>

          {/* Orbiting elegant dots */}
          <div className="absolute inset-0 animate-spin-slow">
            <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-amber-400 rounded-full transform -translate-x-1/2 shadow-sm" />
          </div>
          <div className="absolute inset-0 animate-spin-slow" style={{ animationDelay: '0.75s' }}>
            <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-gray-400 rounded-full transform -translate-x-1/2 shadow-sm" />
          </div>
        </div>

        {/* Elegant text */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-1">
            {['C', 'u', 'r', 'a', 't', 'i', 'n', 'g'].map((letter, i) => (
              <span
                key={i}
                className="text-2xl font-light text-gray-700 tracking-wider"
                style={{
                  animation: 'fadeInUp 0.6s ease-out backwards',
                  animationDelay: `${i * 0.08}s`,
                }}
              >
                {letter}
              </span>
            ))}
          </div>
          
          {/* Animated dots */}
          <div className="flex justify-center space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-amber-400"
                style={{
                  animation: 'bounce-subtle 1.4s infinite',
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Subtle tagline */}
        <p className="text-xs text-gray-400 font-light tracking-widest uppercase animate-fade-in" style={{ animationDelay: '0.5s' }}>
          Premium Toy Experience
        </p>
      </div>

      <style jsx>{`
        @keyframes float-elegant {
          0%, 100% { 
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          50% { 
            transform: translate(20px, -20px) scale(1.05);
            opacity: 0.6;
          }
        }
        
        @keyframes spin-elegant {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes spin-elegant-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse-gentle {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.8;
          }
          50% { 
            transform: scale(1.03);
            opacity: 1;
          }
        }
        
        @keyframes scale-pulse {
          0%, 100% { 
            transform: scale(1);
          }
          50% { 
            transform: scale(1.1);
          }
        }

        @keyframes bounce-subtle {
          0%, 80%, 100% { 
            transform: translateY(0);
            opacity: 0.5;
          }
          40% { 
            transform: translateY(-6px);
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-spin-elegant {
          animation: spin-elegant 3s linear infinite;
        }
        
        .animate-spin-elegant-reverse {
          animation: spin-elegant-reverse 4s linear infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .animate-pulse-gentle {
          animation: pulse-gentle 3s ease-in-out infinite;
        }
        
        .animate-scale-pulse {
          animation: scale-pulse 2s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-in;
        }
      `}</style>
    </div>
  );
};

export default SpectacularLoader;