import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Sparkles, RotateCw, Pause, Play, Compass } from 'lucide-react';
import { ToolCategory } from '../data/toolsRegistry';

interface ThreeHeroSceneProps {
  onSelectCategory?: (category: 'All' | ToolCategory) => void;
  className?: string;
}

// Reusable math objects to eliminate garbage collection inside animation loop
const _mouse = new THREE.Vector2(-999, -999);
const _targetMouse = new THREE.Vector2(0, 0);
const _raycaster = new THREE.Raycaster();

export const ThreeHeroScene: React.FC<ThreeHeroSceneProps> = ({
  onSelectCategory,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [hoveredArtifact, setHoveredArtifact] = useState<{
    name: string;
    category: ToolCategory;
    description: string;
  } | null>(null);
  const [webGlSupported, setWebGlSupported] = useState(true);
  const [isLowPower, setIsLowPower] = useState(false);

  // References to communicate with Three.js render loop without re-triggering useEffect
  const isRotatingRef = useRef(true);
  isRotatingRef.current = isRotating;

  const onSelectCategoryRef = useRef(onSelectCategory);
  onSelectCategoryRef.current = onSelectCategory;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsRotating(false);
      isRotatingRef.current = false;
    }

    // Check WebGL support & detect software GL
    let isSoftwareGl = false;
    try {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
      if (!gl) {
        setWebGlSupported(false);
        return;
      }
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const gpu = String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
        isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {
      isSoftwareGl = true;
    }
    setIsLowPower(isSoftwareGl);

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 420;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.6, 7.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';

    container.appendChild(renderer.domElement);

    // 2. Environment Map (PMREMGenerator + RoomEnvironment for realistic PBR specular gloss)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3. Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x818cf8, 2.2); // Warm indigo key
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.8); // Cool sky rim
    rimLight.position.set(-4, -2, -3);
    scene.add(rimLight);

    const centerGlow = new THREE.PointLight(0xa855f7, 1.4, 10); // Purple core point light
    centerGlow.position.set(0, 0, 1.5);
    scene.add(centerGlow);

    // 4. Procedural 3D Artifacts Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Material Library
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x6366f1,
      roughness: 0.15,
      metalness: 0.2,
      transmission: isSoftwareGl ? 0 : 0.6,
      transparent: true,
      opacity: isSoftwareGl ? 0.8 : 0.88,
      ior: 1.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    const goldAccentMaterial = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.9,
      roughness: 0.2,
    });

    const cyanCrystalMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,
      roughness: 0.1,
      metalness: 0.35,
      transmission: isSoftwareGl ? 0 : 0.65,
      transparent: true,
      opacity: isSoftwareGl ? 0.85 : 0.9,
      clearcoat: 1.0,
    });

    const emeraldDocMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x10b981,
      roughness: 0.25,
      metalness: 0.4,
      clearcoat: 0.8,
    });

    const violetTileMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      roughness: 0.2,
      metalness: 0.7,
    });

    const interactiveMeshes: {
      mesh: THREE.Object3D;
      name: string;
      category: ToolCategory;
      description: string;
      baseScale: number;
    }[] = [];

    // Artifact 1: PDF Document Tablet (Top Left)
    const docGroup = new THREE.Group();
    docGroup.position.set(-2.2, 0.9, 0);

    const docBodyGeom = new THREE.BoxGeometry(1.4, 1.9, 0.12);
    const docBody = new THREE.Mesh(docBodyGeom, glassMaterial);
    docGroup.add(docBody);

    // Page accent lines
    for (let i = 0; i < 3; i++) {
      const lineGeom = new THREE.BoxGeometry(0.9, 0.08, 0.04);
      const lineMesh = new THREE.Mesh(lineGeom, goldAccentMaterial);
      lineMesh.position.set(0, 0.4 - i * 0.35, 0.08);
      docGroup.add(lineMesh);
    }
    // PDF Badge corner
    const pdfCornerGeom = new THREE.BoxGeometry(0.45, 0.25, 0.06);
    const pdfCorner = new THREE.Mesh(pdfCornerGeom, emeraldDocMaterial);
    pdfCorner.position.set(-0.35, 0.65, 0.08);
    docGroup.add(pdfCorner);

    rootGroup.add(docGroup);
    interactiveMeshes.push({
      mesh: docGroup,
      name: 'PDF Documents & Compression',
      category: 'PDF Tools',
      description: 'Merge, compress and convert PDF application files locally',
      baseScale: 1,
    });

    // Artifact 2: Photo Camera Aperture Lens (Top Right)
    const lensGroup = new THREE.Group();
    lensGroup.position.set(2.2, 0.8, -0.3);

    const outerRingGeom = new THREE.TorusGeometry(0.9, 0.14, 16, 48);
    const outerRing = new THREE.Mesh(outerRingGeom, violetTileMaterial);
    lensGroup.add(outerRing);

    const innerLensGeom = new THREE.CylinderGeometry(0.65, 0.65, 0.2, 32);
    innerLensGeom.rotateX(Math.PI / 2);
    const innerLens = new THREE.Mesh(innerLensGeom, cyanCrystalMaterial);
    lensGroup.add(innerLens);

    // Aperture blades
    for (let b = 0; b < 6; b++) {
      const angle = (b * Math.PI) / 3;
      const bladeGeom = new THREE.BoxGeometry(0.35, 0.08, 0.05);
      const blade = new THREE.Mesh(bladeGeom, goldAccentMaterial);
      blade.position.set(Math.cos(angle) * 0.45, Math.sin(angle) * 0.45, 0.06);
      blade.rotation.z = angle + 0.4;
      lensGroup.add(blade);
    }

    rootGroup.add(lensGroup);
    interactiveMeshes.push({
      mesh: lensGroup,
      name: 'Passport Photo & Image Tools',
      category: 'Image Tools',
      description: 'Compress to 50KB, crop 35×45mm, resize and print sheets',
      baseScale: 1,
    });

    // Artifact 3: Central Compression Crystal / Polyhedron
    const crystalGeom = new THREE.IcosahedronGeometry(1.05, 0);
    const crystalMesh = new THREE.Mesh(crystalGeom, cyanCrystalMaterial);
    crystalMesh.position.set(0, -0.1, 0.6);
    rootGroup.add(crystalMesh);

    // Orbiting orbital ring around crystal
    const crystalOrbitGeom = new THREE.TorusGeometry(1.5, 0.03, 12, 64);
    const crystalOrbit = new THREE.Mesh(crystalOrbitGeom, goldAccentMaterial);
    crystalOrbit.rotation.x = Math.PI / 3;
    crystalMesh.add(crystalOrbit);

    interactiveMeshes.push({
      mesh: crystalMesh,
      name: 'Smart File Compression',
      category: 'PDF Tools',
      description: 'Target-seeking local optimizer with zero server uploads',
      baseScale: 1,
    });

    // Artifact 4: QR Monolith & Utility Matrix (Bottom Left)
    const qrGroup = new THREE.Group();
    qrGroup.position.set(-1.8, -1.3, -0.2);

    const qrPlateGeom = new THREE.BoxGeometry(1.2, 1.2, 0.1);
    const qrPlate = new THREE.Mesh(qrPlateGeom, glassMaterial);
    qrGroup.add(qrPlate);

    // Procedural QR data blocks
    for (let r = -1; r <= 1; r++) {
      for (let c = -1; c <= 1; c++) {
        if ((r + c) % 2 === 0) {
          const bitGeom = new THREE.BoxGeometry(0.24, 0.24, 0.08);
          const bit = new THREE.Mesh(bitGeom, emeraldDocMaterial);
          bit.position.set(c * 0.35, r * 0.35, 0.06);
          qrGroup.add(bit);
        }
      }
    }

    rootGroup.add(qrGroup);
    interactiveMeshes.push({
      mesh: qrGroup,
      name: 'QR Codes & Utilities',
      category: 'Utility Tools',
      description: 'Offline WiFi/URL QR codes, age calculation & Urdu editor',
      baseScale: 1,
    });

    // Artifact 5: Form Quill & Metric Calculator (Bottom Right)
    const formGroup = new THREE.Group();
    formGroup.position.set(1.9, -1.2, 0.1);

    const formPillarGeom = new THREE.CylinderGeometry(0.2, 0.28, 1.4, 6);
    const formPillar = new THREE.Mesh(formPillarGeom, violetTileMaterial);
    formPillar.rotation.z = -Math.PI / 4;
    formGroup.add(formPillar);

    const formGemGeom = new THREE.OctahedronGeometry(0.35);
    const formGem = new THREE.Mesh(formGemGeom, goldAccentMaterial);
    formGem.position.set(0.6, 0.6, 0.1);
    formGroup.add(formGem);

    rootGroup.add(formGroup);
    interactiveMeshes.push({
      mesh: formGroup,
      name: 'Application Form Utilities',
      category: 'Utility Tools',
      description: 'Date-of-birth age calculations and word counts',
      baseScale: 1,
    });

    // 5. Floating Star Dust Particles Field (150 soft points)
    const particleCount = isSoftwareGl ? 60 : 160;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let p = 0; p < particleCount * 3; p += 3) {
      particlePositions[p] = (Math.random() - 0.5) * 14;
      particlePositions[p + 1] = (Math.random() - 0.5) * 8;
      particlePositions[p + 2] = (Math.random() - 0.5) * 6;
    }
    const particleGeom = new THREE.BufferGeometry();
    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x818cf8,
      size: isSoftwareGl ? 0.08 : 0.06,
      transparent: true,
      opacity: 0.65,
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    // 6. Interaction Handlers (Raycasting & Parallax)
    let hoveredIndex = -1;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      _targetMouse.set(x, y);
    };

    const handlePointerLeave = () => {
      _targetMouse.set(0, 0);
      setHoveredArtifact(null);
      hoveredIndex = -1;
    };

    const handleClick = () => {
      if (hoveredIndex >= 0) {
        const item = interactiveMeshes[hoveredIndex];
        if (item && onSelectCategoryRef.current) {
          onSelectCategoryRef.current(item.category);
        }
      }
    };

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerleave', handlePointerLeave);
    container.addEventListener('click', handleClick);

    // Touch support for dragging rotation
    let isTouching = false;
    let lastTouchX = 0;
    let lastTouchY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isTouching = true;
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isTouching || e.touches.length !== 1) return;
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      const deltaX = (touchX - lastTouchX) * 0.005;
      const deltaY = (touchY - lastTouchY) * 0.005;
      lastTouchX = touchX;
      lastTouchY = touchY;

      rootGroup.rotation.y += deltaX;
      rootGroup.rotation.x = Math.max(-0.4, Math.min(0.4, rootGroup.rotation.x + deltaY));
    };

    const handleTouchEnd = () => {
      isTouching = false;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);

    // 7. Resize Observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 8. Animation Loop with Framerate-Independent Damping
    let clock = new THREE.Clock();
    let animFrameId = 0;

    const tick = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth mouse damping
      _mouse.x = THREE.MathUtils.damp(_mouse.x, _targetMouse.x, 6, delta);
      _mouse.y = THREE.MathUtils.damp(_mouse.y, _targetMouse.y, 6, delta);

      // Camera parallax tilt based on mouse position
      camera.position.x = _mouse.x * 0.75;
      camera.position.y = 0.6 + _mouse.y * 0.55;
      camera.lookAt(0, 0, 0);

      // Gentle auto-rotation
      if (isRotatingRef.current) {
        rootGroup.rotation.y += delta * 0.28;
      }

      // Individual artifact subtle idle floating motions
      docGroup.position.y = 0.9 + Math.sin(time * 1.5 + 0.2) * 0.08;
      docGroup.rotation.z = Math.sin(time * 0.8) * 0.06;

      lensGroup.position.y = 0.8 + Math.cos(time * 1.6 + 0.5) * 0.08;
      innerLens.rotation.z += delta * 0.5;

      crystalMesh.position.y = -0.1 + Math.sin(time * 2.0) * 0.1;
      crystalMesh.rotation.x += delta * 0.4;
      crystalMesh.rotation.y += delta * 0.5;

      qrGroup.position.y = -1.3 + Math.sin(time * 1.4 + 1.2) * 0.07;
      formGroup.position.y = -1.2 + Math.cos(time * 1.7 + 0.9) * 0.07;

      // Particle subtle spin
      particles.rotation.y = time * 0.04;

      // Raycasting for interactive hover feedback
      _raycaster.setFromCamera(_mouse, camera);
      let foundHoverIdx = -1;

      for (let i = 0; i < interactiveMeshes.length; i++) {
        const item = interactiveMeshes[i];
        const intersects = _raycaster.intersectObject(item.mesh, true);
        const isHovered = intersects.length > 0;

        const targetScale = isHovered ? item.baseScale * 1.12 : item.baseScale;
        item.mesh.scale.setScalar(
          THREE.MathUtils.damp(item.mesh.scale.x, targetScale, 10, delta)
        );

        if (isHovered && foundHoverIdx === -1) {
          foundHoverIdx = i;
        }
      }

      if (foundHoverIdx !== hoveredIndex) {
        hoveredIndex = foundHoverIdx;
        if (foundHoverIdx >= 0) {
          const hovered = interactiveMeshes[foundHoverIdx];
          setHoveredArtifact({
            name: hovered.name,
            category: hovered.category,
            description: hovered.description,
          });
          container.style.cursor = 'pointer';
        } else {
          setHoveredArtifact(null);
          container.style.cursor = 'default';
        }
      }

      renderer.render(scene, camera);
      animFrameId = requestAnimationFrame(tick);
    };

    animFrameId = requestAnimationFrame(tick);

    // 9. Cleanup
    return () => {
      cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();

      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerleave', handlePointerLeave);
      container.removeEventListener('click', handleClick);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      // Dispose resources
      docBodyGeom.dispose();
      outerRingGeom.dispose();
      innerLensGeom.dispose();
      crystalGeom.dispose();
      crystalOrbitGeom.dispose();
      qrPlateGeom.dispose();
      formPillarGeom.dispose();
      formGemGeom.dispose();
      particleGeom.dispose();

      glassMaterial.dispose();
      goldAccentMaterial.dispose();
      cyanCrystalMaterial.dispose();
      emeraldDocMaterial.dispose();
      violetTileMaterial.dispose();
      particleMat.dispose();

      if (scene.environment) {
        scene.environment.dispose();
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      className={`relative w-full h-[360px] sm:h-[440px] md:h-[480px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900/90 via-indigo-950/70 to-slate-950/90 border border-indigo-500/20 shadow-2xl shadow-indigo-950/40 select-none ${className}`}
    >
      {/* 3D WebGL Canvas Mount */}
      <div
        ref={mountRef}
        className="w-full h-full"
        aria-label="Interactive 3D utility showcase. Drag or move mouse to rotate."
      />

      {/* Floating HUD: Interactive Hover Card */}
      <div className="absolute top-4 left-4 right-4 sm:right-auto pointer-events-none transition-all duration-300">
        {hoveredArtifact ? (
          <div className="p-3 sm:p-4 rounded-xl backdrop-blur-md bg-slate-950/85 border border-indigo-500/40 shadow-xl max-w-sm pointer-events-auto transform animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-semibold tracking-wider uppercase text-indigo-400">
                {hoveredArtifact.category}
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-white mt-1">
              {hoveredArtifact.name}
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-snug">
              {hoveredArtifact.description}
            </p>
            <span className="inline-block mt-2 text-[11px] font-semibold text-indigo-300">
              Click to filter tools &rarr;
            </span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md bg-slate-950/60 border border-slate-700/60 text-xs text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />
            <span>Interactive 3D Workspace · Move or drag to explore</span>
          </div>
        )}
      </div>

      {/* Bottom Floating Controls Pill */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md bg-slate-950/75 border border-slate-700/70 shadow-lg text-xs text-slate-200 z-10">
        <button
          type="button"
          onClick={() => setIsRotating((r) => !r)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 hover:text-white transition-colors cursor-pointer"
          title={isRotating ? 'Pause 3D rotation' : 'Resume 3D rotation'}
        >
          {isRotating ? (
            <>
              <Pause className="w-3 h-3 text-indigo-400" aria-hidden="true" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 text-emerald-400" aria-hidden="true" />
              <span>Rotate</span>
            </>
          )}
        </button>

        <span className="text-slate-600" aria-hidden="true">
          |
        </span>

        <span className="hidden sm:inline text-[11px] text-slate-400">
          {isLowPower ? 'Safe GL Mode' : 'PBR Reflections'}
        </span>

        <button
          type="button"
          onClick={() => {
            _targetMouse.set(0, 0);
          }}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          title="Center view"
        >
          <Compass className="w-3 h-3" aria-hidden="true" />
          <span className="sr-only">Center view</span>
        </button>
      </div>

      {!webGlSupported && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900/95 text-white">
          <Sparkles className="w-8 h-8 text-indigo-400 mb-2" />
          <h3 className="font-bold text-lg">PlayBeat Tools 3D Workspace</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            Browser file processing running locally.
          </p>
        </div>
      )}
    </div>
  );
};
