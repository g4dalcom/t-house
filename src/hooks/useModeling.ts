import {type Group, type Mesh, type MeshStandardMaterial, Scene} from "three";
import {useEffect} from "react";

interface Props {
  scene: Group | Scene;
  wireframe?: boolean;                      // 1. 뼈대 보기 (기본값 false)
  shadows?: boolean;                        // 2. 그림자 켜기 (기본값 true)
  envMapIntensity?: number;                 // 3. 반사광 강도 (기본값 1)
  customColors?: Record<string, string>;    // 4. 부품별 색상 { "부품명": "색상" }
}

export const useModeling = (props: Props) => {
  //
  const { scene, wireframe = false, shadows = true, envMapIntensity = 1, customColors = {} } = props;

  useEffect(() => {
    if (!scene) return;

    const componentNames: string[] = []
    scene.traverse((child) => {
      if ((child as Mesh).isMesh) {
        componentNames.push(child.name);
        const mesh = child as Mesh;

        if (shadows) {
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }

        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

        materials.forEach((mat) => {
          if ((mat as MeshStandardMaterial).isMeshStandardMaterial) {
            const standardMat = mat as MeshStandardMaterial;

            standardMat.wireframe = wireframe;
            standardMat.envMapIntensity = envMapIntensity;

            if (customColors[mesh.name]) {
              standardMat.color.set(customColors[mesh.name]);
            }
          }
        });
      }
    });

    console.log("부품 리스트: ", componentNames);
  }, [scene, wireframe, shadows, envMapIntensity, customColors]);
}