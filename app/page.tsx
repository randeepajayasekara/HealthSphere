"use client";

import { useEffect, useState } from 'react';

export default function Home() {
  const [noiseIntensity, setNoiseIntensity] = useState(0.4);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      setNoiseIntensity(0.35 + Math.random() * 0.15);
    }, 800);
    
    // Show player after a delay for dramatic effect
    const playerTimer = setTimeout(() => {
      setIsPlayerVisible(true);
    }, 1500);
    
    return () => {
      clearInterval(intervalId);
      clearTimeout(playerTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black">
      {/* TV Static Layer */}
      <div 
        className="absolute inset-0 w-full h-full animate-tv-static"
        style={{
          backgroundImage: `
            linear-gradient(
              to bottom,
              rgba(255, 255, 255, 0) 0%,
              rgba(255, 255, 255, 0.05) 50%,
              rgba(255, 255, 255, 0) 100%
            ),
            url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(%23noise)" opacity="${noiseIntensity}"/></svg>')
          `,
        }}
      />
      
      {/* Scan Lines */}
      <div className="absolute inset-0 w-full h-full bg-scanlines opacity-20" />
      
      {/* CRT Flicker Effect */}
      <div className="absolute inset-0 w-full h-full animate-flicker opacity-10 bg-white" />
      
      {/* Vignette Effect */}
      <div className="absolute inset-0 w-full h-full bg-radial-vignette opacity-70" />
      
      {/* Spotify Player */}
      <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 max-w-lg 
        transition-all duration-1000 animate-glow z-10 
        ${isPlayerVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
        <div className="p-4 bg-black bg-opacity-70 rounded-lg border border-green-500 shadow-lg shadow-green-500/30">
          <h2 className="text-green-500 text-xl mb-4 font-mono tracking-wide glitch-text">HEAR THIS OUT!</h2>
          <iframe
            src="https://open.spotify.com/embed/track/1CDQzbCz4KSQxHe7LMEgRM?utm_source=generator" 
            width="100%"
            height="80"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded"
          ></iframe>
        </div>
      </div>

      <style jsx global>{`
        @keyframes tv-static {
          0% { transform: translateX(-1px) translateY(1px); }
          25% { transform: translateX(1px) translateY(1px); }
          50% { transform: translateX(1px) translateY(-1px); }
          75% { transform: translateX(-2px) translateY(-1px); }
          100% { transform: translateX(1px) translateY(2px); }
        }
        
        .animate-tv-static {
          animation: tv-static 0.08s steps(2) infinite;
        }
        
        .animate-flicker {
          animation: flicker 0.15s ease infinite alternate;
        }
        
        @keyframes flicker {
          0% { opacity: 0.05; }
          100% { opacity: 0.15; }
        }
        
        .bg-scanlines {
          background: repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0) 0px,
            rgba(0, 0, 0, 0) 1px,
            rgba(255, 255, 255, 0.05) 1px,
            rgba(255, 255, 255, 0.05) 2px
          );
        }
        
        .bg-radial-vignette {
          background: radial-gradient(
            circle,
            transparent 50%,
            rgba(0, 0, 0, 0.8) 150%
          );
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite alternate;
        }
        
        @keyframes glow {
          0% { box-shadow: 0 0 5px rgba(30, 215, 96, 0.6); }
          100% { box-shadow: 0 0 20px rgba(30, 215, 96, 0.8); }
        }
        
        .glitch-text {
          position: relative;
          text-shadow: 0.05em 0 0 rgba(255, 0, 0, 0.75),
                      -0.05em -0.025em 0 rgba(0, 255, 0, 0.75),
                      0.025em 0.05em 0 rgba(0, 0, 255, 0.75);
          animation: glitch 1s infinite;
        }
        
        @keyframes glitch {
          0% { text-shadow: 0.05em 0 0 rgba(255, 0, 0, 0.75), -0.05em -0.025em 0 rgba(0, 255, 0, 0.75), 0.025em 0.05em 0 rgba(0, 0, 255, 0.75); }
          14% { text-shadow: 0.05em 0 0 rgba(255, 0, 0, 0.75), -0.05em -0.025em 0 rgba(0, 255, 0, 0.75), 0.025em 0.05em 0 rgba(0, 0, 255, 0.75); }
          15% { text-shadow: -0.05em -0.025em 0 rgba(255, 0, 0, 0.75), 0.025em 0.025em 0 rgba(0, 255, 0, 0.75), -0.05em -0.05em 0 rgba(0, 0, 255, 0.75); }
          49% { text-shadow: -0.05em -0.025em 0 rgba(255, 0, 0, 0.75), 0.025em 0.025em 0 rgba(0, 255, 0, 0.75), -0.05em -0.05em 0 rgba(0, 0, 255, 0.75); }
          50% { text-shadow: 0.025em 0.05em 0 rgba(255, 0, 0, 0.75), 0.05em 0 0 rgba(0, 255, 0, 0.75), 0 -0.05em 0 rgba(0, 0, 255, 0.75); }
          99% { text-shadow: 0.025em 0.05em 0 rgba(255, 0, 0, 0.75), 0.05em 0 0 rgba(0, 255, 0, 0.75), 0 -0.05em 0 rgba(0, 0, 255, 0.75); }
          100% { text-shadow: -0.025em 0 0 rgba(255, 0, 0, 0.75), -0.025em -0.025em 0 rgba(0, 255, 0, 0.75), -0.025em -0.05em 0 rgba(0, 0, 255, 0.75); }
        }
      `}</style>
    </div>
  );
}
