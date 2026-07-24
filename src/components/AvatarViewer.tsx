'use client';

import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Bounds, OrbitControls } from '@react-three/drei';
import type { Group } from 'three';
import type { ClosetItem } from '@/lib/supabase';
import GarmentModel from './GarmentModel';
import ErrorBoundary from './ErrorBoundary';

type AvatarGender = 'male' | 'female';

interface AvatarViewerProps {
  items: ClosetItem[];
  /** Bump this number to play a one-off spin animation (e.g. on outfit generate). */
  spinTrigger?: number;
  gender: AvatarGender;
}

interface SlotConfig {
  category: ClosetItem['category'];
  position: [number, number, number];
  scale: number;
}

const SLOTS: SlotConfig[] = [
  { category: 'top', position: [0, 1.9, 0], scale: 1 },
  { category: 'outerwear', position: [0, 1.85, 0.02], scale: 1.05 },
  { category: 'bottom', position: [0, 0.95, 0], scale: 1 },
  { category: 'footwear', position: [0, 0.35, 0.05], scale: 1 },
];

const SPIN_DURATION_MS = 700;

function hasRealModel(item: ClosetItem | undefined): item is ClosetItem {
  return Boolean(item?.model_url && item.model_url.trim().length > 0);
}

/** Colored-box placeholder used until real garment meshes exist for a slot. */
function PrimitiveGarment({ item, category }: { item?: ClosetItem; category: ClosetItem['category'] }) {
  const color = item?.color ?? '#999999';

  if (category === 'top') {
    return (
      <mesh position={[0, 1.9, 0]}>
        <boxGeometry args={[0.7, 0.9, 0.35]} />
        <meshStandardMaterial color={color} />
      </mesh>
    );
  }
  if (category === 'outerwear') {
    return (
      <mesh position={[0, 1.85, 0.02]}>
        <boxGeometry args={[0.82, 1.05, 0.4]} />
        <meshStandardMaterial color={color} transparent opacity={0.92} />
      </mesh>
    );
  }
  if (category === 'bottom') {
    return (
      <group>
        <mesh position={[-0.18, 0.95, 0]}>
          <boxGeometry args={[0.28, 1, 0.3]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0.18, 0.95, 0]}>
          <boxGeometry args={[0.28, 1, 0.3]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
    );
  }
  // footwear
  return (
    <group>
      <mesh position={[-0.18, 0.35, 0.05]}>
        <boxGeometry args={[0.3, 0.2, 0.42]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.18, 0.35, 0.05]}>
        <boxGeometry args={[0.3, 0.2, 0.42]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

/**
 * Renders one garment slot: attempts to load a real .glb from the item's
 * model_url, falling back to a colored primitive if no model_url is set
 * or the asset fails to load (e.g. placeholder paths with nothing
 * uploaded to Supabase Storage yet). Once real assets exist in the
 * `garments` storage bucket, this automatically switches from boxes to
 * real meshes with no code changes.
 */
function GarmentSlot({ item, slot }: { item?: ClosetItem; slot: SlotConfig }) {
  const fallback = <PrimitiveGarment item={item} category={slot.category} />;

  if (!hasRealModel(item)) return fallback;

  return (
    <ErrorBoundary key={item.model_url} fallback={fallback}>
      <Suspense fallback={fallback}>
        <GarmentModel url={item.model_url} position={slot.position} scale={slot.scale} />
      </Suspense>
    </ErrorBoundary>
  );
}

const SKIN_TONES: Record<AvatarGender, string> = {
  female: '#E8B892',
  male: '#D9A876',
};

const HAIR_COLOR = '#3B2A20';

/**
 * A proportioned humanoid figure built from capsules/spheres — head, neck,
 * torso, hips, arms, legs — instead of a single floating sphere. Body width
 * (shoulders/hips) and hair silhouette differ slightly by gender. Garment
 * boxes (see PrimitiveGarment) layer on top of this and cover most of the
 * torso/legs/feet, so skin only really shows at the head, neck, and arms.
 */
function HumanBody({ gender }: { gender: AvatarGender }) {
  const skin = SKIN_TONES[gender];
  const shoulderWidth = gender === 'male' ? 0.42 : 0.36;
  const hipWidth = gender === 'male' ? 0.32 : 0.38;
  const armOffset = shoulderWidth + 0.08;

  return (
    <group>
      {/* head */}
      <mesh position={[0, 2.55, 0]}>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshStandardMaterial color={skin} />
      </mesh>

      {/* hair */}
      {gender === 'female' ? (
        <mesh position={[0, 2.42, -0.02]}>
          <capsuleGeometry args={[0.3, 0.55, 4, 12]} />
          <meshStandardMaterial color={HAIR_COLOR} />
        </mesh>
      ) : (
        <mesh position={[0, 2.62, 0]}>
          <sphereGeometry args={[0.3, 24, 24, 0, Math.PI * 2, 0, Math.PI / 1.8]} />
          <meshStandardMaterial color={HAIR_COLOR} />
        </mesh>
      )}

      {/* neck */}
      <mesh position={[0, 2.32, 0]}>
        <cylinderGeometry args={[0.09, 0.1, 0.18, 12]} />
        <meshStandardMaterial color={skin} />
      </mesh>

      {/* torso: tapers from shoulders to hips so male/female silhouettes read differently */}
      <mesh position={[0, 1.9, 0]} scale={[shoulderWidth / 0.36, 1, 0.5]}>
        <capsuleGeometry args={[0.34, 0.55, 4, 12]} />
        <meshStandardMaterial color={skin} />
      </mesh>

      {/* hips */}
      <mesh position={[0, 1.5, 0]} scale={[hipWidth / 0.32, 0.7, 0.55]}>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshStandardMaterial color={skin} />
      </mesh>

      {/* arms */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * armOffset, 2.0, 0]} rotation={[0, 0, side * 0.08]}>
            <capsuleGeometry args={[0.075, 0.55, 4, 8]} />
            <meshStandardMaterial color={skin} />
          </mesh>
          <mesh position={[side * (armOffset + 0.02), 1.5, 0]}>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshStandardMaterial color={skin} />
          </mesh>
        </group>
      ))}

      {/* legs */}
      {[-0.15, 0.15].map((side) => (
        <mesh key={side} position={[side, 0.9, 0]}>
          <capsuleGeometry args={[0.13, 0.75, 4, 8]} />
          <meshStandardMaterial color={skin} />
        </mesh>
      ))}
    </group>
  );
}

function AvatarBody({
  items,
  spinTrigger = 0,
  gender,
}: {
  items: ClosetItem[];
  spinTrigger?: number;
  gender: AvatarGender;
}) {
  const find = (category: ClosetItem['category']) =>
    items.find((item) => item.category === category);

  const groupRef = useRef<Group>(null);
  const spinStartMs = useRef<number | null>(null);
  const prevTrigger = useRef(spinTrigger);

  useEffect(() => {
    if (spinTrigger !== prevTrigger.current) {
      prevTrigger.current = spinTrigger;
      spinStartMs.current = performance.now();
    }
  }, [spinTrigger]);

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;

    // idle breathing
    const breathe = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.015;
    group.scale.set(breathe, breathe, breathe);

    // one-off spin on generate
    if (spinStartMs.current !== null) {
      const elapsed = performance.now() - spinStartMs.current;
      if (elapsed < SPIN_DURATION_MS) {
        group.rotation.y = (elapsed / SPIN_DURATION_MS) * Math.PI * 2;
      } else {
        group.rotation.y = 0;
        spinStartMs.current = null;
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      <HumanBody gender={gender} />

      {SLOTS.map((slot) => (
        <GarmentSlot key={slot.category} item={find(slot.category)} slot={slot} />
      ))}
    </group>
  );
}

const CANVAS_FALLBACK = (
  <div className="w-full h-full flex items-center justify-center text-sm text-neutral-400 bg-neutral-50">
    3D preview unavailable
  </div>
);

export default function AvatarViewer({ items, spinTrigger, gender }: AvatarViewerProps) {
  return (
    <div className="w-full h-full">
      <ErrorBoundary fallback={CANVAS_FALLBACK}>
        <Canvas camera={{ position: [0, 1, 4], fov: 40 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[3, 5, 2]} intensity={1.2} />
            <directionalLight position={[-3, 2, -2]} intensity={0.4} />
            {/* Bounds auto-fits the camera to the avatar's real bounding
                box (head to feet) so the whole body — legs included —
                stays in frame no matter the canvas's aspect ratio, and
                re-fits automatically when the outfit changes. No external
                HDR/environment map is loaded here on purpose: that CDN
                fetch is a needless failure point in production. */}
            <Bounds fit clip observe margin={1.3}>
              <AvatarBody items={items} spinTrigger={spinTrigger} gender={gender} />
            </Bounds>
            <OrbitControls makeDefault enablePan={false} minDistance={1.5} maxDistance={10} />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  );
}
