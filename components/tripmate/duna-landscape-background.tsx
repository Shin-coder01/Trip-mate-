"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { LinearFilter, SRGBColorSpace, TextureLoader } from "three";
import type { ShaderMaterial } from "three";

const LANDSCAPE_IMAGE = "/tripmate/duna-landscape.jpg";

const vertexShader = [
  "varying vec2 vUv;",
  "void main() {",
  "  vUv = uv;",
  "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
  "}",
].join("\n");

const fragmentShader = [
  "precision highp float;",
  "uniform sampler2D uLandscape;",
  "uniform float uTime;",
  "uniform float uAspect;",
  "uniform float uImageAspect;",
  "varying vec2 vUv;",
  "void main() {",
  "  vec2 uv = vUv;",
  "  if (uAspect > uImageAspect) {",
  "    uv.y = (uv.y - 0.5) * (uImageAspect / uAspect) + 0.5;",
  "  } else {",
  "    uv.x = (uv.x - 0.5) * (uAspect / uImageAspect) + 0.5;",
  "  }",
  "  float time = uTime * 0.18;",
  "  float sky = smoothstep(0.42, 0.72, vUv.y);",
  "  float water = 1.0 - smoothstep(0.24, 0.42, vUv.y);",
  "  float breeze = sin(vUv.y * 11.0 + vUv.x * 3.5 - time * 0.45)",
  "    + sin(vUv.x * 8.0 + time * 0.3);",
  "  uv.x += breeze * 0.0045 * sky;",
  "  uv.x += sin(vUv.y * 42.0 - time * 1.2) * 0.009 * water;",
  "  uv.y += sin(vUv.x * 18.0 + time * 0.8) * 0.004 * water;",
  "  vec4 scene = texture2D(uLandscape, uv);",
  "  float cloudLine = 0.8 + 0.05 * sin(vUv.x * 4.0 - time * 0.75);",
  "  float cloudDrift = exp(-pow((vUv.y - cloudLine) * 28.0, 2.0)) * sky;",
  "  scene.rgb = mix(scene.rgb, vec3(1.0, 0.82, 0.68), cloudDrift * 0.18);",
  "  float ripples = pow(max(sin(vUv.x * 25.0 + vUv.y * 38.0 - time * 1.4), 0.0), 8.0);",
  "  scene.rgb = mix(scene.rgb, vec3(1.0, 0.93, 0.85), ripples * water * 0.16);",
  "  gl_FragColor = vec4(scene.rgb, 1.0);",
  "  #include <colorspace_fragment>",
  "}",
].join("\n");

function DunaLandscapeScene() {
  const landscape = useLoader(TextureLoader, LANDSCAPE_IMAGE);
  const materialRef = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uLandscape: { value: landscape },
      uTime: { value: 0 },
      uAspect: { value: 1 },
      uImageAspect: {
        value: landscape.image.width / landscape.image.height,
      },
    }),
    [landscape],
  );
  const { viewport } = useThree();

  useEffect(() => {
    landscape.colorSpace = SRGBColorSpace;
    landscape.magFilter = LinearFilter;
    landscape.needsUpdate = true;
  }, [landscape]);

  useFrame(({ clock }) => {
    const material = materialRef.current;
    if (!material) return;

    material.uniforms.uTime.value = clock.elapsedTime;
    material.uniforms.uAspect.value = viewport.width / Math.max(viewport.height, 0.001);
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

export default function DunaLandscapeBackground() {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setReducedMotion(motionPreference.matches);
    updateMotionPreference();
    motionPreference.addEventListener("change", updateMotionPreference);

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: "80px" },
    );
    if (surfaceRef.current) observer.observe(surfaceRef.current);

    return () => {
      motionPreference.removeEventListener("change", updateMotionPreference);
      observer.disconnect();
    };
  }, []);

  const shouldAnimate = !reducedMotion && isVisible;

  return (
    <div
      ref={surfaceRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: "url(" + LANDSCAPE_IMAGE + ")",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        dpr={[1, 1.25]}
        fallback={null}
        frameloop={shouldAnimate ? "always" : "demand"}
        gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <DunaLandscapeScene />
      </Canvas>
    </div>
  );
}