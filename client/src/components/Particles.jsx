import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

const Particles = () => {
  const ref = useRef();

  // Generate random particle positions
  const sphere = React.useMemo(() => {
    const positions = [];
    for (let i = 0; i < 5000; i++) {
      const x = (Math.random() - 0.5) * 10; // Spread particles across a range
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 10;
      positions.push(x, y, z);
    }
    return new THREE.Float32BufferAttribute(positions, 3);
  }, []);

  // Animate the particles to move slightly
  useFrame(() => {
    ref.current.rotation.y += 0.001; // Slowly rotate particles
  });

  return (
    <Points ref={ref} positions={sphere}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.05} // Increase size for better visibility
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
};

const ParticlesCanvas = () => (
  <Canvas
    style={{
      position: "absolute",
      inset: 0,
      zIndex: -1, // Ensure particles stay behind the content
    }}
    camera={{ position: [0, 0, 5], fov: 75 }} // Adjust camera position
  >
    <Particles />
  </Canvas>
);

export default ParticlesCanvas;
