import {Canvas} from "@react-three/fiber";
import {Room} from "./Room.tsx";
import {OrbitControls} from "@react-three/drei";
import {AssetPalette} from "./AssetPalette.tsx";
import {Suspense, useCallback, useEffect, useState} from "react";
import {Vector3} from "three";
import { v4 as uuidv4 } from 'uuid';
import type {AssetConfig, AssetInstance} from "./types.tsx";
import {PendingAsset} from "./PendingAsset.tsx";

export const InteriorScene = () => {
  //
  const assets: AssetConfig[] = [
    { label: 'Table', dimension: [2, 2, 3], color: '#9577c7', image: 'table' },
    { label: 'Clock', dimension: [1, 1, 0.5], color: '#228c27', image: 'clock' },
    { label: 'Shelves', dimension: [3, 4, 1], color: '#4cea92', image: 'shelves' },
    { label: 'Plant', dimension: [1, 1, 1], color: '#58bbce', image: 'plant' },
  ]

  const [placedAssets, setPlacedAssets] = useState<AssetInstance[]>([]);
  const [pendingAsset, setPendingAsset] = useState<AssetInstance | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPendingAsset(null);
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePlace = useCallback((position: Vector3, config: AssetConfig) => {
    const newAsset = { config, id: uuidv4(), position, rotation: new Vector3(0,0,0) };
    setPlacedAssets(prev => [...prev, newAsset]);
    setPendingAsset(null);
  }, []);

  const handlePointerMissed = useCallback(() => {
    setPendingAsset(null);
    setSelectedId(null);
  }, []);

  const handleUpdateTransform = useCallback((id: string, position: Vector3, rotation: Vector3) => {
    setPlacedAssets(prev => prev.map(obj =>
      obj.id === id ? { ...obj, position, rotation } : obj
    ));
  }, []);

  const handleDeleteAsset = useCallback((id: string) => {
    setPlacedAssets((prev) => prev.filter((asset) => asset.id !== id));
    setSelectedId(null);
  }, []);

  return (
    <div className="mobile-app" style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <div className="canvas-area" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
        <Canvas
          shadows
          camera={{ position: [22, 22, 22], fov: 30 }}
          onPointerMissed={handlePointerMissed}
        >
          <color attach="background" args={['#202020']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 10, 5]} intensity={1} castShadow={true} />

          <Room
            placedAssets={placedAssets}
            selectedId={selectedId}
            onSelectObj={setSelectedId}
            onUpdateObj={handleUpdateTransform}
            handleDeleteAsset={handleDeleteAsset}
          />

          {/* ==== 배치 중인 물체 ==== */}
          <Suspense fallback={null}>
            { pendingAsset && (
              <PendingAsset
                pendingAsset={pendingAsset}
                onPlace={handlePlace}
              />
            ) }
          </Suspense>

          <OrbitControls
            makeDefault
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2}
            enabled={!pendingAsset && !selectedId}
          />
        </Canvas>
      </div>

      <AssetPalette
        assets={assets}
        setPendingAsset={setPendingAsset}
      />
    </div>
  );
}