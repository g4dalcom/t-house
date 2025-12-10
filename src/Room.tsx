import {DoubleSide, Vector3} from "three";
import {useState} from "react";
import {Asset} from "./Asset.tsx";
import {type AssetConfig, ColliderTag, type PlacedAsset} from "./types.tsx";

interface Props {
  placingItem: AssetConfig | null;
  placedObjects: PlacedAsset[];
  selectedId: string | null;
  onPlace: (position: Vector3) => void;
  onSelectObj: (id: string | null) => void;
  onUpdateObj: (id: string, position: Vector3, rotation: Vector3) => void;
}

export const Room = ({ placingItem, placedObjects, selectedId, onPlace, onSelectObj, onUpdateObj }: Props) => {
  //
  const ROOM_SIZE = 10;
  const WALL_HEIGHT = 4;

  const [ghostPos, setGhostPos] = useState<Vector3 | null>(null);

  // 마우스 이동 (배치 모드일 때만 좌표 계산)
  const handlePointerMove = (e: any) => {
    if (!placingItem) return;

    const [width, height, depth] = placingItem.dimension;
    const { x, z } = e.point;
    const y = height / 2;

    // 벽 뚫기 방지 (Clamp)
    const limitX = (ROOM_SIZE / 2) - (width / 2);
    const limitZ = (ROOM_SIZE / 2) - (depth / 2);
    const clampedX = Math.max(-limitX, Math.min(limitX, x));
    const clampedZ = Math.max(-limitZ, Math.min(limitZ, z));

    setGhostPos(new Vector3(clampedX, y, clampedZ));
  };

  // 바닥 클릭
  const handlePointerUp = (e: any) => {
    // A. 배치 모드: 설치 확정
    if (placingItem && ghostPos) {
      e.stopPropagation();
      onPlace(ghostPos);
    }
    // B. 일반 모드: 빈 바닥을 찍었으므로 선택 해제 (기즈모 끄기)
    else {
      onSelectObj(null);
    }
  };

  return (
    <group>
      {/* 바닥 */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow={true}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
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
      {placedObjects.map((obj) => (
        <Asset
          key={obj.id}
          id={obj.id}
          config={obj.config}
          position={obj.position}
          rotation={obj.rotation}
          isSelected={obj.id === selectedId}
          onSelect={(e) => {
            e.stopPropagation();
            onSelectObj(obj.id);
          }}
          onTransformEnd={onUpdateObj}
        />
      ))}

      {/* === 배치 중인 물체 === */}
      {placingItem && ghostPos && (
        <group position={ghostPos}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[placingItem.dimension[0], placingItem.dimension[1], placingItem.dimension[2]]} />
            <meshStandardMaterial color={placingItem.color} transparent={true} opacity={0.6} />
          </mesh>
        </group>
      )}
    </group>
  );
};