import {type Dispatch, type SetStateAction} from 'react';
import type {AssetConfig, AssetInstance} from "./types.tsx";
import {Vector3} from "three";

interface Props {
  assets: AssetConfig[];
  setPendingAsset: Dispatch<SetStateAction<AssetInstance | null>>;
}

export const AssetPalette = ({ assets, setPendingAsset }: Props) => {
  //
  const handleClickAsset = (item: AssetConfig) => {
    const selectedAsset: AssetInstance = {
      id: null,
      config: item,
      position: new Vector3(0, 0, 0),
      rotation: new Vector3(0, 0, 0)
    };
    setPendingAsset(selectedAsset);
  };

  return (
    <div className="sidebar-area" style={{
      position: 'absolute', bottom: 0, left: 0, width: '100%',
      background: 'white', zIndex: 10, borderTop: '1px solid #ddd'
    }}>
      <div style={{ display: 'flex', gap: '15px', padding: '10px', overflowX: 'auto' }}>

        { assets.map((item) => (
          <div
            key={item.label}
            onPointerDown={() => handleClickAsset(item)}
            style={{
              width: '80px', height: '80px', flexShrink: 0,
              border: '1px solid #eee', borderRadius: '8px', cursor: 'grab',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: '#f9f9f9'
            }}
          >
            { item.image ? (
              <img
                src={`./thumbnails/${item.image}.png`}
                alt={item.label}
                style={{ width: '60px', height: '60px', objectFit: 'contain' }}
              />
            ) : (
              <div style={{ width: '50px', height: '50px', background: item.color, borderRadius: '4px' }} />
            ) }

            <span style={{ fontSize: '10px', marginTop: '4px', color: '#666', fontWeight: 'bold' }}>
              {item.label}
            </span>
          </div>
        )) }
      </div>
    </div>
  );
};