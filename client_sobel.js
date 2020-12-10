import * as THREE from '../build/three.module.js';

import Stats from './jsm/libs/stats.module.js';

import { GUI } from './jsm/libs/dat.gui.module.js';

import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { FirstPersonControls } from './jsm/controls/FirstPersonControls.js';

import { EffectComposer } from './jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './jsm/postprocessing/RenderPass.js';
import { ShaderPass } from './jsm/postprocessing/ShaderPass.js';

import { LuminosityShader } from './jsm/shaders/LuminosityShader.js';
import { SobelOperatorShader } from './jsm/shaders/SobelOperatorShader.js';

let container, stats;
let camera, scene, raycaster, renderer, composer, cube;

let effectSobel;

let counter, customPass;

let INTERSECTED;
let theta = 0;

const mouse = new THREE.Vector2();
const radius = 100;

const params = {
    enable: true
};

init();
//animate();

function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );
    
    //
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 200 );
    camera.position.set( 0, 10, 25 );
    camera.lookAt( scene.position );

    //

    const geometry = new THREE.TorusKnotBufferGeometry( 8, 3, 256, 32, 2, 3 );
    //const geometry = new THREE.BoxGeometry( 15, 15, 15 );
    //const material = new THREE.MeshPhongMaterial( { color: 0xffff00 } );
    const material = new THREE.MeshLambertMaterial( { color: 0xEC5C34 } );

    const mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    cube = mesh;

    //

    const ambientLight = new THREE.AmbientLight( 0xcccccc, 1 ); //0.4
    scene.add( ambientLight );

    const pointLight = new THREE.PointLight( 0xffffff, 1.8 );   //0.8
    camera.add( pointLight );
    
    mAudio();

    scene.add( camera );

    //
    raycaster = new THREE.Raycaster();

    //

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor (0x1c1020, 1);
    document.body.appendChild( renderer.domElement );

    // postprocessing COMPOSER

    composer = new EffectComposer( renderer );
    const renderPass = new RenderPass( scene, camera );
    composer.addPass( renderPass );

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

    //maSobel();

    // GUI
    const gui = new GUI();

    gui.add( params, 'enable' );
    gui.open();

    //
    stats = new Stats();
    container.appendChild( stats.dom );

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );

    //
    window.addEventListener( 'resize', onWindowResize, false );

    animate();

}

function maSobel() {
    // Sobel operator
    effectSobel = new ShaderPass( SobelOperatorShader );
    effectSobel.uniforms[ 'resolution' ].value.x = (window.innerWidth/1) * window.devicePixelRatio;
    effectSobel.uniforms[ 'resolution' ].value.y = (window.innerHeight/1) * window.devicePixelRatio;
    composer.addPass( effectSobel );

    const controls = new OrbitControls( camera, renderer.domElement );
    controls.minDistance = 1;
    controls.maxDistance = 100;
}

/**/
function mAudio(){
    // instantiate a listener
    const audioListener = new THREE.AudioListener();

    // add the listener to the camera
    camera.add( audioListener );

    // instantiate audio object
    const oceanAmbientSound = new THREE.Audio( audioListener );

    // add the audio object to the scene
    scene.add( oceanAmbientSound );

    // instantiate a loader
    const loader = new THREE.AudioLoader();

    // load a resource
    loader.load(
        // resource URL
        'music/bckgnd_music_01.mp3',

        // onLoad callback
        function ( audioBuffer ) {
            // set the audio object buffer to the loaded object
            oceanAmbientSound.setBuffer( audioBuffer );

            // play the audio
            oceanAmbientSound.play();
        },

        // onProgress callback
        function ( xhr ) {
            console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
        },

        // onError callback
        function ( err ) {
            console.log( 'An error happened' );
        }
    );
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
    composer.setSize( window.innerWidth, window.innerHeight );

    //effectSobel.uniforms[ 'resolution' ].value.x = window.innerWidth * window.devicePixelRatio;
    //effectSobel.uniforms[ 'resolution' ].value.y = window.innerHeight * window.devicePixelRatio;

}

function onDocumentMouseMove( event ) {

    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

function animate() {
    
    var timer = Date.now() * 0.0002;

    //window.addEventListener( 'mousemove', onMouseMove, false );

    requestAnimationFrame( animate );

    cube.rotation.x += 0.006;
    cube.rotation.y += 0.006;

    counter += 0.01;
    customPass.uniforms["amount"].value = counter;

    if ( params.enable === true ) {

        composer.render();

    } else {       

        renderer.render( scene, camera );

    }

    render();
    stats.update();

}


function render() {

    theta += 0.1;

    camera.position.x = radius * Math.sin( THREE.MathUtils.degToRad( theta ) );
    camera.position.y = radius * Math.sin( THREE.MathUtils.degToRad( theta ) );
    camera.position.z = radius * Math.cos( THREE.MathUtils.degToRad( theta ) );
    camera.lookAt( scene.position );

    camera.updateMatrixWorld();

    // find intersections

    raycaster.setFromCamera( mouse, camera );

    const intersects = raycaster.intersectObjects( scene.children );

    if ( intersects.length > 0 ) {

        if ( INTERSECTED != intersects[ 0 ].object ) {

            if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

            INTERSECTED = intersects[ 0 ].object;
            INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            INTERSECTED.material.emissive.setHex( 0xff0000 );

            console.log("holi");
            //mAudio();
            // play the audio
            /*function ( audioBuffer ) {
                // set the audio object buffer to the loaded object
                oceanAmbientSound.setBuffer( audioBuffer );
    
                // play the audio
                oceanAmbientSound.play();
            }*/
            // create an AudioListener and add it to the camera
            const listener = new THREE.AudioListener();
            camera.add( listener );

            // create a global audio source
            const sound = new THREE.Audio( listener );

            const audioLoader = new THREE.AudioLoader();
            audioLoader.load( 'music/bckgnd_music_01.mp3', function( buffer ) {
                sound.setBuffer( buffer );
                sound.setLoop( true );
                sound.setVolume( 0.5 );
                sound.play();
            });

        }

    } else {

        if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

        INTERSECTED = null;

    }

    renderer.render( scene, camera );

}