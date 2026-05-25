import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type Props = { color?: string; size?: number };

/**
 * Teste si un contexte WebGL est réellement créable, sans jeter.
 * Certains navigateurs/machines (pas de GPU, WebGL désactivé, mode éco, VM,
 * configs d'entreprise) ne fournissent pas de contexte → THREE.WebGLRenderer
 * jette "Error creating WebGL context" et ferait planter toute la page.
 */
function isWebGLAvailable(): boolean {
  if (typeof window === "undefined") return false; // SSR : pas de 3D côté serveur
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    return !!gl;
  } catch {
    return false;
  }
}

/**
 * Fallback statique : un octaèdre CSS de la bonne couleur. S'affiche quand le 3D
 * n'est pas disponible, pour que la landing reste soignée (pas un trou vide) au
 * lieu de crasher. Pas d'animation, mais cohérent visuellement.
 */
function CrystalFallback({ color, size }: { color: string; size: number }) {
  const s = size * 0.62;
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      aria-hidden="true"
    >
      <div
        style={{
          width: s,
          height: s,
          transform: "rotate(45deg)",
          borderRadius: size * 0.08,
          background: `linear-gradient(135deg, ${color} 0%, ${color}AA 55%, ${color}66 100%)`,
          boxShadow: `0 0 ${size * 0.18}px ${color}55, inset 0 0 ${size * 0.12}px ${color}88`,
          border: `1px solid ${color}AA`,
        }}
      />
    </div>
  );
}

export default function VerdictCrystal({ color = "#10B981", size = 80 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{ mat?: THREE.MeshStandardMaterial }>({});
  // null = pas encore testé ; true/false = WebGL dispo ou non. Démarre en fallback
  // côté SSR/initial pour éviter tout flash, le 3D prend le relais si dispo.
  const [webgl, setWebgl] = useState<boolean | null>(null);

  // Détection WebGL au montage (client uniquement).
  useEffect(() => {
    setWebgl(isWebGLAvailable());
  }, []);

  // Init Three.js — UNIQUEMENT si WebGL confirmé dispo.
  useEffect(() => {
    if (webgl !== true || !ref.current) return;

    const w = size, h = size;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      // Garde-fou ultime : si la création échoue malgré le test, on bascule en
      // fallback proprement plutôt que de laisser l'exception remonter.
      setWebgl(false);
      return;
    }

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    cam.position.z = 3.2;
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
  }, [size, webgl]);

  // Transition de couleur (seulement en mode 3D, quand le material existe).
  useEffect(() => {
    if (webgl !== true) return;
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
  }, [color, webgl]);

  // Tant que le test n'a pas tranché, OU si WebGL indisponible → fallback CSS.
  if (webgl !== true) {
    return <CrystalFallback color={color} size={size} />;
  }

  return <div ref={ref} style={{ width: size, height: size }} />;
}
export { VerdictCrystal };
