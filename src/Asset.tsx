import {Box3, Mesh, Vector3} from "three";
import {useRef} from "react";
import {PivotControls} from "@react-three/drei";
import {type ThreeEvent, useThree} from "@react-three/fiber";
import {OBB} from "three-stdlib";
import {type AssetConfig, ColliderTag} from "./types.tsx";

interface Props {
  id: string;
  config: AssetConfig;
  position: Vector3;
  rotation: Vector3;
  isSelected: boolean;
  onSelect: (e: ThreeEvent<MouseEvent>) => void;
  onTransformEnd: (id: string, position: Vector3, rotation: Vector3) => void;
}

export const Asset = ({ id, config, position, rotation, isSelected, onSelect, onTransformEnd }: Props) => {
  //
  const { scene } = useThree();
  const [width, height, depth] = config.dimension;
  const meshRef = useRef<Mesh>(null!);
  const lastValidPosition = useRef(position.clone());

  const ROOM_SIZE = 10;
  const WALL_LIMIT = ROOM_SIZE / 2;// 그 물체의 원래 색상

  const getPreciseOBB = (mesh: Mesh) => {
    if (!mesh.geometry.boundingBox) {
      mesh.geometry.computeBoundingBox();
    }

    // 원래 박스 가져오기 (회전되지 않은 순수 크기)
    const localBox = mesh.geometry.boundingBox!.clone();
    localBox.min.y = -100;
    localBox.max.y = 100;

    // OBB 생성
    const obb = new OBB();
    obb.fromBox3(localBox);

    // 메쉬의 상태(위치, 회전, 스케일)을 OBB에 그대로 적용
    mesh.updateMatrixWorld();
    obb.applyMatrix4(mesh.matrixWorld);
    obb.halfSize.addScalar(-0.01);

    return obb
  };

  const handleDrag = () => {
    if (!meshRef.current) return;

    meshRef.current.updateMatrixWorld();

    const myOBB = getPreciseOBB(meshRef.current);

    let isBlocked = false;
    let targetY = height / 2;

    const colliders: any[] = [];
    scene.traverse((obj) => {
      if (obj !== meshRef.current) {
        if (obj.userData?.tag === ColliderTag.WALL || (obj.userData?.tag === ColliderTag.ASSET && obj.userData.id !== id)) {
          colliders.push(obj);
        }
      }
    });

    for (const other of colliders) {
      const otherOBB = getPreciseOBB(other);

      if (myOBB.intersectsOBB(otherOBB)) {
        const tag = other.userData.tag;

        if (tag === ColliderTag.WALL) {
          isBlocked = true;
          break;
        }
        else if (tag === ColliderTag.ASSET) {
          const otherGeoBox = other.geometry.boundingBox!;
          const otherW = otherGeoBox.max.x - otherGeoBox.min.x;
          const otherD = otherGeoBox.max.z - otherGeoBox.min.z;

          const isBigger = otherW >= width - 0.1 && otherD >= depth - 0.1;

          if (isBigger) {
            const box3 = new Box3().setFromObject(other);
            const stackY = box3.max.y + (height / 2);
            targetY = Math.max(targetY, stackY);
          } else {
            isBlocked = true;
            break;
          }
        }
      }
    }

    if (isBlocked) {
      meshRef.current.position.copy(lastValidPosition.current);
      meshRef.current.updateMatrix();
    } else {
      meshRef.current.position.y = targetY;
      meshRef.current.updateMatrix();
      lastValidPosition.current.copy(meshRef.current.position);
    }
  };

  const handleDragEnd = () => {
    if (!meshRef.current) return;
    const pos = meshRef.current.position;
    const rot = meshRef.current.rotation;

    onTransformEnd(
      id,
      new Vector3(pos.x, pos.y, pos.z),
      new Vector3(rot.x, rot.y, rot.z)
    );
  };

  return (
    <>
      <PivotControls
        anchor={[0, 0, 0]}
        scale={2}
        depthTest={false}
        activeAxes={isSelected ? [true, false, true] : [false, false, false]}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        opacity={isSelected ? 1 : 0}
      >
        <mesh
          ref={meshRef}
          position={position}
          rotation={[rotation.x, rotation.y, rotation.z]}
          castShadow={true}
          receiveShadow={true}
          onClick={onSelect}
          userData={{ tag: ColliderTag.ASSET, id: id }}
        >
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial
            color={config.color}
            emissive={isSelected ? '#444' : 'black'}
          />
        </mesh>
      </PivotControls>
    </>
  );
};