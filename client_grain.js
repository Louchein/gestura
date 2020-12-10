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
let camera, scene, raycaster, renderer, composer, cube, controls;

let effectSobel;

let counter, customPass;

const params = {
    enable: true
};

var cameraCenter = new THREE.Vector3();
var cameraHorzLimit = 50;
var cameraVertLimit = 50;
var mouse = new THREE.Vector2();

var angle = 0;
var radius = 500; 

init();
animate();

function init() {

    container = document.createElement( 'div' );    // for stats window I guess
    document.body.appendChild( container );
    
    //
    scene = new THREE.Scene();
    // scene.fog = new THREE.FogExp2( 0x000000, 0.0025 );

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 1000 );
    // camera.position.z = 2.2;
    camera.position.set( 0, 10, 35 );
    // camera.lookAt( scene.position );
    camera.lookAt (new THREE.Vector3(0,0,0));
    cameraCenter.x = camera.position.x;
    cameraCenter.y = camera.position.y;

    const listener = new THREE.AudioListener();
    camera.add( listener );
    
    //

    const geometry = new THREE.TorusKnotBufferGeometry( 8, 3, 256, 32, 2, 3 );
    //const geometry = new THREE.BoxGeometry( 15, 15, 15 );
    //const material = new THREE.MeshPhongMaterial( { color: 0xffff00 } );
    const material = new THREE.MeshLambertMaterial( { color: 0xEC5C34 } );
    const dark_material = new THREE.MeshLambertMaterial( { color: 0x1c1020 } );

    const mesh = new THREE.Mesh( geometry, material );
    // const mesh = new THREE.Mesh( geometry, dark_material );
    scene.add( mesh );

    cube = mesh;
    
    //
    const audioLoader = new THREE.AudioLoader();

    const sound = new THREE.PositionalAudio( listener );
    audioLoader.load( 'music/bckgnd_music_01.mp3', function ( buffer ) {

        sound.setBuffer( buffer );
        sound.setRefDistance( 20 );
        sound.setLoop(true);
        sound.setVolume(1.0);
        sound.play();

    } );
    // mesh.add( sound );  // esto es si queremos que sea relativo
    camera.add( sound );   // esto, si queremos que el sonido "siempre esté"
                
    //
    const ambientLight = new THREE.AmbientLight( 0xcccccc, 0.99 ); //0.4
    scene.add( ambientLight );

    const pointLight = new THREE.PointLight( 0xffffff, 1.0 );   //0.8
    camera.add( pointLight );

    
    //mAudio();

    scene.add( camera );

    //
    raycaster = new THREE.Raycaster();

    //
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor (0x120A14, 1);   // Background Color 
    document.body.appendChild( renderer.domElement );

    // postprocessing COMPOSER

    composer = new EffectComposer( renderer );
    const renderPass = new RenderPass( scene, camera );
    composer.addPass( renderPass );

    // const bloomPass = new BloomPass(
    //     1,    // strength
    //     25,   // kernel size
    //     4,    // sigma ?
    //     256,  // blur render target resolution
    // );
    // composer.addPass(bloomPass);

    //custom shader pass
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

    // color to grayscale conversion
    //const effectGrayScale = new ShaderPass( LuminosityShader );
    //composer.addPass( effectGrayScale );

    // you might want to use a gaussian blur filter before
    // the next pass to improve the result of the Sobel operator

    // maSobel();

    // GUI
    const gui = new GUI();

    gui.add( params, 'enable' );
    gui.open();

    //
    stats = new Stats();
    // container.appendChild( stats.dom );

    // Orbit controls
    controls = new OrbitControls( camera, renderer.domElement );
    // controls.minDistance = 1;
    // controls.maxDistance = 100;
    // controls.enabled = false;

    //set up mouse stuff
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    window.addEventListener( 'resize', onWindowResize, false );

    // pause / unpause bckgnd music
    const link = document.getElementById('eqlzr-img');
    link.addEventListener('click', event => {
        if (sound.isPlaying){
            sound.pause();
        } else{ sound.play(); }        
    });

}

function maSobel() {
    // Sobel operator
    effectSobel = new ShaderPass( SobelOperatorShader );
    effectSobel.uniforms[ 'resolution' ].value.x = (window.innerWidth/1) * window.devicePixelRatio;
    effectSobel.uniforms[ 'resolution' ].value.y = (window.innerHeight/1) * window.devicePixelRatio;
    composer.addPass( effectSobel );
}


function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
    composer.setSize( window.innerWidth, window.innerHeight );

    //effectSobel.uniforms[ 'resolution' ].value.x = window.innerWidth * window.devicePixelRatio;
    //effectSobel.uniforms[ 'resolution' ].value.y = window.innerHeight * window.devicePixelRatio;

}

function updateCamera() {
    //offset the camera x/y based on the mouse's position in the window
    camera.position.x = cameraCenter.x - (cameraHorzLimit * mouse.x);
    camera.position.y = cameraCenter.y - (cameraVertLimit * mouse.y);    
}

let mx, my;

function onDocumentMouseMove(event) {
    event.preventDefault();
    mouse.x = ( (event.clientX / window.innerWidth) * 2 - 1) / 4;
    mouse.y = (-(event.clientY / window.innerHeight) * 2 + 1) / 4;

    mx = event.clientX;
    my = event.clientY;
    // console.log("mouse.x = " + mx);
    // console.log("  mouse.y = " + my);
}

function animate() {
    updateCamera();

    requestAnimationFrame( animate );

    // cube.rotation.x += 0.006;
    // cube.rotation.y += 0.006;
    cube.rotation.z -= 0.003;

    // noise movement
    counter += 0.01;
    customPass.uniforms["amount"].value = counter;

    if ( params.enable === true ) {

        composer.render();
        // Orbit controls
        // controls.enabled = false;

    } else {       

        renderer.render( scene, camera );
        // controls.enabled = true;

    }

    controls.update();
    stats.update();
}