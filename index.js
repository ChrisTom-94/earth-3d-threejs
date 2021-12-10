import * as THREE from 'https://cdn.skypack.dev/pin/three@v0.135.0-pjGUcRG9Xt70OdXl97VF/mode=imports/optimized/three.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@v0.135.0-pjGUcRG9Xt70OdXl97VF/examples/jsm/controls/OrbitControls.js';

const baseAPI = "https://api.le-systeme-solaire.net/rest/"

// Set up scene 
const renderer = new THREE.WebGLRenderer();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000)
const controls = new OrbitControls( camera, renderer.domElement );
const textureLoader = new THREE.TextureLoader();
const scene = new THREE.Scene();
const textureScene = textureLoader.load( './assets/textures/background.jpg' )
textureScene.wrapS = THREE.EquirectangularReflectionMapping
scene.background = textureScene

// Create solar system
const solarSystem = new THREE.Group()
solarSystem.name = "solar-system";

let sun;
(async function(){
    let query = await fetch(baseAPI+"bodies?filter[]=englishName,eq,sun&data=englishName,mass,massValue,massExponent")
    let sunData = await query.json()
    sun = await createStar(sunData.bodies[0])
    solarSystem.add(sun)
})();
(async function(){
    let query = await fetch(baseAPI+"bodies?filter[]=isPlanet,neq,true&data=englishName,mass,massValue,massExponent")
    let stars = await query.json()
    for (const starData of stars.bodies) {
        const star = await createStar(starData)
        solarSystem.add(star)
        star.position.x = starData.mass.massValue * 15
    }
})();

scene.add( solarSystem );
camera.position.z = 100

controls.update();

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


function animate() {
	requestAnimationFrame( animate );
    controls.update();
	renderer.render( scene, camera );
}
animate();

//TODO! fix planets scale
async function createStar(starData){
    const name = starData.englishName.split(' ').pop().toLowerCase()
    const mass = starData.mass.massValue
    const exp = starData.mass.massExponent
    const geometry = new THREE.SphereGeometry( Math.pow(mass, exp), 16, 16 );
    const texture = textureLoader.load("./assets/textures/"+name+".jpg")
    const material = new THREE.MeshBasicMaterial({map: texture})
    const star = new THREE.Mesh(geometry, material) 
    star.name = name
    return star
}