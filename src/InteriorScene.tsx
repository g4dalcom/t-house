import {Canvas} from "@react-three/fiber";
import {Room} from "./Room.tsx";
import {OrbitControls} from "@react-three/drei";
import {AssetPalette} from "./AssetPalette.tsx";
import {useEffect, useState} from "react";
import {Vector3} from "three";
import { v4 as uuidv4 } from 'uuid';
import type {AssetConfig, AssetInstance} from "./types.tsx";

export const InteriorScene = () => {
  //
  const assets: AssetConfig[] = [
    { label: 'Desk', dimension: [3, 2, 4], color: '#187cb6', url: '/desk.glb' },
    { label: 'Monitor', dimension: [2, 2, 2], color: '#228c27' },
    { label: 'Closet', dimension: [2, 4, 2], color: '#bd4685' },
  ]

  const [placedAssets, setPlacedAssets] = useState<AssetInstance[]>([]);
  const [pendingAsset, setPendingAsset] = useState<AssetConfig | null>(null);
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

  const handlePlace = (position: Vector3) => {
    if (pendingAsset) {
      setPlacedAssets(prev => [
        ...prev,
        {
          id: uuidv4(),
          config: pendingAsset,
          position,
          rotation: new Vector3(0, 0, 0)
        }
      ]);
      setPendingAsset(null);
    }
  };

  const handleUpdateTransform = (id: string, position: Vector3, rotation: Vector3) => {
    setPlacedAssets(prev => prev.map(obj =>
      obj.id === id ? { ...obj, position, rotation } : obj
    ));
  };

  return (
    <div className="mobile-app">
      <div className="canvas-area">
        <Canvas
          shadows
          camera={{ position: [22, 22, 22], fov: 30 }}
          onPointerMissed={() => {
            setPendingAsset(null);
            setSelectedId(null);
          }}
        >
          <color attach="background" args={['#202020']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 10, 5]} intensity={1} castShadow={true} />

          <Room
            pendingAsset={pendingAsset}
            placedAssets={placedAssets}
            selectedId={selectedId}
            onPlace={handlePlace}
            onSelectObj={setSelectedId}
            onUpdateObj={handleUpdateTransform}
          />

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
        onClickAsset={setPendingAsset}
      />
    </div>
  );
}