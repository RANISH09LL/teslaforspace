import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls, Line, Html } from '@react-three/drei';
import * as THREE from 'three';

// The Satellite Mesh
function Satellite() {
  const satRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Gentle bobbing and slow rotation for that alive, cinematic feel
    satRef.current.position.y = Math.sin(t) * 0.2;
    satRef.current.rotation.y = t * 0.1;
    satRef.current.rotation.z = Math.sin(t * 0.5) * 0.05;
  });

  return (
    <group ref={satRef}>
      {/* Central Body (Gold/Metal) */}
      <mesh>
        <cylinderGeometry args={[0.5, 0.5, 2, 16]} />
        <meshStandardMaterial color="#eeeeee" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Left Solar Panel */}
      <mesh position={[-2, 0, 0]}>
        <boxGeometry args={[3, 0.1, 1.5]} />
        <meshStandardMaterial color="#0A1128" metalness={0.9} roughness={0.4} />
      </mesh>
      {/* Right Solar Panel */}
      <mesh position={[2, 0, 0]}>
        <boxGeometry args={[3, 0.1, 1.5]} />
        <meshStandardMaterial color="#0A1128" metalness={0.9} roughness={0.4} />
      </mesh>

      {/* The glowing scanner frustum (Cone) */}
      <mesh position={[0, 0, 4]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[3, 8, 32, 1, true]} />
        <meshBasicMaterial color="#00F0FF" transparent opacity={0.15} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

// A piece of mock space debris approaching
function Asteroid() {
  const asteroidRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Move debris towards satellite to simulate threat
    const zPos = 15 - (t * 5) % 20; 
    asteroidRef.current.position.z = zPos;
    asteroidRef.current.rotation.x += 0.01;
    asteroidRef.current.rotation.y += 0.02;
    asteroidRef.current.rotation.z += 0.03;
  });

  return (
    <group ref={asteroidRef} position={[2, 1, 15]}>
      <mesh>
        <dodecahedronGeometry args={[0.8, 1]} />
        <meshStandardMaterial color="#444444" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Red threat bounding box */}
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshBasicMaterial color="#FF2A2A" wireframe transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

export default function AutopilotHUD() {
  return (
    <div className="w-full h-full relative">
      {/* Overlay UI */}
      <div className="absolute top-4 left-4 z-10 text-xs font-mono tracking-widest text-neon-blue">
        [ 3D EGO-CENTRIC RADAR ACTIVE ]
      </div>
      
      {/* 3D Canvas */}
      <div className="w-full h-full overflow-hidden hud-glow-blue">
        <Canvas camera={{ position: [2.5, 1.5, -4], fov: 50 }}>
          {/* Lighting */}
          <ambientLight intensity={0.2} />
          <directionalLight position={[10, 10, -10]} intensity={2} color="#ffffff" />
          <pointLight position={[-10, -10, -10]} intensity={1} color="#00F0FF" />

          {/* Environment */}
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          
          <Satellite />
          <Asteroid />

          {/* Current Orbit */}
          <mesh rotation={[Math.PI/2, 0, 0]} position={[0, -0.5, 0]}>
             <torusGeometry args={[18, 0.02, 16, 100]} />
             <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
             <Html position={[18, 0, 0]} center>
               <div className="text-[9px] font-mono text-white/60 bg-black/50 px-2 py-1 whitespace-nowrap border border-white/20">CURRENT ORBIT</div>
             </Html>
          </mesh>

          {/* Predicted Collision Orbit */}
          <mesh rotation={[Math.PI/2, 0, 0]} position={[0, -0.5, 0]}>
             <torusGeometry args={[18, 0.05, 16, 100]} />
             <meshBasicMaterial color="#ff0000" transparent opacity={0.3} />
             <Html position={[-18, 0, 0]} center>
               <div className="text-[9px] font-mono text-red-400 bg-red-900/50 px-2 py-1 whitespace-nowrap border border-red-500/50">PREDICTED COLLISION PATH</div>
             </Html>
          </mesh>

          {/* AI Planned Safe Orbit */}
          <mesh rotation={[Math.PI/2, 0.1, 0]} position={[0, -0.5, 0]}>
             <torusGeometry args={[18, 0.08, 16, 100]} />
             <meshBasicMaterial color="#00ffff" transparent opacity={0.6} />
             <Html position={[0, 18, 0]} center>
               <div className="text-[9px] font-mono text-neon-blue bg-blue-900/50 px-2 py-1 whitespace-nowrap border border-neon-blue/50">AI RECOMMENDED PATH</div>
             </Html>
          </mesh>

          {/* Grid helper to give scale/velocity context */}
          <gridHelper args={[50, 50, '#ffffff', '#ffffff']} position={[0, -3, 0]} material-opacity={0.1} material-transparent />

          {/* Let user pan around to feel the 3D space */}
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>
    </div>
  );
}
