import { Html } from "@react-three/drei";
import React, { useState } from "react";
import { Vector3 } from "three";

interface Props {
  position: [number, number, number] | Vector3;
  onClick: () => void;
}

export const DeleteButton = ({ position, onClick }: Props) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <Html position={position} zIndexRange={[100, 0]} center>
      <div
        onClick={handleClick}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        style={{
          width: '24px',
          height: '24px',
          backgroundColor: isHovered ? '#ff7875' : '#ff4d4f',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          color: 'white',
          fontWeight: 'bold',
          fontFamily: 'sans-serif',
          fontSize: '14px',
          transition: 'background-color 0.2s ease',
          pointerEvents: 'auto',
          transform: 'translate(50%, -50%)'
        }}
      >
        ✕
      </div>
    </Html>
  );
};