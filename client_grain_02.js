import * as THREE from 'three.js-dev/build/three.module.js';

import Stats from 'three.js-dev/examples/jsm/libs/stats.module.js';

import { GUI } from 'three.js-dev/examples/jsm/libs/dat.gui.module.js';

import { OrbitControls } from 'three.js-dev/examples/jsm/controls/OrbitControls.js';
import { FirstPersonControls } from 'three.js-dev/examples/jsm/controls/FirstPersonControls.js';

import { EffectComposer } from 'three.js-dev/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three.js-dev/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three.js-dev/examples/jsm/postprocessing/ShaderPass.js';

import { LuminosityShader } from 'three.js-dev/examples/jsm/shaders/LuminosityShader.js';
import { SobelOperatorShader } from 'three.js-dev/examples/jsm/shaders/SobelOperatorShader.js';

let container, stats;
let camera, scene, raycaster, renderer, composer, cube, mesh, mesh2, controls, rand;

let group;

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

    const geometry_1 = new THREE.TorusKnotBufferGeometry( 8, 3, 256, 32, 2, 3 );
    const geometry_2 = new THREE.TorusKnotBufferGeometry( 8, 3, 256, 32, 2, 3 );
    //const geometry = new THREE.BoxGeometry( 15, 15, 15 );
    //const material = new THREE.MeshPhongMaterial( { color: 0xffff00 } );
    const material = new THREE.MeshLambertMaterial( { color: 0xEC5C34, 
                                                    opacity: 0.01, 
                                                    transparent: true,
                                                    emissive: 0xf99e4d,
                                                    emissiveIntensity: 0.5
                                                } );
    const dark_material = new THREE.MeshLambertMaterial( { color: 0x1c1020 } );

    // const mesh = new THREE.Mesh( geometry, material );
    mesh = new THREE.Mesh( geometry_1, dark_material );
    scene.add( mesh );
    
    // var mesh = new THREE.Mesh( geometry, material1 ); // transparent false
    // scene.add( mesh );

    mesh2 = new THREE.Mesh( geometry_2, material ); // transparent true, opacity 0
    scene.add( mesh2 );

    //mesh2.onBeforeRender = function ( renderer ) { renderer.clearDepth(); }; // optional

    var tween = new TWEEN.Tween( mesh2.material )
        .to( { opacity: 1 }, 15000 )
        .delay( 1500 )
        .start();

    // var tween_2 = new TWEEN.Tween( mesh.material )
    //     .to( { opacity: 0.0 }, 1500 )
    //     .delay( 1500 )
    //     .start();

    cube = mesh;
    

    group = new THREE.Group();
    group.position.y = 50;
    scene.add( group );
    
    function addLineShape( shape, color, x, y, z, rx, ry, rz, s ) {

        // lines
        shape.autoClose = true;

        const points = shape.getPoints();
        const spacedPoints = shape.getSpacedPoints( 40 ); // Three.js ya nos da el método para sacar 
                                                          // los spaced points :)

        const geometryPoints = new THREE.BufferGeometry().setFromPoints( points );
        const geometrySpacedPoints = new THREE.BufferGeometry().setFromPoints( spacedPoints );

        // solid line
        let line = new THREE.Line( geometryPoints, new THREE.LineBasicMaterial( { color: color } ) );
        line.position.set( x, y, z - 25 );
        line.rotation.set( rx, ry, rz );
        line.scale.set( s, s, s );
        group.add( line );

        // line from equidistance sampled points
        line = new THREE.Line( geometrySpacedPoints, new THREE.LineBasicMaterial( { color: color } ) );
        line.position.set( x, y, z + 25 );
        line.rotation.set( rx, ry, rz );
        line.scale.set( s, s, s );
        // group.add( line );

        // vertices from real points
        let particles = new THREE.Points( geometryPoints, new THREE.PointsMaterial( { color: color, size: 4 } ) );
        particles.position.set( x, y, z + 75 );
        particles.rotation.set( rx, ry, rz );
        particles.scale.set( s, s, s );
        // group.add( particles );

        // equidistance sampled points
        particles = new THREE.Points( geometrySpacedPoints, new THREE.PointsMaterial( { color: color, size: 4 } ) );
        particles.position.set( x, y, z + 125 );
        particles.rotation.set( rx, ry, rz );
        particles.scale.set( s, s, s );
        group.add( particles );
    }

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
    // mesh.add( sound );  // esto es si queremos que sea relativo, que emita desde un objeto espcífico
    camera.add( sound );   // esto, si queremos que el sonido "siempre esté"
                
    //
    const ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 ); //0.4
    scene.add( ambientLight );

    const pointLight = new THREE.PointLight( 0xffffff, 0.6 );   //0.8
    camera.add( pointLight );

    scene.add( camera );


    // Rounded rectangle
    const roundedRectShape = new THREE.Shape();

    ( function roundedRect( ctx, x, y, width, height, radius ) {

        ctx.moveTo( x, y + radius );
        ctx.lineTo( x, y + height - radius );
        ctx.quadraticCurveTo( x, y + height, x + radius, y + height );
        ctx.lineTo( x + width - radius, y + height );
        ctx.quadraticCurveTo( x + width, y + height, x + width, y + height - radius );
        ctx.lineTo( x + width, y + radius );
        ctx.quadraticCurveTo( x + width, y, x + width - radius, y );
        ctx.lineTo( x + radius, y );
        ctx.quadraticCurveTo( x, y, x, y + radius );

    } )( roundedRectShape, -33, -34, 70, 80, 30 );


    // Circle
    const circleRadius = 60;
    const circleShape = new THREE.Shape()
        .moveTo( 0, circleRadius )
        .quadraticCurveTo( circleRadius, circleRadius, circleRadius, 0 )
        .quadraticCurveTo( circleRadius, - circleRadius, 0, - circleRadius )
        .quadraticCurveTo( - circleRadius, - circleRadius, - circleRadius, 0 )
        .quadraticCurveTo( - circleRadius, circleRadius, 0, circleRadius );

    // ( shape, color, x, y, z, rx, ry, rz, s ) 
    addLineShape( roundedRectShape, 0x3d3d3d, -1.5, -55, 20, 0, 0, 0, 0.6 );
    addLineShape( circleShape,      0x2d2d2d, 0, -50, 10, 0, 0, 0, 0.4 );
    addLineShape( circleShape,      0x2d2d2d, 0, -50, 0, 0, 0, 0, 0.4 );


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

    //custom shader pass for noise
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

    // maSobel();

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
    
    rand = Math.random();
    // cube.rotation.x += 0.006;
    // cube.rotation.y += 0.006;
    cube.rotation.z -= 0.001;
    mesh2.rotation.z -= 0.001;

    // if (rand > 0.97){
    //     cube.rotation.x -= (rand*0.07);
    //     mesh2.rotation.x -= (rand*0.07);
    // } else if(rand > 0.5){
    //     cube.rotation.x -= (rand*0.01);
    //     mesh2.rotation.x -= (rand*0.01);
    // } else if(rand > 0.04){
    //     cube.rotation.x += (rand*0.005);
    //     mesh2.rotation.x += (rand*0.005);
    // } else{
    //     cube.rotation.x += (rand*0.1);
    //     mesh2.rotation.x += (rand*0.1);
    // }
    
    // if (rand > 0.97){
    //     cube.rotation.y -= (rand*0.07);
    //     mesh2.rotation.y -= (rand*0.07);
    // } else if(rand > 0.5){
    //     cube.rotation.y -= (rand*0.01);
    //     mesh2.rotation.y -= (rand*0.01);
    // } else if(rand > 0.04){
    //     cube.rotation.y += (rand*0.005);
    //     mesh2.rotation.y += (rand*0.005);
    // } else{
    //     cube.rotation.y += (rand*0.1);
    //     mesh2.rotation.y += (rand*0.1);
    // }

    // cube.rotation.x += rand;
    // mesh.rotation.y -= rand;
    // mesh.rotation.y -= -rand;
    console


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
    // stats.update();
    TWEEN.update();
}