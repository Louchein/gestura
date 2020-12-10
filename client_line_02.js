import * as THREE from '../three.js-dev/build/three.module.js';

import Stats from '../three.js-dev/examples/jsm/libs/stats.module.js';

import { GUI } from '../three.js-dev/examples/jsm/libs/dat.gui.module.js';

import { OrbitControls } from '../three.js-dev/examples/jsm/controls/OrbitControls.js';
import { FirstPersonControls } from '../three.js-dev/examples/jsm/controls/FirstPersonControls.js';

import { EffectComposer } from '../three.js-dev/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../three.js-dev/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from '../three.js-dev/examples/jsm/postprocessing/ShaderPass.js';

import { LuminosityShader } from '../three.js-dev/examples/jsm/shaders/LuminosityShader.js';
import { SobelOperatorShader } from '../three.js-dev/examples/jsm/shaders/SobelOperatorShader.js';

let container, stats;
let camera, scene, raycaster, renderer, composer, cube, line;

let effectSobel;

let counter, customPass;

const params = {
    enable: true
};

init();
animate();

function init() {

    container = document.createElement( 'div' );    // for stats window I guess
    //document.body.appendChild( container );
    
    // SCENE
    scene = new THREE.Scene();

    // CAMERA
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.set( 0, 10, 25 );
    camera.lookAt( scene.position );

    // SHAPES
    const geometry = new THREE.TorusKnotBufferGeometry( 8, 3, 256, 32, 2, 3 );
    //const geometry = new THREE.BoxGeometry( 15, 15, 15 );
    //const material = new THREE.MeshPhongMaterial( { color: 0xffff00 } );
    const material = new THREE.MeshLambertMaterial( { color: 0xEC5C34 } );
    const dark_material = new THREE.MeshLambertMaterial( { color: 0x1c1020 } );

    const mesh = new THREE.Mesh( geometry, dark_material );
    scene.add( mesh );

    cube = mesh;


    //create a blue LineBasicMaterial
    const line_material = new THREE.LineBasicMaterial( { color: 0xc92941 } );

    const points = [];
    points.push( new THREE.Vector3( 0, 0, 0 ) );
    points.push( new THREE.Vector3( 5, 0, 0 ) );
    points.push( new THREE.Vector3( 0, 0, 0 ) );
    points.push( new THREE.Vector3( 0, 10, 0 ) );
    points.push( new THREE.Vector3( 0, 0, 0 ) );
    points.push( new THREE.Vector3( 0, 0, 15 ) );
    // points.push( new THREE.Vector2( ) );
    // const a = new THREE.Vector4( 0, 100, 0, 0 );

    const line_geometry = new THREE.BufferGeometry().setFromPoints( points );

    line = new THREE.Line( line_geometry, line_material );
    scene.add( line );

    
    const sphere_geometry = new THREE.SphereGeometry( 15, 64, 64 );
    const sphere_material = new THREE.MeshLambertMaterial( { color: 0xEC5C34 } );
    const sphere = new THREE.Mesh( sphere_geometry, sphere_material );
    //scene.add( sphere );


    // LIGHTING
    const divider = 2;
    const ambientLight = new THREE.AmbientLight( 0xcccccc, 1/divider ); //0.4
    scene.add( ambientLight );

    const pointLight = new THREE.PointLight( 0xffffff, 1.8/divider );   //0.8
    camera.add( pointLight );
    
    scene.add( camera );

    //
    raycaster = new THREE.Raycaster();

    //
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    //renderer.setClearColor (0x1C1020, 1);   // Background Color 
    renderer.setClearColor (0x120A14, 1);   // Background Color 
    document.body.appendChild( renderer.domElement );

    // postprocessing COMPOSER

    composer = new EffectComposer( renderer );
    const renderPass = new RenderPass( scene, camera );
    composer.addPass( renderPass );

    //custom NOISE shader pass
    var vertShader = document.getElementById('vertexShader').textContent;
    var fragShader = document.getElementById('fragmentShader').textContent;
    counter = 0.0;
    var myEffect = {
        uniforms: {
            "tDiffuse": { value: null },
            "amount": { value: counter }
        },
        vertexShader: vertShader,
        fragmentShader: fragShader
    }

    customPass = new ShaderPass(myEffect);
    customPass.renderToScreen = true;
    composer.addPass(customPass);


    // Orbit controls
    const controls = new OrbitControls( camera, renderer.domElement );
    controls.minDistance = 1;
    controls.maxDistance = 100;


    //
    window.addEventListener( 'resize', onWindowResize, false );

}


function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
    composer.setSize( window.innerWidth, window.innerHeight );

    //effectSobel.uniforms[ 'resolution' ].value.x = window.innerWidth * window.devicePixelRatio;
    //effectSobel.uniforms[ 'resolution' ].value.y = window.innerHeight * window.devicePixelRatio;
}


function animate() {

    requestAnimationFrame( animate );

    cube.rotation.x += 0.006;
    cube.rotation.y += 0.006;

    line.rotation.x += 0.006;
    line.rotation.y += 0.006;

    // for NOISE shader pass
    counter += 0.01;
    customPass.uniforms["amount"].value = counter;

    if ( params.enable === true ) {

        try{composer.render();}catch{}

    } else {       

        renderer.render( scene, camera );

    }

    stats.update();

}