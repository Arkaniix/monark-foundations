import { useEffect, useRef } from "react";
import * as THREE from "three";

type Props = { color?: string; size?: number };

export default function VerdictCrystal({ color = "#10B981", size = 80 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{ mat?: THREE.MeshStandardMaterial }>({});

  useEffect(() => {
    if (!ref.current) return;
    const w = size, h = size;
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    cam.position.z = 3.2;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    ref.current.innerHTML = "";
    ref.current.appendChild(renderer.domElement);

    const geo = new THREE.OctahedronGeometry(1, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      metalness: 0.35,
      roughness: 0.25,
      emissive: new THREE.Color(color),
      emissiveIntensity: 0.35,
      flatShading: true,
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    const wireGeo = new THREE.EdgesGeometry(geo);
    const wireMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 });
    const wire = new THREE.LineSegments(wireGeo, wireMat);
    mesh.add(wire);

    const amb = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(amb);
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(2, 3, 4);
    scene.add(dir);
    const dir2 = new THREE.DirectionalLight(0x8ab4ff, 0.4);
    dir2.position.set(-3, -2, 2);
    scene.add(dir2);

    stateRef.current = { mat };

    let raf = 0;
    let last = performance.now();
    const animate = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      mesh.rotation.y += 0.5 * dt;
      mesh.rotation.x += 0.12 * dt;
      renderer.render(scene, cam);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      geo.dispose(); mat.dispose(); wireGeo.dispose(); wireMat.dispose();
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]);

  useEffect(() => {
    const mat = stateRef.current.mat;
    if (!mat) return;
    const target = new THREE.Color(color);
    let raf = 0;
    const lerp = () => {
      mat.color.lerp(target, 0.12);
      mat.emissive.lerp(target, 0.12);
      if (mat.color.getHexString() !== target.getHexString()) raf = requestAnimationFrame(lerp);
    };
    raf = requestAnimationFrame(lerp);
    return () => cancelAnimationFrame(raf);
  }, [color]);

  return <div ref={ref} style={{ width: size, height: size }} />;
}
export { VerdictCrystal };
