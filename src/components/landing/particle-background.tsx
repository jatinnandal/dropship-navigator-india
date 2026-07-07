"use client";

import { useEffect, useRef } from "react";

export function ParticleBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion.current) return;

    const container = containerRef.current;
    if (!container) return;

    let destroyed = false;

    import("three").then(({ Scene, PerspectiveCamera, WebGLRenderer, BufferGeometry, Float32BufferAttribute, Points, ShaderMaterial, Color }) => {
      if (destroyed) return;

      const scene = new Scene();
      const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 3;

      const renderer = new WebGLRenderer({ alpha: true, antialias: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);

      const count = 600;
      const positions = new Float32Array(count * 3);
      const sizes = new Float32Array(count);
      const speeds = new Float32Array(count);

      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 10;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
        sizes[i] = Math.random() * 1.2 + 0.3;
        speeds[i] = Math.random() * 0.15 + 0.05;
      }

      const geometry = new BufferGeometry();
      geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
      geometry.setAttribute("aSize", new Float32BufferAttribute(sizes, 1));
      geometry.setAttribute("aSpeed", new Float32BufferAttribute(speeds, 1));

      const material = new ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new Color(0xffffff) },
          uOpacity: { value: 0.18 },
        },
        vertexShader: `
          attribute float aSize;
          attribute float aSpeed;
          uniform float uTime;
          varying float vAlpha;
          void main() {
            vec3 pos = position;
            pos.y += sin(uTime * aSpeed + position.x * 2.0) * 0.15;
            pos.x += cos(uTime * aSpeed * 0.7 + position.z) * 0.08;
            vec4 mvp = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mvp;
            gl_PointSize = aSize * (80.0 / -mvp.z);
            vAlpha = smoothstep(0.0, 0.5, aSize / 2.5);
          }
        `,
        fragmentShader: `
          uniform vec3 uColor;
          uniform float uOpacity;
          varying float vAlpha;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            if (d > 0.5) discard;
            float alpha = smoothstep(0.5, 0.1, d) * vAlpha * uOpacity;
            gl_FragColor = vec4(uColor, alpha);
          }
        `,
        transparent: true,
        depthWrite: false,
      });

      const points = new Points(geometry, material);
      scene.add(points);

      const mouse = { x: 0, y: 0 };
      const onMouseMove = (e: MouseEvent) => {
        mouse.x = (e.clientX / window.innerWidth - 0.5) * 0.3;
        mouse.y = (e.clientY / window.innerHeight - 0.5) * 0.3;
      };
      window.addEventListener("mousemove", onMouseMove);

      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener("resize", onResize);

      let raf: number;
      const clock = { start: performance.now() };

      const animate = () => {
        if (destroyed) return;
        const elapsed = (performance.now() - clock.start) * 0.001;
        material.uniforms.uTime.value = elapsed;

        points.rotation.y += (mouse.x * 0.2 - points.rotation.y) * 0.02;
        points.rotation.x += (-mouse.y * 0.15 - points.rotation.x) * 0.02;

        renderer.render(scene, camera);
        raf = requestAnimationFrame(animate);
      };
      raf = requestAnimationFrame(animate);

      return () => {
        destroyed = true;
        cancelAnimationFrame(raf);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("resize", onResize);
        renderer.dispose();
        geometry.dispose();
        material.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    });

    return () => {
      destroyed = true;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.45,
      }}
      aria-hidden="true"
    />
  );
}
