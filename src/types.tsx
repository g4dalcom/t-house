import {Vector3} from "three";

export type AssetConfig = {
  label: string;
  dimension: number[];
  color: string;
  url?: string;
}

export type AssetInstance = {
  id: string;
  config: AssetConfig;
  position: Vector3;
  rotation: Vector3;
}

export const ColliderTag = {
  WALL: 0,
  FLOOR: 1,
  ASSET: 2,
} as const;