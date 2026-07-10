import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Sparkles, Torus, Icosahedron } from "@react-three/drei";
import * as THREE from "three";

function OrbitRing({ radius, speed, color, tilt }: { radius: number; speed: number; color: string; tilt: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * speed;
  });
  return (
    <group ref={ref} rotation={[tilt, 0, 0]}>
      <Torus args={[radius, 0.012, 16, 120]}>
        <meshBasicMaterial color={color} transparent opacity={0.35} />
      </Torus>
    </group>
  );
}

// The abstract gold blob used to live here — replaced by the real duotone
// photo of Rajeev rendered behind this canvas; the rings/particles now orbit
// him instead of a shape.

function SatelliteShapes() {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = state.clock.elapsedTime * 0.05;
  });
  return (
    <group ref={group}>
      <Float speed={2} rotationIntensity={1} floatIntensity={2} position={[2.6, 1.1, -0.6]}>
        <Icosahedron args={[0.22, 0]}>
          <meshStandardMaterial color="#f6f0e6" roughness={0.3} metalness={0.4} wireframe />
        </Icosahedron>
      </Float>
      <Float speed={1.6} rotationIntensity={1.2} floatIntensity={1.6} position={[-2.4, -0.8, 0.4]}>
        <Icosahedron args={[0.16, 0]}>
          <meshStandardMaterial color="#ffe58f" roughness={0.2} metalness={0.5} />
        </Icosahedron>
      </Float>
      <Float speed={1.2} rotationIntensity={0.8} floatIntensity={1.4} position={[1.6, -1.4, 0.8]}>
        <Icosahedron args={[0.1, 0]}>
          <meshStandardMaterial color="#b8860b" roughness={0.4} />
        </Icosahedron>
      </Float>
    </group>
  );
}

function PointerRig() {
  const { camera, pointer } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    target.set(pointer.x * 0.6, pointer.y * 0.35, camera.position.z);
    camera.position.lerp(target, 0.04);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function HeroScene({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 6.4], fov: 40 }}
      frameloop={reducedMotion ? "demand" : "always"}
    >
      <ambientLight intensity={0.3} />
      {/* Key light — warm, strong, defines the lit face */}
      <pointLight position={[4, 3, 4]} intensity={34} color="#ff8a52" />
      {/* Fill light — neutral, dim, keeps shadow side from going pure black
          without casting an off-brand color into it */}
      <pointLight position={[-4, -2, -2]} intensity={10} color="#3a3428" />
      {/* Rim light — from behind, creates a visible edge highlight so the
          sphere reads as a lit 3D volume rather than a flat gradient disc */}
      <pointLight position={[-2, 2, -5]} intensity={26} color="#f6f0e6" />
      <directionalLight position={[0, 4, 5]} intensity={0.35} color="#f6f0e6" />

      <group position={[1.1, -0.1, 0]}>
        {!reducedMotion && <SatelliteShapes />}
        <OrbitRing radius={1.85} speed={0.06} color="#ffe58f" tilt={1.15} />
        <OrbitRing radius={2.25} speed={-0.04} color="#f6f0e6" tilt={1.4} />
      </group>
      {!reducedMotion && <Sparkles count={60} scale={7} size={2} speed={0.25} color="#f6f0e6" opacity={0.35} />}
      {!reducedMotion && <PointerRig />}
    </Canvas>
  );
}
