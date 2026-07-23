'use client';

import { useGLTF } from '@react-three/drei';

interface GarmentModelProps {
  url: string;
  position: [number, number, number];
  scale: number;
}

/**
 * Loads a real .glb/.gltf garment mesh. Throws (via suspense) while
 * pending and rethrows on a failed fetch (e.g. placeholder model_url with
 * no asset yet uploaded) — callers must wrap this in a Suspense +
 * ErrorBoundary pair and fall back to a primitive placeholder on error.
 */
export default function GarmentModel({ url, position, scale }: GarmentModelProps) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} position={position} scale={scale} />;
}
