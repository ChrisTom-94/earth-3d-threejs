import * as THREE from 'https://cdn.skypack.dev/pin/three@v0.135.0-pjGUcRG9Xt70OdXl97VF/mode=imports/optimized/three.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@v0.135.0-pjGUcRG9Xt70OdXl97VF/examples/jsm/controls/OrbitControls.js';
import * as dat from './lib/dat.gui.module.js';

// loader for texture for 3D objects
const texturesLoader = new THREE.TextureLoader();

// Set up gui controller
const gui = new dat.GUI();
const sunLightFolder = gui.addFolder("Main Light");
const earthFolder = gui.addFolder("Earth");
const cameraFolder = gui.addFolder("Camera");


// Set up renderer
const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true, stencil: false});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

let isRotating = false;
window.addEventListener("mousemove", rotate, false);
function rotate(e){
    if(e.buttons !== 2) {
        isRotating = false;
        return;
    }
    isRotating = true;
    if(e.movementX < 0) earth.rotation.y -= 0.01;
    else if(e.movementX > 0) earth.rotation.y += 0.01;
}

// Set up camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const controls = new OrbitControls( camera, renderer.domElement );
camera.position.z = 120;
controls.update();
controls.minDistance = 40;
controls.maxDistance = 150;
controls.enablePan = false;
controls.target = new THREE.Vector3(-45, 0, 0)

// Set up scene and scene background
const scene = new THREE.Scene();
const textureScene = texturesLoader.load( './assets/textures/background.jpg' );
textureScene.wrapS = THREE.EquirectangularReflectionMapping;
scene.background = textureScene;

// Set up sun light
let sunLight = new THREE.DirectionalLight(0xffffff, 2);
sunLight.position.z = 120;
sunLightFolder.add(sunLight, "intensity", 0, 10, 0.2);
generateXYZFolder(sunLightFolder, sunLight.position, "position");
scene.add(sunLight);

// Set up earth
const geometry = new THREE.SphereGeometry( 30, 256, 256 );
const material = new THREE.ShaderMaterial({
    vertexShader: document.getElementById("earthVertexShader").textContent,
    fragmentShader: document.getElementById("earthFragmentShader").textContent,
    uniforms: {
        dayTexture: { type: 't', value: texturesLoader.load( './assets/textures/earth_daymap.jpg' ) },
        nightTexture: { type: 't', value: texturesLoader.load( './assets/textures/earth_nightmap.jpg' ) },
        cloudsTexture: { type: 't', value: texturesLoader.load( './assets/textures/earth_clouds.jpg' ) },
        lightDirection: {type: "v3f", value: new THREE.Vector3(-3.0, 0.0, 0.0)}
    }
});
const earth = new THREE.Mesh(geometry, material);
earth.name = "earth";
scene.add(earth);

// atmosphere
const atmosphereGeometry = new THREE.SphereGeometry( 35, 256, 256 );
const atmosphereMaterial = new THREE.ShaderMaterial({
    vertexShader: document.getElementById("atmosphereVertexShader").textContent,
    fragmentShader: document.getElementById("atmosphereFragmentShader").textContent,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
});
const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
scene.add(atmosphere);

(function animate() {
	requestAnimationFrame(animate);
    controls.update();
	renderer.render(scene, camera);
    atmosphere.rotation.y += 0.0002;
    atmosphere.rotation.z += 0.0002;
    if(!isRotating){
        earth.rotation.y += 0.0001;
    }
    earth.material.uniforms.lightDirection.value = (new THREE.Vector3()).subVectors(sunLight.position, earth.position)
})();

const alignEarthButton = document.getElementById("align-earth")
alignEarthButton.addEventListener("click", () => {
    if(alignEarthButton.textContent === "Center the planet") {
        controls.target = new THREE.Vector3(0,0,0)
        alignEarthButton.textContent = "Restore"
        return
    }
    controls.target = new THREE.Vector3(-45, 0, 0);
    alignEarthButton.textContent = "Center the planet"
})

function generateXYZFolder(parentFolder, object, prop, min = -100, max = 100, step = 2){
    const folder = parentFolder.addFolder(prop);
    const xController = folder.add(object, "x", min, max, step);
    const yController = folder.add(object, "y", min, max, step);
    const zController = folder.add(object, "z", min, max, step);
    controls.addEventListener("change", () => {
        xController.updateDisplay();
        yController.updateDisplay();
        zController.updateDisplay();
    });
    return folder;
}