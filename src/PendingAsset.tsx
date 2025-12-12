import {type AssetConfig, type AssetInstance, ColliderTag} from "./types.tsx";
import {type Mesh, Vector3} from "three";
import {GltfMaterial} from "./GltfMaterial.tsx";
import {type ThreeEvent, useFrame, useThree} from "@react-three/fiber";
import {useRef} from "react";

interface Props {
  pendingAsset: AssetInstance;
  onPlace: (position: Vector3, config: AssetConfig) => void;
}

export const PendingAsset = ({ pendingAsset, onPlace }: Props) => {
  //
  const meshRef = useRef<Mesh>(null!);
  const { raycaster, pointer, camera, scene } = useThree();

  const ROOM_SIZE = 10;

  useFrame(() => {
    if (!meshRef.current) return;

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);
    const hit = intersects.find((i) => {
      const tag = i.object.userData?.tag;
      return tag === ColliderTag.FLOOR || tag === ColliderTag.WALL;
    });

    if (hit) {
      const [width, height, depth] = pendingAsset.config.dimension;

      let { x, z } = hit.point;

      // 방의 반경에서 물체 반경(width/2)을 뺀 만큼만 이동 가능
      const limitX = (ROOM_SIZE / 2) - (width / 2);
      const limitZ = (ROOM_SIZE / 2) - (depth / 2);

      x = Math.max(-limitX, Math.min(limitX, x));
      z = Math.max(-limitZ, Math.min(limitZ, z));

      const y = height / 2;

      meshRef.current.position.set(x, y, z);
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onPlace(meshRef.current.position.clone(), pendingAsset.config);
  };

  return (
    <group>
      <mesh ref={meshRef} onClick={handleClick} name="GhostAsset">
        {/* Collider */}
        <boxGeometry args={[pendingAsset.config.dimension[0], pendingAsset.config.dimension[1], pendingAsset.config.dimension[2]]} />
        <meshBasicMaterial
          transparent={true}
          opacity={0.5}
          color={pendingAsset.config.color}
          visible={!pendingAsset.config.image}
        />

        {/* Model */}
        {pendingAsset.config.image && (
          <group>
            <GltfMaterial url={pendingAsset.config.image} dimension={pendingAsset.config.dimension} />
          </group>
        )}
      </mesh>
    </group>
  );
}