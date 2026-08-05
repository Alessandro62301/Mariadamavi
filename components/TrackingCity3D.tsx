"use client";

import { ContactShadows, Line, OrbitControls, RoundedBox } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const routePoints = [
  new THREE.Vector3(-7, .28, -3.1),
  new THREE.Vector3(-2.7, .28, .5),
  new THREE.Vector3(2.5, .28, -1.15),
  new THREE.Vector3(7, .28, 2.6),
];

const buildings = [
  [-7.1,-.5,1.2,2.8,1.2],[-5.4,-2.6,1.1,1.8,1.1],[-4.5,2.6,1.4,3.8,1.25],
  [-2.5,-2.7,1.3,2.4,1.2],[-1.2,2.8,1.1,4.4,1.1],[.8,-3,1.4,3.2,1.2],
  [1.4,2.5,1.4,2.1,1.35],[3.6,-2.8,1.1,3.7,1.1],[4.5,2.5,1.5,2.8,1.3],
  [6.5,-2.1,1.25,4.1,1.15],[7.2,.1,1.1,2.2,1.1],[-7,2.5,1.3,2.1,1.2],
] as const;

function Building({ data, accent }: { data: typeof buildings[number]; accent: boolean }) {
  const [x, z, width, height, depth] = data;
  const windows = Math.max(2, Math.floor(height));
  return (
    <group position={[x, height / 2, z]}>
      <RoundedBox args={[width, height, depth]} radius={.08} smoothness={3} castShadow receiveShadow>
        <meshStandardMaterial color={accent ? "#e987a6" : "#fff9f3"} roughness={.68} />
      </RoundedBox>
      {Array.from({ length: windows }).map((_, floor) => (
        <mesh key={floor} position={[0, height / 2 - .45 - floor * .68, depth / 2 + .008]}>
          <boxGeometry args={[width * .58, .18, .025]} />
          <meshStandardMaterial color={accent ? "#fff2f5" : "#efabc0"} roughness={.35} />
        </mesh>
      ))}
      <mesh position={[0, height / 2 + .07, 0]} castShadow>
        <boxGeometry args={[width * .72, .14, depth * .72]} />
        <meshStandardMaterial color={accent ? "#bd5e7d" : "#ead6d2"} />
      </mesh>
    </group>
  );
}

function Tree({ position }: { position: [number, number, number] }) {
  return <group position={position}>
    <mesh position={[0,.32,0]} castShadow><cylinderGeometry args={[.08,.1,.64,8]} /><meshStandardMaterial color="#8a6258" /></mesh>
    <mesh position={[0,.88,0]} castShadow><coneGeometry args={[.42,1.05,10]} /><meshStandardMaterial color="#90a985" roughness={.9} /></mesh>
  </group>;
}

function Package({ active }: { active: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.position.lerp(routePoints[active], 1 - Math.pow(.001, delta));
    ref.current.position.y = .72 + Math.sin(state.clock.elapsedTime * 2.6) * .12;
    ref.current.rotation.y += delta * .75;
  });
  return <group ref={ref} position={routePoints[active]}>
    <RoundedBox args={[.72,.72,.72]} radius={.12} smoothness={4} castShadow>
      <meshStandardMaterial color="#3b2033" roughness={.42} />
    </RoundedBox>
    <mesh position={[0,.05,.366]}><boxGeometry args={[.42,.09,.02]} /><meshBasicMaterial color="#f47fa4" /></mesh>
  </group>;
}

function City({ active, onSelect }: { active: number; onSelect: (index: number) => void }) {
  const roadMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: "#ddceca", roughness: .96 }), []);
  return <>
    <ambientLight intensity={1.5} />
    <directionalLight position={[-7,13,8]} intensity={2.7} color="#fff6ed" castShadow shadow-mapSize={[2048,2048]} />
    <directionalLight position={[9,6,-5]} intensity={1.2} color="#f7a9c1" />
    <RoundedBox args={[19,.6,12]} position={[0,-.42,0]} radius={.45} smoothness={5} receiveShadow>
      <meshStandardMaterial color="#f0e2dc" roughness={.92} />
    </RoundedBox>
    <mesh position={[0,-.08,0]} receiveShadow><boxGeometry args={[19,.08,1.15]} /><primitive object={roadMaterial} attach="material" /></mesh>
    <mesh position={[-3.5,-.07,0]} rotation={[0,Math.PI/2,0]} receiveShadow><boxGeometry args={[12,.08,1]} /><primitive object={roadMaterial} attach="material" /></mesh>
    <mesh position={[3.5,-.07,0]} rotation={[0,Math.PI/2,0]} receiveShadow><boxGeometry args={[12,.08,1]} /><primitive object={roadMaterial} attach="material" /></mesh>
    {buildings.map((data,index) => <Building key={index} data={data} accent={index % 5 === 0} />)}
    <Tree position={[-1.9,0,-1.7]} /><Tree position={[-1.1,0,-1.6]} /><Tree position={[2.2,0,2.3]} /><Tree position={[3,0,2.1]} /><Tree position={[5.6,0,.8]} />
    <Line points={routePoints} color="#3b2033" lineWidth={2.2} dashed dashSize={.28} gapSize={.18} />
    {routePoints.map((point,index) => <group key={index} position={point} onClick={(event) => { event.stopPropagation(); onSelect(index); }}>
      <mesh rotation={[Math.PI/2,0,0]} position={[0,.03,0]}><torusGeometry args={[index === active ? .44 : .3,.07,12,30]} /><meshStandardMaterial color={index === active ? "#f47fa4" : "#3b2033"} /></mesh>
      <mesh position={[0,.42,0]} castShadow><sphereGeometry args={[index === active ? .18 : .12,20,20]} /><meshStandardMaterial color={index === active ? "#f47fa4" : "#ffffff"} /></mesh>
    </group>)}
    <Package active={active} />
    <ContactShadows position={[0,-.08,0]} opacity={.3} scale={24} blur={2.8} far={12} color="#5c354b" />
    <OrbitControls makeDefault enablePan={false} enableZoom={false} minPolarAngle={.72} maxPolarAngle={1.05} minAzimuthAngle={-.72} maxAzimuthAngle={.18} />
  </>;
}

export default function TrackingCity3D({ active, onSelect }: { active: number; onSelect: (index: number) => void }) {
  return <Canvas shadows orthographic camera={{ position: [13,11,14], zoom: 53, near: .1, far: 100 }} gl={{ antialias: true, alpha: true }}>
    <City active={active} onSelect={onSelect} />
  </Canvas>;
}
