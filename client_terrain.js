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
let camera, scene, raycaster, renderer, composer, cube;

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
    
    //
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.set( 0, 10, 25 );
    camera.lookAt( scene.position );

    //

    const geometry = new THREE.TorusKnotBufferGeometry( 8, 3, 256, 32, 2, 3 );
    //const geometry = new THREE.BoxGeometry( 15, 15, 15 );
    //const material = new THREE.MeshPhongMaterial( { color: 0xffff00 } );
    const material = new THREE.MeshLambertMaterial( { color: 0xEC5C34 } );
    const dark_material = new THREE.MeshLambertMaterial( { color: 0x1c1020 } );

    const mesh = new THREE.Mesh( geometry, dark_material );
    scene.add( mesh );

    cube = mesh;

    const sphere_geometry = new THREE.SphereGeometry( 15, 64, 64 );
    const sphere_material = new THREE.MeshLambertMaterial( { color: 0xEC5C34 } );
    const sphere = new THREE.Mesh( sphere_geometry, sphere_material );
    //scene.add( sphere );


    //
    const divider = 2;
    const ambientLight = new THREE.AmbientLight( 0xcccccc, 1/divider ); //0.4
    scene.add( ambientLight );

    const pointLight = new THREE.PointLight( 0xffffff, 1.8/divider );   //0.8
    camera.add( pointLight );
    
    //mAudio();

    scene.add( camera );

    // Terrain
    var onRenderFcts= [];

    //scene.fog = new THREE.Fog(0x000, 0, 45);
	(function(){
		var light	= new THREE.AmbientLight( 0x202020 )
		scene.add( light )
		var light	= new THREE.DirectionalLight('white', 5)
		light.position.set(0.5, 0.0, 2)
		scene.add( light )
		var light	= new THREE.DirectionalLight('white', 0.75*2)
		light.position.set(-0.5, -0.5, -2)
		scene.add( light )
	})();
    var heightMap = THREEx.Terrain.allocateHeightMap(256,256)
                    THREEx.Terrain.simplexHeightMap(heightMap);
                    
	var terr_geometry = THREEx.Terrain.heightMapToPlaneGeometry(heightMap)
                        THREEx.Terrain.heightMapToVertexColor(heightMap, terr_geometry);
                        
    /* Wireframe built-in color is white, no need to change that */
	var terr_material = new THREE.MeshBasicMaterial({ wireframe: true });
	var terr_mesh = new THREE.Mesh( terr_geometry, terr_material );
	//scene.add( terr_mesh );

    terr_mesh.lookAt(new THREE.Vector3(0,1,0));

    /* Play around with the scaling */
	terr_mesh.scale.y	= 3.5;
	terr_mesh.scale.x	= 3;
	terr_mesh.scale.z	= 0.06;
	terr_mesh.scale.multiplyScalar(10);

    /* Play around with the camera
	onRenderFcts.push(function(delta, now){
		terr_mesh.rotation.z += 0.2 * delta;	
	})
	onRenderFcts.push(function(){
		renderer.render( scene, camera );		
	})
	var lastTimeMsec= null
	requestAnimationFrame(function animate_terr(nowMsec){
		requestAnimationFrame( animate_terr );
		lastTimeMsec	= lastTimeMsec || nowMsec-1000/60
		var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec)
		lastTimeMsec	= nowMsec
		onRenderFcts.forEach(function(onRenderFct){
			onRenderFct(deltaMsec/1000, nowMsec/1000)
		})
	})*/


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

    //maSobel();

    // Orbit controls
    const controls = new OrbitControls( camera, renderer.domElement );
    controls.minDistance = 1;
    controls.maxDistance = 100;

    // GUI
    const gui = new GUI();

    gui.add( params, 'enable' );
    gui.open();

    //
    stats = new Stats();
    container.appendChild( stats.dom );

    //
    window.addEventListener( 'resize', onWindowResize, false );

}

function maSobel() {
    // Sobel operator
    effectSobel = new ShaderPass( SobelOperatorShader );
    effectSobel.uniforms[ 'resolution' ].value.x = (window.innerWidth/1) * window.devicePixelRatio;
    effectSobel.uniforms[ 'resolution' ].value.y = (window.innerHeight/1) * window.devicePixelRatio;
    composer.addPass( effectSobel );
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


function animate() {

    requestAnimationFrame( animate );

    cube.rotation.x += 0.006;
    cube.rotation.y += 0.006;

    counter += 0.01;
    customPass.uniforms["amount"].value = counter;

    if ( params.enable === true ) {

        try{composer.render();}catch{}

    } else {       

        renderer.render( scene, camera );

    }

    stats.update();

}