import React, { useRef, useEffect } from "react";
import * as THREE from "three";

interface Props {
    prompt: string;
}

const ThreeDImageGenerator: React.FC<Props> = ({ prompt }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        // Clear previous renderer
        if (rendererRef.current) {
            rendererRef.current.dispose();
            mountRef.current.innerHTML = "";
        }

        // Scene Setup
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        rendererRef.current = renderer;

        renderer.setSize(800, 600);
        mountRef.current.appendChild(renderer.domElement);

        // Light
        const light = new THREE.AmbientLight(0xffffff, 1);
        scene.add(light);

        // Generate 3D Object Based on Prompt
        let geometry: THREE.BufferGeometry;
        if (prompt.toLowerCase().includes("sphere")) {
            geometry = new THREE.SphereGeometry(2, 32, 32);
        } else if (prompt.toLowerCase().includes("cube")) {
            geometry = new THREE.BoxGeometry(2, 2, 2);
        } else {
            geometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
        }

        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        const object = new THREE.Mesh(geometry, material);
        scene.add(object);

        camera.position.z = 5;

        // Mouse Movement Listener for Rotation
        const onMouseMove = (event: MouseEvent) => {
            const { clientX, clientY } = event;
            const { innerWidth, innerHeight } = window;
            
            const mouseX = (clientX / innerWidth) * 2 - 1;
            const mouseY = -(clientY / innerHeight) * 2 + 1;
            
            object.rotation.y = mouseX * Math.PI;
            object.rotation.x = mouseY * Math.PI;
        };
        
        window.addEventListener("mousemove", onMouseMove);

        // Animation Loop
        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };

        animate();

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            renderer.dispose();
            mountRef.current && (mountRef.current.innerHTML = "");
        };
    }, [prompt]);

    return <div ref={mountRef} />;
};

export default ThreeDImageGenerator;
