import {DoubleSide, Vector3} from "three";
import {memo} from "react";
import {Asset} from "./Asset.tsx";
import {type AssetInstance, ColliderTag} from "./types.tsx";

interface Props {
  placedAssets: AssetInstance[];
  selectedId: string | null;
  onSelectObj: (id: string | null) => void;
  onUpdateObj: (id: string, position: Vector3, rotation: Vector3) => void;
  handleDeleteAsset: (id: string) => void;
}

export const Room = memo(({ placedAssets, selectedId, onSelectObj, onUpdateObj, handleDeleteAsset }: Props) => {
  //
  const ROOM_SIZE = 10;
  const WALL_HEIGHT = 4;

  return (
    <group>
      {/* 바닥 */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow={true}
        userData={{ tag: ColliderTag.FLOOR }}
      >
        <planeGeometry args={[ROOM_SIZE, ROOM_SIZE]} />
        <meshStandardMaterial color="#eeeeee" />
      </mesh>
      <gridHelper args={[ROOM_SIZE, ROOM_SIZE, 0xdddddd, 0xdddddd]} position={[0, 0.01, 0]} />

      {/* 벽 */}
      <mesh
        position={[0, WALL_HEIGHT / 2, -ROOM_SIZE / 2]}
        receiveShadow={true}
        userData={{ tag: ColliderTag.WALL }}
      >
        <planeGeometry args={[ROOM_SIZE, WALL_HEIGHT]} />
        <meshStandardMaterial color="#f5f5f5" side={DoubleSide} />
      </mesh>
      <mesh
        rotation={[0, Math.PI / 2, 0]}
        position={[-ROOM_SIZE / 2, WALL_HEIGHT / 2, 0]}
        receiveShadow={true}
        userData={{ tag: ColliderTag.WALL }}
      >
        <planeGeometry args={[ROOM_SIZE, WALL_HEIGHT]} />
        <meshStandardMaterial color="#f5f5f5" side={DoubleSide} />
      </mesh>

      {/* === 배치된 물체들 === */}
      { placedAssets.map((obj) => (
        <Asset
          key={obj.id}
          id={obj.id!}
          config={obj.config}
          position={obj.position}
          rotation={obj.rotation}
          isSelected={obj.id === selectedId}
          isEditMode={!!selectedId}
          onSelect={(e) => {
            e.stopPropagation();
            onSelectObj(obj.id);
          }}
          onTransformEnd={onUpdateObj}
          onDelete={handleDeleteAsset}
        />
      )) }
    </group>
  );
});