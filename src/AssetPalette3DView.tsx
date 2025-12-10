import {useMemo} from "react";
import {Center, OrbitControls, PerspectiveCamera, View} from "@react-three/drei";
import type {AssetConfig} from "./types.tsx";
import {GltfMaterial} from "./GltfMaterial.tsx";

export const AssetPalette3DView = ({ item, trackRef }: { item: AssetConfig, trackRef: HTMLDivElement }) => {
  //
  const stableTrackRef = useMemo(() => ({ current: trackRef }), [trackRef]);

  const maxDim = Math.max(...item.dimension);
  const scaleFactor = 2.5 / maxDim;

  const commonScale = [scaleFactor, scaleFactor, scaleFactor] as [number, number, number];

  return (
    <View track={stableTrackRef as any}>
      <ambientLight intensity={2} />
      <pointLight position={[10, 10, 10]} intensity={2} />
      <PerspectiveCamera makeDefault position={[4, 4, 4]} fov={50} />

      <group position={[0, 0.8, 0]}>
        <Center>
          {item.url ? (
            <group scale={commonScale}>
              <GltfMaterial url={item.url} dimension={item.dimension} />
            </group>
          ) : (
            <mesh scale={commonScale}>
              <boxGeometry args={[item.dimension[0], item.dimension[1], item.dimension[2]]} />
              <meshStandardMaterial color={item.color} />
            </mesh>
          )}
        </Center>
      </group>

      <OrbitControls autoRotate autoRotateSpeed={4} enableZoom={false} />
    </View>
  );
};