"use client";

import GloalHeader from "./components/layout/Global/global-header";

export default function Home() {
  return (
    <>
    <div className="min-h-screen overflow-hidden relative">
      <GloalHeader />
      <div className="">
        {/* Animated corner gradients */}
        <div className="absolute inset-0">
          {/* Top-left gradient */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-blue-400/30 via-purple-400/20 to-transparent rounded-full animate-pulse" 
               style={{
                 animation: 'float 6s ease-in-out infinite',
                 animationDelay: '0s'
               }} />
          
          {/* Top-right gradient */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-bl from-green-400/30 via-cyan-400/20 to-transparent rounded-full animate-pulse"
               style={{
                 animation: 'float 8s ease-in-out infinite reverse',
                 animationDelay: '2s'
               }} />
          
          {/* Bottom-left gradient */}
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-pink-400/30 via-rose-400/20 to-transparent rounded-full animate-pulse"
               style={{
                 animation: 'float 7s ease-in-out infinite',
                 animationDelay: '4s'
               }} />
          
          {/* Bottom-right gradient */}
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-tl from-yellow-400/30 via-orange-400/20 to-transparent rounded-full animate-pulse"
               style={{
                 animation: 'float 5s ease-in-out infinite reverse',
                 animationDelay: '1s'
               }} />
        </div>

        {/* Center content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <h1 className="text-6xl md:text-8xl font-bold text-center bg-gradient-to-r from-red-600 via-amber-600 to-red-600 bg-clip-text text-transparent animate-pulse">
            HealthSphere
          </h1>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(10px, -15px) scale(1.05);
          }
          50% {
            transform: translate(-5px, -10px) scale(0.95);
          }
          75% {
            transform: translate(-10px, 5px) scale(1.02);
          }
        }
      `}</style>
      </div>
    </>
  );
}
