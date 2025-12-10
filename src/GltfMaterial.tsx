import {Center, useGLTF} from "@react-three/drei";
import {Box3, type Group, type Mesh, Vector3} from "three";
import {useMemo, useRef} from "react";

interface Props {
  url: string;
  dimension: number[];
}

export const GltfMaterial = ({ url, dimension }: Props) => {
  //
  const { scene } = useGLTF(url);
  const groupRef = useRef<Group>(null);

  const { clone, scale } = useMemo(() => {

    const cloneScene = scene.clone();

    cloneScene.traverse((obj) => {
      if ((obj as Mesh).isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    const box = new Box3().setFromObject(cloneScene);
    const size = new Vector3();
    box.getSize(size);

    const [targetW, targetH, targetD] = dimension;

    const scaleX = size.x ? targetW / size.x : 1;
    const scaleY = size.y ? targetH / size.y : 1;
    const scaleZ = size.z ? targetD / size.z : 1;

    return {
      clone: cloneScene,
      scale: [scaleX, scaleY, scaleZ] as [number, number, number]
    };
  }, [dimension, scene]);

  return (
    <group ref={groupRef}>
      <Center>
        <primitive
          object={clone}
          scale={scale}
        />
      </Center>
    </group>
  );
}