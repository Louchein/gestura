import * as THREE from '../three.js-dev/build/three.module.js';

import { OrbitControls } from '../three.js-dev/examples/jsm/controls/OrbitControls.js';

import { ConvexBufferGeometry } from '../three.js-dev/examples/jsm/geometries/ConvexGeometry.js';

let group, camera, scene, renderer, controls;

var cameraCenter = new THREE.Vector3();
var cameraHorzLimit = 50;
var cameraVertLimit = 50;
var mouse = new THREE.Vector2();

var angle = 0;
var radius = 500; 

init();
animate();

function init() {

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    // camera

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    // camera.position.set( 15, 20, 30 );
    // camera.position.y = 160;
    camera.position.z = 40;
    camera.lookAt (new THREE.Vector3(0,0,0));
    cameraCenter.x = camera.position.x;
    cameraCenter.y = camera.position.y;

    scene.add( camera );

    // orbit controls
    controls = new OrbitControls( camera, renderer.domElement );
    // controls.enableDamping = true;
    // controls.dampingFactor = 0.06;
    // controls.minDistance = 20;
    // controls.maxDistance = 50;
    // controls.screenSpacePanning = false;
    // controls.maxPolarAngle = Math.PI / 2;

    // light
    scene.add( new THREE.AmbientLight( 0x222222 ) );
    
    const light = new THREE.PointLight( 0xffffff, 1 );
    // camera.add( light );

    // helper

    scene.add( new THREE.AxesHelper( 20 ) );

    // textures

    const loader = new THREE.TextureLoader();
    // const texture = loader.load( '../three.js-dev/examples/textures/sprites/snowflake7_alpha.png' );
    const texture = loader.load( './logos/gesto_02.png' );

    group = new THREE.Group();
    scene.add( group );

    // points

    const vertices = new THREE.DodecahedronGeometry( 10 ).vertices;

    for ( let i = 0; i < vertices.length; i ++ ) {

        // vertices[ i ].add( randomPoint().multiplyScalar( 2 ) ); // wiggle the points

    }

    const pointsMaterial = new THREE.PointsMaterial( {

        // color: 0x0080ff,
        map: texture,
        size: 10,
        alphaTest: 0.6

    } );

    const pointsGeometry = new THREE.BufferGeometry().setFromPoints( vertices );

    const points = new THREE.Points( pointsGeometry, pointsMaterial );
    group.add( points );

    // convex hull

    const meshMaterial = new THREE.MeshLambertMaterial( {
        color: 0xffffff,
        opacity: 0.2,
        transparent: true
    } );

    const meshGeometry = new ConvexBufferGeometry( vertices );

    const mesh1 = new THREE.Mesh( meshGeometry, meshMaterial );
    // mesh1.material.side = THREE.BackSide; // back faces
    // mesh1.renderOrder = 0;
    group.add( mesh1 );

    const mesh2 = new THREE.Mesh( meshGeometry, meshMaterial.clone() );
    mesh2.material.side = THREE.FrontSide; // front faces
    mesh2.renderOrder = 1;
    // group.add( mesh2 );


    const geometry = new THREE.CylinderBufferGeometry( 0, 10, 30, 4, 1 );
    const material = new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } );

    for ( let i = 0; i < 3000; i ++ ) {

        const mesh = new THREE.Mesh( geometry, material );
        mesh.position.x = Math.random() * 16000 - 8000;
        mesh.position.y = 0;
        mesh.position.z = Math.random() * 16000 - 8000;
        mesh.updateMatrix();
        mesh.matrixAutoUpdate = false;
        scene.add( mesh );

    }
    

    //set up mouse stuff
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    window.addEventListener( 'resize', onWindowResize, false );

    var gridXZ = new THREE.GridHelper(1000, 20);
    // gridXZ.setColors( new THREE.Color(0xff0000), new THREE.Color(0xffffff) );
    scene.add(gridXZ);
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
    mouse.x = ( (event.clientX / window.innerWidth) * 2 - 1) / 10;
    mouse.y = (-(event.clientY / window.innerHeight) * 2 + 1) / 10;
    // camera.quaternion.y -= event.movementX * this.sensitivity/10;
    // camera.quaternion.x -= event.movementX * this.sensitivity/10;

    mx = (event.clientX / window.innerWidth) * 2 - 1;
    my = -(event.clientY / window.innerHeight) * 2 + 1;
    console.log("mouse.x = " + mx);
    console.log("  mouse.y = " + my);
}


function animate() {
    updateCamera();

    requestAnimationFrame( animate );

    // controls.update();

    // group.rotation.y += 0.005;

    controls.update();
    render();

}



function render() {
    renderer.render( scene, camera );
}