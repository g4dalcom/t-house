import {useState, type Dispatch, type SetStateAction} from 'react';
import {Canvas} from '@react-three/fiber';
import {AssetPalette3DView} from "./AssetPalette3DView.tsx";
import type {AssetConfig, AssetInstance} from "./types.tsx";
import {Vector3} from "three";

interface Props {
  assets: AssetConfig[];
  setPendingAsset: Dispatch<SetStateAction<AssetInstance | null>>;
}

export const AssetPalette = ({ assets, setPendingAsset }: Props) => {
  //
  const [refs, setRefs] = useState<Record<string, HTMLDivElement | null>>({});

  const handleClickAsset = (item: AssetConfig) => {
    const selectedAsset: AssetInstance = {
      id: null,
      config: item,
      position: new Vector3(0, 0, 0),
      rotation: new Vector3(0, 0, 0)
    };
    setPendingAsset(selectedAsset);
  }

  return (
    <div className="sidebar-area" style={{ position: 'relative' }}>
      <div
        style={{
          display: 'flex',
          gap: '15px',
          height: '100%',
          alignItems: 'center',
          padding: '0 10px',
          position: 'relative',
          zIndex: 10
        }}
      >
        { assets.map((item) => (
          <div
            key={item.label}
            ref={(el) => {
              if (el && refs[item.label] !== el) {
                setRefs((prev) => ({ ...prev, [item.label]: el }));
              }
            }}
            onPointerDown={() => handleClickAsset(item)}
            style={{
              height: '80px',
              aspectRatio: '1/1',
              border: '1px solid #ddd',
              borderRadius: '12px',
              backgroundColor: 'transparent',
              cursor: 'grab',
              position: 'relative',
              flexShrink: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
              paddingBottom: '5px'
            }}
          >
            <span style={{
              fontSize: '10px', fontWeight: 'bold', color: '#555',
              pointerEvents: 'none', textShadow: '0 0 2px white'
            }}>
              {item.label}
            </span>
          </div>
        )) }
      </div>

      <Canvas
        className="canvas"
        eventSource={document.getElementById('root') || undefined}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0
        }}
      >

        { assets.map((item) => {
          const trackRef = refs[item.label];
          if (!trackRef) return null;

          return (
            <AssetPalette3DView
              key={item.label}
              item={item}
              trackRef={trackRef}
            />
          );
        }) }
      </Canvas>
    </div>
  );
};