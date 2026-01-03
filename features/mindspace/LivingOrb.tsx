
import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

declare global {
  interface Window {
    THREE: any;
  }
}

// =========================================================
// MINIMALIST ORB SHADER
// =========================================================

const OrbShader = {
  vertex: `
    uniform float uTime;
    uniform float uBreath; 
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying float vPulse;

    void main() {
      vUv = uv;
      vNormal = normal;
      
      // Gentle breathing expansion (Sine wave)
      float breath = sin(uTime * 1.5) * 0.05 + (uBreath * 0.15);
      
      // Minimalist pulse effect (No heavy noise)
      vec3 newPos = position + (normal * breath);
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
    }
  `,
  fragment: `
    uniform vec3 uColor;
    uniform float uIntensity;
    
    varying vec3 vNormal;

    void main() {
      // Fresnel Effect for clean, glowing edges
      vec3 viewDir = normalize(cameraPosition - vNormal); 
      float fresnel = dot(vNormal, vec3(0.0, 0.0, 1.0));
      fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
      fresnel = pow(fresnel, 2.5);

      // Core glow
      vec3 color = uColor * (0.2 + fresnel * 2.0 * uIntensity);
      
      // Soft center fade
      float center = dot(vNormal, vec3(0.0,0.0,1.0));
      color += uColor * 0.5 * smoothstep(0.0, 1.0, center);

      gl_FragColor = vec4(color, 0.9); // High alpha for solidity
    }
  `
};

interface LivingOrbProps {
  mode: 'idle' | 'breathe' | 'hold' | 'anxious' | 'focus';
  breathValue?: number; // 0-1 (For manual control)
  colors?: { c1: string; c2: string }; // We only use c1 for minimalist mode really
  text?: string;
  size?: number;
}

export const LivingOrb = ({ mode, breathValue, colors, text, size = 300 }: LivingOrbProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [threeLoaded, setThreeLoaded] = useState(false);
  
  useEffect(() => {
    if (window.THREE) {
      setThreeLoaded(true);
    } else {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
      script.onload = () => setThreeLoaded(true);
      document.body.appendChild(script);
      return () => { document.body.removeChild(script); };
    }
  }, []);

  useEffect(() => {
    if (!threeLoaded || !mountRef.current) return;

    const THREE = window.THREE;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 2.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // --- MESH SETUP ---
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const material = new THREE.ShaderMaterial({
      vertexShader: OrbShader.vertex,
      fragmentShader: OrbShader.fragment,
      uniforms: {
        uTime: { value: 0 },
        uBreath: { value: 0 },
        uColor: { value: new THREE.Color(0x22d3ee) },
        uIntensity: { value: 1.0 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    const orb = new THREE.Mesh(geometry, material);
    scene.add(orb);

    // --- ANIMATION LOOP ---
    const clock = new THREE.Clock();
    let frameId: number;

    const animate = () => {
      const time = clock.getElapsedTime();
      material.uniforms.uTime.value = time;

      // --- STATE MACHINE ---
      // Determine base color
      let targetColorHex = 0x22d3ee; // Default Blue
      
      if (colors) {
          targetColorHex = new THREE.Color(colors.c1).getHex();
      } else {
          if (mode === 'anxious') targetColorHex = 0xef4444; // Red
          if (mode === 'hold') targetColorHex = 0xffffff; // White hot
          if (mode === 'breathe') targetColorHex = 0xa78bfa; // Purple
      }

      const targetColor = new THREE.Color(targetColorHex);
      material.uniforms.uColor.value.lerp(targetColor, 0.1);

      // Handle Breathing / Tension
      if (mode === 'breathe' || mode === 'hold') {
        // Controlled externally via props
        // Lerp strictly to the breath value for responsiveness
        const currentB = material.uniforms.uBreath.value;
        const targetB = breathValue || 0;
        material.uniforms.uBreath.value += (targetB - currentB) * 0.1;
        
        // Intensity spikes on hold
        const targetI = mode === 'hold' ? 1.5 : 1.0;
        material.uniforms.uIntensity.value += (targetI - material.uniforms.uIntensity.value) * 0.1;
      } else {
        // Idle gentle float
        material.uniforms.uBreath.value = (Math.sin(time) * 0.5 + 0.5) * 0.1;
        material.uniforms.uIntensity.value = 1.0;
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
    };
  }, [threeLoaded, size, mode, breathValue, colors]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <div ref={mountRef} className="absolute inset-0 z-0" />
      <AnimatePresence mode="wait">
        {text && (
          <motion.div
            key={text}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 text-center pointer-events-none"
          >
            <h2 className="text-4xl font-bold tracking-[0.2em] text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] font-mono">
              {text}
            </h2>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
