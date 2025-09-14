'use client'

import { useEffect, useRef } from 'react'

// NEURAL: Mesh gradient implementation with BrainSAIT colors
export function MeshGradientBackground() {
  const primaryRef = useRef<HTMLDivElement>(null)
  const wireframeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // NEURAL: Animate mesh gradients with different speeds
    const animateMesh = () => {
      if (primaryRef.current && wireframeRef.current) {
        const time = Date.now() * 0.001
        
        // Primary mesh - speed 0.3
        const primaryTransform = `
          translate(${Math.sin(time * 0.3) * 20}px, ${Math.cos(time * 0.3) * 15}px)
          rotate(${time * 0.3 * 10}deg)
          scale(${1 + Math.sin(time * 0.3) * 0.1})
        `
        
        // Wireframe mesh - speed 0.2
        const wireframeTransform = `
          translate(${Math.sin(time * 0.2 + Math.PI) * 25}px, ${Math.cos(time * 0.2 + Math.PI) * 20}px)
          rotate(${time * 0.2 * -8}deg)
          scale(${1 + Math.cos(time * 0.2) * 0.08})
        `
        
        primaryRef.current.style.transform = primaryTransform
        wireframeRef.current.style.transform = wireframeTransform
      }
      
      requestAnimationFrame(animateMesh)
    }
    
    animateMesh()
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden bg-midnight-900">
      {/* Primary mesh gradient */}
      <div
        ref={primaryRef}
        className="absolute -inset-[50%] opacity-80"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(26, 54, 93, 0.8) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(43, 108, 184, 0.6) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(14, 165, 233, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 90% 70%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 10% 90%, rgba(234, 88, 12, 0.2) 0%, transparent 50%)
          `,
          filter: 'blur(40px)',
        }}
      />
      
      {/* Wireframe overlay - 60% opacity */}
      <div
        ref={wireframeRef}
        className="absolute -inset-[50%] opacity-60"
        style={{
          background: `
            conic-gradient(from 0deg at 50% 50%, 
              rgba(255, 255, 255, 0.1) 0deg,
              rgba(139, 92, 246, 0.2) 60deg,
              rgba(14, 165, 233, 0.15) 120deg,
              rgba(255, 255, 255, 0.05) 180deg,
              rgba(234, 88, 12, 0.1) 240deg,
              rgba(43, 108, 184, 0.2) 300deg,
              rgba(255, 255, 255, 0.1) 360deg
            )
          `,
          filter: 'blur(60px)',
        }}
      />
      
      {/* Glass morphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-midnight-900/50 via-midnight-800/30 to-midnight-900/70 backdrop-blur-sm" />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  )
}
