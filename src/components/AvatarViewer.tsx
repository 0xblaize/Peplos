'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import type { ClosetItem } from '@/lib/supabase';

interface AvatarViewerProps {
  items: ClosetItem[];
}

// Placeholder avatar built from primitives, colored per selected garment.
// Once real .glb assets exist in the Supabase Storage bucket, swap each
// <mesh> below for `useGLTF(item.model_url).scene` and drop it onto the
// avatar's skeleton instead of positioning boxes by hand.
function AvatarBody({ items }: { items: ClosetItem[] }) {
  const find = (category: ClosetItem['category']) =>
    items.find((item) => item.category === category);

  const top = find('top');
  const bottom = find('bottom');
  const outerwear = find('outerwear');
  const footwear = find('footwear');

  return (
    <group position={[0, -1, 0]}>
      {/* head */}
      <mesh position={[0, 2.55, 0]}>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshStandardMaterial color="#E8B892" />
      </mesh>

      {/* torso / top */}
      <mesh position={[0, 1.9, 0]}>
        <boxGeometry args={[0.7, 0.9, 0.35]} />
        <meshStandardMaterial color={top?.color ?? '#CCCCCC'} />
      </mesh>

      {/* outerwear shell, slightly larger than torso */}
      {outerwear && (
        <mesh position={[0, 1.85, 0.02]}>
          <boxGeometry args={[0.82, 1.05, 0.4]} />
          <meshStandardMaterial color={outerwear.color} transparent opacity={0.92} />
        </mesh>
      )}

      {/* legs / bottom */}
      <mesh position={[-0.18, 0.95, 0]}>
        <boxGeometry args={[0.28, 1, 0.3]} />
        <meshStandardMaterial color={bottom?.color ?? '#999999'} />
      </mesh>
      <mesh position={[0.18, 0.95, 0]}>
        <boxGeometry args={[0.28, 1, 0.3]} />
        <meshStandardMaterial color={bottom?.color ?? '#999999'} />
      </mesh>

      {/* feet / footwear */}
      <mesh position={[-0.18, 0.35, 0.05]}>
        <boxGeometry args={[0.3, 0.2, 0.42]} />
        <meshStandardMaterial color={footwear?.color ?? '#333333'} />
      </mesh>
      <mesh position={[0.18, 0.35, 0.05]}>
        <boxGeometry args={[0.3, 0.2, 0.42]} />
        <meshStandardMaterial color={footwear?.color ?? '#333333'} />
      </mesh>
    </group>
  );
}

export default function AvatarViewer({ items }: AvatarViewerProps) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0.6, 4], fov: 40 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 5, 2]} intensity={1.2} />
          <AvatarBody items={items} />
          <Environment preset="city" />
          <OrbitControls
            enablePan={false}
            minDistance={2.5}
            maxDistance={6}
            target={[0, 0.8, 0]}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
