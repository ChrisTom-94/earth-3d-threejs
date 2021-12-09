import * as THREE from 'https://cdn.skypack.dev/pin/three@v0.135.0-pjGUcRG9Xt70OdXl97VF/mode=imports/optimized/three.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@v0.135.0-pjGUcRG9Xt70OdXl97VF/examples/jsm/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000)
const controls = new OrbitControls( camera, renderer.domElement );

const cube = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial({color: 0xff0000}))

scene.add(cube)
camera.position.z = 5

controls.update();

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

function animate() {
	requestAnimationFrame( animate );
    controls.update();
    cube.rotation.x += 0.001
    cube.rotation.y += 0.001
	renderer.render( scene, camera );
}
animate();