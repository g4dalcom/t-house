import {Box3, Mesh, Vector3} from "three";
import {useRef} from "react";
import {PivotControls} from "@react-three/drei";
import {type ThreeEvent, useThree} from "@react-three/fiber";
import {OBB} from "three-stdlib";
import {type AssetConfig, ColliderTag} from "./types.tsx";
import {GltfMaterial} from "./GltfMaterial.tsx";

interface Props {
  id: string;
  config: AssetConfig;
  position: Vector3;
  rotation: Vector3;
  isSelected: boolean;
  isEditMode: boolean;
  onSelect: (e: ThreeEvent<MouseEvent>) => void;
  onTransformEnd: (id: string, position: Vector3, rotation: Vector3) => void;
}

export const Asset = ({ id, config, position, rotation, isSelected, isEditMode, onSelect, onTransformEnd }: Props) => {
  //
  const { scene } = useThree();
  const [width, height, depth] = config.dimension;
  const meshRef = useRef<Mesh>(null!);

  const originalPos = useRef(position.clone());
  const originalRot = useRef(rotation.clone());
  const originalHex = useRef<number>(0);
  const isValidPosition = useRef(true);

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

  const getFootprintCorners = (mesh: Mesh) => {
    if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();

    const box = mesh.geometry.boundingBox!;

    // 박스의 아래쪽 면
    const corners: Vector3[] = [
      new Vector3(box.min.x, box.min.y, box.min.z), // 좌-앞
      new Vector3(box.min.x, box.min.y, box.max.z), // 좌-뒤
      new Vector3(box.max.x, box.min.y, box.min.z), // 우-앞
      new Vector3(box.max.x, box.min.y, box.max.z), // 우-뒤
    ];

    mesh.updateMatrixWorld();
    corners.forEach((corner) => corner.applyMatrix4(mesh.matrixWorld));

    return corners;
  };

  const handleDragStart = () => {
    if (!meshRef.current) return;

    originalPos.current.copy(meshRef.current.position);
    originalRot.current.copy(meshRef.current.rotation as any);

    if (!Array.isArray(meshRef.current.material)) {
      originalHex.current = (meshRef.current.material as any).color.getHex();
    }

    isValidPosition.current = true;
  };

  const handleDrag = () => {
    if (!meshRef.current) return;

    meshRef.current.updateMatrixWorld();
    const myOBB = getPreciseOBB(meshRef.current);

    let isCollision = false;
    let stackHeight = 0;
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
          isCollision = true;
        }
        else if (tag === ColliderTag.ASSET) {
          const otherGeoBox = other.geometry.boundingBox!;
          const otherW = otherGeoBox.max.x - otherGeoBox.min.x;
          const otherD = otherGeoBox.max.z - otherGeoBox.min.z;
          const isBigger = otherW >= width - 0.1 && otherD >= depth - 0.1;

          if (isBigger) {
            const box3 = new Box3().setFromObject(other);
            const stackY = box3.max.y + (height / 2);
            stackHeight = Math.max(stackHeight, stackY);

            const parentFootprint = getPreciseOBB(other);
            const myBottomCorners = getFootprintCorners(meshRef.current);

            const isFullyInside = myBottomCorners.every(point =>
              parentFootprint.containsPoint(point)
            );

            if (!isFullyInside) {
              isCollision = true;
            }

          } else {
            isCollision = true;
          }
        }
        break;
      }
    }

    if (stackHeight > 0) targetY = stackHeight;
    meshRef.current.position.y = targetY;
    meshRef.current.updateMatrix();

    const material = meshRef.current.material as any;

    if (isCollision) {
      isValidPosition.current = false;
      material.color.setHex(0xff0000);
      material.emissive.setHex(0x550000);
    } else {
      isValidPosition.current = true;
      material.color.setHex(originalHex.current);
      material.emissive.setHex(0x444444);

      // lastValidPosition.current.copy(meshRef.current.position);
    }
  };

  const handleDragEnd = () => {
    if (!meshRef.current) return;

    const material = meshRef.current.material as any;
    material.color.setHex(originalHex.current);

    if (isValidPosition.current) {
      const pos = meshRef.current.position;
      const rot = meshRef.current.rotation;
      onTransformEnd(id, pos.clone(), new Vector3(rot.x, rot.y, rot.z));
    } else {
      meshRef.current.position.copy(originalPos.current);
      meshRef.current.rotation.copy(originalRot.current as any);
      meshRef.current.updateMatrix();
    }
  };

  return (
    <>
      <PivotControls
        anchor={[0, 0, 0]}
        scale={2}
        depthTest={false}
        activeAxes={isSelected ? [true, false, true] : [false, false, false]}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        opacity={isSelected ? 1 : 0}
      >
        <mesh
          ref={meshRef}
          position={position}
          rotation={[rotation.x, rotation.y, rotation.z]}
          castShadow={!config.url}
          receiveShadow={!config.url}
          onClick={onSelect}
          userData={{ tag: ColliderTag.ASSET, id: id }}
        >
          <boxGeometry args={[width, height, depth]} />
          {config.url ? (
            <>
              <meshStandardMaterial
                transparent={!isEditMode}
                opacity={isEditMode ? 1 : 0}
                color={config.color}
                depthTest={!isEditMode}
                wireframe={isEditMode}
              />

              <GltfMaterial url={config.url} dimension={[width, height, depth]} />
            </>
          ) : (
            <meshStandardMaterial
              color={config.color}
              emissive={isSelected ? '#444' : 'black'}
              wireframe={isEditMode}
            />
          )}
        </mesh>
      </PivotControls>
    </>
  );
};