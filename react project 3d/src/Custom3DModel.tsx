import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const ThreeDImageGenerator: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

    useEffect(() => {
        if (!mountRef.current) return;
        if (rendererRef.current) return; // Prevent multiple renderers

        rendererRef.current = new THREE.WebGLRenderer();

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(800, 600);
        mountRef.current.appendChild(renderer.domElement);

        // Lighting
        const light = new THREE.AmbientLight(0xffffff, 1);
        scene.add(light);

        // Define custom geometry for isometric shape
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(40, 0);
        shape.lineTo(40, 20);
        shape.lineTo(20, 20);
        shape.lineTo(20, 40);
        shape.lineTo(0, 40);
        shape.lineTo(0, 0);

        const extrudeSettings = { depth: 20, bevelEnabled: false };

        // Define different materials for each face
        const materialColors = [
            0xff5733, // Front
            0x33ff57, // Back
            0x3357ff, // Top
            0xff33a8, // Bottom
            0xa833ff, // Left
            0x33fff2  // Right
        ];

        const materials = materialColors.map(color => new THREE.MeshBasicMaterial({ color }));

        // Create extruded geometry
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

        // Assign material indices for different faces
        geometry.groups.forEach((group, index) => {
            group.materialIndex = index % materials.length; // Cycle through materials
        });

        // Create and add the mesh
        const object = new THREE.Mesh(geometry, materials);
        scene.add(object);

        // Position camera
        camera.position.set(50, 50, 50);
        camera.lookAt(scene.position);

        // Add OrbitControls for interaction
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            mountRef.current?.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, []);

    return <div ref={mountRef} />;
};

export default ThreeDImageGenerator;
