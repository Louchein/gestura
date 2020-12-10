import * as THREE from '../three.js-dev/build/three.module.js';
import { OrbitControls } from '../three.js-dev/examples/jsm/controls/OrbitControls.js';
import Stats from '../three.js-dev/examples/jsm/libs/stats.module.js';

let scene, controls, camera, renderer, stats;

var cameraCenter = new THREE.Vector3();
var cameraHorzLimit = 50;
var cameraVertLimit = 50;
var mouse = new THREE.Vector2();

var angle = 0;
var radius = 500; 

init();
animate();

function init(){
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 2.2;
    // camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 1000 );
    // camera.position.set( 15, 20, 30 );
    camera.lookAt (new THREE.Vector3(0,0,0));
    cameraCenter.x = camera.position.x;
    cameraCenter.y = camera.position.y;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor (0x120A14, 1);   // Background Color 
    document.body.appendChild(renderer.domElement);

    // orbit controls
    controls = new OrbitControls( camera, renderer.domElement );
    // controls.enableDamping = true;
    // controls.dampingFactor = 0.06;
    // controls.minDistance = 20;
    // controls.maxDistance = 50;
    // controls.screenSpacePanning = false;
    // controls.maxPolarAngle = Math.PI / 2;


    const geometry = new THREE.BoxGeometry(4.5, 3, 0.1);
    const material = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        wireframe: false
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // light    
    const light_1 = new THREE.AmbientLight( 0x222222 );
    scene.add( light_1 );

    const light_2 = new THREE.PointLight( 0xffffff, 1 );
    light_2.position.set( 50, 50, 50 );
    scene.add( light_2 );

    stats = Stats();
    document.body.appendChild(stats.dom);

    const multiple_geometry = new THREE.CylinderBufferGeometry( 0, 10, 30, 4, 1 );
    const multiple_material = new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } );

    for ( let i = 0; i < 3000; i ++ ) {

        const mult_mesh = new THREE.Mesh( multiple_geometry, multiple_material );
        mult_mesh.position.x = Math.random() * 16000 - 8000;
        mult_mesh.position.y = 0;
        mult_mesh.position.z = Math.random() * 16000 - 8000;
        mult_mesh.updateMatrix();
        mult_mesh.matrixAutoUpdate = false;
        scene.add( mult_mesh );

    }

    //set up mouse stuff
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}

function updateCamera() {
    //offset the camera x/y based on the mouse's position in the window
    camera.position.x = cameraCenter.x - (cameraHorzLimit * mouse.x);
    camera.position.y = cameraCenter.y - (cameraVertLimit * mouse.y);    
}

let mx, my;

function onDocumentMouseMove(event) {
    event.preventDefault();
    mouse.x = ( (event.clientX / window.innerWidth) * 2 - 1) / 300;
    mouse.y = (-(event.clientY / window.innerHeight) * 2 + 1) / 200;

    mx = event.clientX;
    my = event.clientY;
    // console.log("mouse.x = " + mx);
    // console.log("  mouse.y = " + my);
}

function animate() {
    updateCamera();

    requestAnimationFrame(animate);
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;
    controls.update();
    render();
    stats.update();
}

function render() {
    renderer.render(scene, camera);
}