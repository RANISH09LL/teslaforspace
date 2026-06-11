import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Stars, OrbitControls, Line } from '@react-three/drei';
import * as THREE from 'three';

// Generates the points for the orbital path of a satellite
function getOrbitPath(a, e, i, raan, arg_p) {
  const points = [];
  const segments = 64;
  const r = (a - 6371) / 100;
  for (let k = 0; k <= segments; k++) {
    const ta = (k / segments) * Math.PI * 2;
    const x_orb = r * Math.cos(ta);
    const y_orb = r * Math.sin(ta);
    const x = x_orb * Math.cos(raan) - y_orb * Math.cos(i) * Math.sin(raan);
    const y = x_orb * Math.sin(raan) + y_orb * Math.cos(i) * Math.cos(raan);
    const z = y_orb * Math.sin(i);
    points.push(new THREE.Vector3(x, y, z));
  }
  return points;
}

function SatNode({ node, isFailing }) {
  const ref = useRef();
  
  const r = (node.a - 6371) / 100;
  const i = node.i;
  const raan = node.raan;
  const ta = node.trueAnomaly;

  const x_orb = r * Math.cos(ta);
  const y_orb = r * Math.sin(ta);

  const x = x_orb * Math.cos(raan) - y_orb * Math.cos(i) * Math.sin(raan);
  const y = x_orb * Math.sin(raan) + y_orb * Math.cos(i) * Math.cos(raan);
  const z = y_orb * Math.sin(i);

  let color = '#00ffff'; // healthy cyan
  let size = 0.08;
  if (node.status === 'OFFLINE') { color = '#ff0000'; size = 0.12; }
  else if (isFailing) { color = '#ff0000'; size = 0.15; }
  else if (node.id === 'NODE-42') { color = '#ffffff'; size = 0.12; } // Handoff target

  useFrame(() => {
    if (ref.current) {
      ref.current.lookAt(0, 0, 0);
    }
  });

  const orbitPoints = useMemo(() => getOrbitPath(node.a, node.e, node.i, node.raan, node.arg_p), [node.a, node.e, node.i, node.raan, node.arg_p]);

  return (
    <group>
      {/* Orbit Trail */}
      <Line points={orbitPoints} color={color} opacity={0.05} transparent lineWidth={0.5} />

      {/* Satellite Body & Cone */}
      <group position={[x, y, z]} ref={ref}>
        {/* The dot */}
        <mesh>
          <sphereGeometry args={[size, 16, 16]} />
          <meshBasicMaterial color={color} />
          <mesh scale={2}>
            <sphereGeometry args={[size, 16, 16]} />
            <meshBasicMaterial color={color} transparent opacity={isFailing ? 0.8 : 0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        </mesh>
        
        {/* Coverage Cone pointing down to Earth (local +Z since lookAt points +Z away? wait, lookAt points +Z towards target in 3js? No, lookAt points -Z towards target) */}
        <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0, r/2]}>
           <cylinderGeometry args={[0.01, 1.2, r, 16, 1, true]} />
           <meshBasicMaterial color={color} transparent opacity={0.03} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

function Constellation({ nodes, timeMultiplier, activeAnomalies }) {
  const groupRef = useRef();

  const sysFail = activeAnomalies?.find(a => a.threat === 'SYSTEM_FAILURE');
  
  // Create Neural Links (connect nodes that are close to each other)
  const neuralLinks = useMemo(() => {
    const links = [];
    for (let j = 0; j < nodes.length; j+=3) { // skip some to avoid clutter
      for (let k = j+1; k < nodes.length; k+=3) {
        const n1 = nodes[j]; const n2 = nodes[k];
        const r1 = (n1.a - 6371)/100; const r2 = (n2.a - 6371)/100;
        const p1 = new THREE.Vector3(
          r1*Math.cos(n1.trueAnomaly)*Math.cos(n1.raan) - r1*Math.sin(n1.trueAnomaly)*Math.cos(n1.i)*Math.sin(n1.raan),
          r1*Math.cos(n1.trueAnomaly)*Math.sin(n1.raan) + r1*Math.sin(n1.trueAnomaly)*Math.cos(n1.i)*Math.cos(n1.raan),
          r1*Math.sin(n1.trueAnomaly)*Math.sin(n1.i)
        );
        const p2 = new THREE.Vector3(
          r2*Math.cos(n2.trueAnomaly)*Math.cos(n2.raan) - r2*Math.sin(n2.trueAnomaly)*Math.cos(n2.i)*Math.sin(n2.raan),
          r2*Math.cos(n2.trueAnomaly)*Math.sin(n2.raan) + r2*Math.sin(n2.trueAnomaly)*Math.cos(n2.i)*Math.cos(n2.raan),
          r2*Math.sin(n2.trueAnomaly)*Math.sin(n2.i)
        );
        if (p1.distanceTo(p2) < 4) {
          links.push([p1, p2]);
        }
      }
    }
    return links;
  }, [nodes]);

  // Handoff laser
  const handoffLine = useMemo(() => {
    if (!sysFail || nodes.length < 43) return null;
    const getPos = (n) => {
      const r = (n.a - 6371) / 100;
      const x = r*Math.cos(n.trueAnomaly)*Math.cos(n.raan) - r*Math.sin(n.trueAnomaly)*Math.cos(n.i)*Math.sin(n.raan);
      const y = r*Math.cos(n.trueAnomaly)*Math.sin(n.raan) + r*Math.sin(n.trueAnomaly)*Math.cos(n.i)*Math.cos(n.raan);
      const z = r*Math.sin(n.trueAnomaly)*Math.sin(n.i);
      return [x, y, z];
    };
    return [getPos(nodes[0]), getPos(nodes[41])];
  }, [nodes, sysFail]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001 * timeMultiplier;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Neural Web */}
      {neuralLinks.map((pts, i) => (
        <Line key={`link-${i}`} points={pts} color="#00ffff" opacity={0.08} transparent lineWidth={0.5} />
      ))}

      {nodes.map((node, i) => (
        <SatNode key={node.id} node={node} isFailing={sysFail && i === 0} />
      ))}

      {handoffLine && (
        <Line points={handoffLine} color="#ffffff" lineWidth={3} transparent opacity={0.9} />
      )}
    </group>
  );
}

// Coverage Heatmap on Earth
function CoverageHeatmap({ hasFailure }) {
  const mapRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (mapRef.current) {
      mapRef.current.rotation.y += 0.0005;
      // Pulse the red gap if there's a failure
      mapRef.current.material.opacity = hasFailure ? 0.6 + Math.sin(t*5)*0.2 : 0.3;
    }
  });

  return (
    <mesh ref={mapRef} scale={1.01}>
      <sphereGeometry args={[5, 64, 64]} />
      {/* A custom shader or textured material would be best, but we'll use a colored wireframe or additive blend */}
      <meshBasicMaterial 
        color={hasFailure ? "#ff0000" : "#00ff88"} 
        transparent 
        opacity={0.3} 
        blending={THREE.AdditiveBlending}
        wireframe={hasFailure}
      />
    </mesh>
  );
}

function Earth({ hasFailure }) {
  const earthRef = useRef();
  const [colorMap] = useLoader(THREE.TextureLoader, ['https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg']);

  return (
    <group>
      <mesh ref={earthRef}>
        <sphereGeometry args={[5, 64, 64]} />
        <meshStandardMaterial map={colorMap} roughness={0.8} metalness={0.1} />
        <mesh>
          <sphereGeometry args={[5.1, 64, 64]} />
          <meshBasicMaterial color="#0088ff" transparent opacity={0.15} blending={THREE.AdditiveBlending} />
        </mesh>
      </mesh>
      <CoverageHeatmap hasFailure={hasFailure} />
    </group>
  );
}

export default function SpaceGlobe({ telemetry }) {
  const constellation = telemetry?.constellation || [];
  const activeAnomalies = telemetry?.activeAnomalies || [];
  const hasFailure = activeAnomalies.some(a => a.threat === 'SYSTEM_FAILURE');

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-4 left-4 z-10 text-xs font-mono tracking-widest text-white/50">
        [ GLOBAL FLEET ORCHESTRATOR ]
      </div>
      
      {hasFailure && (
        <div className="absolute inset-0 border-4 border-neon-red/50 animate-pulse pointer-events-none z-20"></div>
      )}
      
      <div className="w-full h-full border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative bg-black">
        <Canvas camera={{ position: [0, 2, 12], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          
          <Earth hasFailure={hasFailure} />
          <Constellation nodes={constellation} timeMultiplier={telemetry?.timeMultiplier || 1} activeAnomalies={activeAnomalies} />

          <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={0.5 * (telemetry?.timeMultiplier || 1)} minDistance={6} maxDistance={20} />
        </Canvas>
      </div>
    </div>
  );
}
