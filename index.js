import * as THREE from 'https://cdn.skypack.dev/pin/three@v0.135.0-pjGUcRG9Xt70OdXl97VF/mode=imports/optimized/three.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@v0.135.0-pjGUcRG9Xt70OdXl97VF/examples/jsm/controls/OrbitControls.js';
import * as dat from './lib/dat.gui.module.js';

const baseAPI = "https://api.le-systeme-solaire.net/rest/";

// To load texture for 3D objects
const texturesLoader = new THREE.TextureLoader();

// Set up gui controller
const gui = new dat.GUI();
const cameraFolder = gui.addFolder("Camera");
const sunFolder = gui.addFolder("Sun");
const planetsParentFolder = gui.addFolder("Planets");

// Set up renderer 
const renderer = new THREE.WebGLRenderer();

// Set up camera and orbit controls
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const controls = new OrbitControls( camera, renderer.domElement );
camera.position.z = 10;
controls.update();
const cameraXFolderController = cameraFolder.add(camera.position, 'x', -200, 200, 1)
const cameraYFolderController = cameraFolder.add(camera.position, 'y', -200, 200, 1)
const cameraZFolderController = cameraFolder.add(camera.position, 'z', -200, 200, 1)
controls.addEventListener("change", () => {
    cameraXFolderController.updateDisplay();
    cameraYFolderController.updateDisplay();
    cameraZFolderController.updateDisplay();
})

// Set up scene and background
const scene = new THREE.Scene();
const textureScene = texturesLoader.load( './assets/textures/background.jpg' );
textureScene.wrapS = THREE.EquirectangularReflectionMapping;
scene.background = textureScene;

// Set up sun 
let sun = new THREE.Mesh();
let sunLight = new THREE.PointLight( 0xffffff, 1, 600 );
sunLight.power = 10.5;
sunFolder.add(sunLight, "intensity", 0, 10, 0.2);
let starsParent = [];

if(localStorage.getItem("sun") && localStorage.getItem("stars")){
    const sunData = JSON.parse(localStorage.getItem("sun"));
    sun = (await generateStar(sunData)).clone(true);
    scene.add(sun);

    const stars = JSON.parse(localStorage.getItem("stars"));
    generateStars(stars);
}else{
    (async function(){
        const querySun = await fetch(baseAPI+"bodies?filter[]=englishName,eq,sun&data=englishName,equaRadius");
        const dataSun = await querySun.json();
        const {bodies: [sunData]} = dataSun;
        localStorage.setItem("sun", JSON.stringify(sunData));
        sun = (await generateStar(sunData)).clone(true);
        scene.add(sun);

        const queryStars = await fetch(baseAPI+"bodies?filter[]=isPlanet,neq,true&data=englishName,equaRadius,perihelion,aphelion");
        const dataStars = await queryStars.json();
        const {bodies: [...stars]} = dataStars;
        localStorage.setItem("stars", JSON.stringify(stars));
        generateStars(stars);
    })();
}

scene.add(sun);
sun.material.emissive = 0xffffff;
scene.add(sunLight);

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

(function animate() {
	requestAnimationFrame(animate);
    controls.update();
	renderer.render(scene, camera);
})();

async function generateStar(starData){
    const name = starData.englishName.split(' ').pop().toLowerCase();
    const radius = starData.equaRadius / 10000;
    const geometry = new THREE.SphereGeometry( radius, 16, 16 );
    const texture = texturesLoader.load("./assets/textures/"+name+".jpg");
    const material = new THREE.MeshLambertMaterial({map: texture});
    const star = new THREE.Mesh(geometry, material);
    star.name = name;
    return star;
}

async function generateStars(stars){
    for (const starData of stars) {
        const star = await generateStar(starData);
        const starParent = new THREE.Object3D();
        const starFolder = await planetsParentFolder.addFolder(star.name);

        starFolder.domElement.classList.add("capitalize");
        await generateXYZFolder(starFolder, star.rotation, 'rotation');

        starParent.name = star.name+"-parent";
        starParent.add(star);
        starsParent = [...starsParent, starParent];

        star.position.x = ((starData.perihelion + starData.aphelion) / 2 ) / 10000000;
        
        scene.add(starParent);
    }
}

function generateXYZFolder(parentFolder, object, prop, min, max, step){
    const folder = parentFolder.addFolder(prop);
    const xController = folder.add(object, "x", min, max, step);
    const yController = folder.add(object, "y", min, max, step);
    const zController = folder.add(object, "z", min, max, step);
    controls.addEventListener("change", () => {
        xController.updateDisplay();
        yController.updateDisplay();
        zController.updateDisplay();
    });
}