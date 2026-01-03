import React, { useRef, useMemo, useEffect, useState } from 'react';

declare global {
  interface Window {
    THREE: any;
  }
}

const NebulaShader = {
  vertex: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragment: `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform float uComplexity;
    uniform float uSpeed;
    varying vec2 vUv;

    // Simplex Noise Function
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      vec2 uv = vUv;
      float noiseVal = snoise(uv * uComplexity + uTime * uSpeed);
      float noiseVal2 = snoise(uv * (uComplexity * 1.5) - uTime * (uSpeed * 0.5));
      float fluid = (noiseVal + noiseVal2) * 0.5;
      float dist = distance(uv, vec2(0.5));
      float glow = 1.0 - smoothstep(0.0, 0.8, dist);
      vec3 color = mix(uColor1, uColor2, fluid + glow * 0.5);
      float alpha = smoothstep(0.6, 0.2, dist);
      gl_FragColor = vec4(color, alpha * 0.8); // Slightly transparent
    }
  `
};

const useThree = () => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (window.THREE) {
      setLoaded(true);
      return;
    }
    // Fallback if not loaded in head
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    script.onload = () => setLoaded(true);
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);
  return loaded;
};

export interface NebulaConfig {
    speed?: number;
    complexity?: number;
    c1?: string; // hex
    c2?: string; // hex
}

interface WebGLNebulaProps {
  config?: NebulaConfig;
  state?: "idle" | "anxious" | "focus" | "breathe";
}

export const WebGLNebula = ({ state = "idle", config }: WebGLNebulaProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const isThreeLoaded = useThree();
  
  // Base Defaults
  const presets = useMemo(() => ({
    idle: { c1: 0x22d3ee, c2: 0x0ea5e9, speed: 0.1, complexity: 1.5 }, // Cyan/Blue
    anxious: { c1: 0xf59e0b, c2: 0xef4444, speed: 0.8, complexity: 6.0 }, // Amber/Red
    focus: { c1: 0xffffff, c2: 0x22d3ee, speed: 0.05, complexity: 1.0 }, // White/Cyan
    breathe: { c1: 0xa78bfa, c2: 0x8b5cf6, speed: 0.2, complexity: 1.2 }, // Violet
  }), []);

  useEffect(() => {
    if (!isThreeLoaded || !mountRef.current) return;
    const THREE = window.THREE;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Initial Config
    const base = presets[state];
    const initialConfig = {
        c1: config?.c1 ? new THREE.Color(config.c1) : new THREE.Color(base.c1),
        c2: config?.c2 ? new THREE.Color(config.c2) : new THREE.Color(base.c2),
        speed: config?.speed ?? base.speed,
        complexity: config?.complexity ?? base.complexity
    };

    const uniforms = {
      uTime: { value: 0 },
      uColor1: { value: initialConfig.c1 },
      uColor2: { value: initialConfig.c2 },
      uSpeed: { value: initialConfig.speed },
      uComplexity: { value: initialConfig.complexity },
    };

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader: NebulaShader.vertex,
      fragmentShader: NebulaShader.fragment,
      uniforms: uniforms,
      transparent: true,
    });
    scene.add(new THREE.Mesh(geometry, material));

    let frameId: number;
    const animate = (time: number) => {
      uniforms.uTime.value = time * 0.001;
      
      // Dynamic Interpolation based on Props
      const targetBase = presets[state];
      const targetSpeed = config?.speed ?? targetBase.speed;
      const targetComplexity = config?.complexity ?? targetBase.complexity;
      const targetC1 = config?.c1 ? new THREE.Color(config.c1) : new THREE.Color(targetBase.c1);
      const targetC2 = config?.c2 ? new THREE.Color(config.c2) : new THREE.Color(targetBase.c2);

      // Smooth Lerp
      uniforms.uSpeed.value += (targetSpeed - uniforms.uSpeed.value) * 0.02;
      uniforms.uComplexity.value += (targetComplexity - uniforms.uComplexity.value) * 0.02;
      uniforms.uColor1.value.lerp(targetC1, 0.02);
      uniforms.uColor2.value.lerp(targetC2, 0.02);

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      if (mountRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isThreeLoaded, state, config, presets]);

  return <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-none" />;
};