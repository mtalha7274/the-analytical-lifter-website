(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.getElementById('heroCanvas');
  const hero = document.getElementById('hero');
  if (!canvas || !hero || typeof THREE === 'undefined') return;

  let renderer, scene, camera, mesh, animId, visible = true;

  function init() {
    const width = hero.offsetWidth;
    const height = hero.offsetHeight;

    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 5;

    const geometry = new THREE.TorusKnotGeometry(1.2, 0.35, 120, 16);
    const material = new THREE.MeshBasicMaterial({
      color: 0xcafc00,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(1.5, 0.3, 0);
    scene.add(mesh);

    const innerGeo = new THREE.IcosahedronGeometry(0.8, 1);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x0bd600,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const inner = new THREE.Mesh(innerGeo, innerMat);
    inner.position.set(-1.8, -0.5, -0.5);
    scene.add(inner);
    mesh.userData.inner = inner;

    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        if (visible) animate();
      },
      { threshold: 0 }
    );
    observer.observe(hero);

    window.addEventListener('resize', onResize, { passive: true });
    animate();
  }

  function onResize() {
    const width = hero.offsetWidth;
    const height = hero.offsetHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function animate() {
    if (!visible) {
      animId = null;
      return;
    }

    animId = requestAnimationFrame(animate);
    const t = Date.now() * 0.0003;
    mesh.rotation.x = t * 0.7;
    mesh.rotation.y = t;
    if (mesh.userData.inner) {
      mesh.userData.inner.rotation.x = -t * 0.5;
      mesh.userData.inner.rotation.y = t * 0.8;
    }
    renderer.render(scene, camera);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
