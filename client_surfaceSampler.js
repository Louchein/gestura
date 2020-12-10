import * as THREE from '../three.js-dev/build/three.module.js';

import { OrbitControls } from '../three.js-dev/examples/jsm/controls/OrbitControls.js';

import { ConvexBufferGeometry } from '../three.js-dev/examples/jsm/geometries/ConvexGeometry.js';

import { MeshSurfaceSampler } from '../three.js-dev/examples/jsm/math/MeshSurfaceSampler.js';
import { GLTFLoader } from '../three.js-dev/examples/jsm/loaders/GLTFLoader.js';
import Stats from '../three.js-dev/examples/jsm/libs/stats.module.js';
import { GUI } from '../three.js-dev/examples/jsm/libs/dat.gui.module.js';

let camera, scene, renderer, stats;

var cameraCenter = new THREE.Vector3();
var cameraHorzLimit = 50;
var cameraVertLimit = 50;
var mouse = new THREE.Vector2();

var angle = 0;
var radius = 500; 

const api = {

    count: 2000,
    distribution: 'random',
    resample: resample,
    surfaceColor: 0xFFF784,
    backgroundColor: 0xE39469,

};

let stemMesh, blossomMesh;
let stemGeometry, blossomGeometry;
let stemMaterial, blossomMaterial;

let sampler;
const count = api.count;
const ages = new Float32Array( count );
const scales = new Float32Array( count );
const dummy = new THREE.Object3D();

const _position = new THREE.Vector3();
const _normal = new THREE.Vector3();
const _scale = new THREE.Vector3();

var length = 20;
var height = 5;
var counter = 0;
// smooth my curve over this many points
var start = new THREE.Vector3((-length/2) +(counter*length), 0, 0);   // +(counter*length)
var middle = new THREE.Vector3(0 +(counter*length), height, 0);
var end = new THREE.Vector3((length/2) +(counter*length), 0, 0);    

var curveQuad = new THREE.QuadraticBezierCurve3(start, middle, end);  // Path    

// TubeGeometry(path : Curve, tubularSegments : Integer, radius : Float, radialSegments : Integer, closed : Boolean)
var tube = new THREE.TubeBufferGeometry(curveQuad,  //path : Curve,
                                    16,  //tubularSegments : Integer, [default is 64]
                                    0.5,  //radius : Float, [default is 1]
                                    16,  //radialSegments : Integer, [default is 8]
                                    false  //closed : Boolean [default is false]
                                ).toNonIndexed();

let surfaceGeometry = tube;

// let surfaceGeometry = new THREE.BoxBufferGeometry( 10, 10, 10 ).toNonIndexed();
// const surfaceGeometry = new THREE.TorusKnotBufferGeometry( 10, 3, 100, 16 ).toNonIndexed();
// const surfaceGeometry = new THREE.SphereBufferGeometry( 15, 16, 16).toNonIndexed();
const surfaceMaterial = new THREE.MeshLambertMaterial( { color: api.surfaceColor, wireframe: false } );
const surface = new THREE.Mesh( surfaceGeometry, surfaceMaterial );


// Source: https://gist.github.com/gre/1650294
const easeOutCubic = function ( t ) {

    return ( -- t ) * t * t + 1;

};

// Scaling curve causes particles to grow quickly, ease gradually into full scale, then
// disappear quickly. More of the particle's lifetime is spent around full scale.
const scaleCurve = function ( t ) {

    return Math.abs( easeOutCubic( ( t > 0.5 ? 1 - t : t ) * 2 ) );

};

const loader = new GLTFLoader();

loader.load( '../three.js-dev/examples/models/gltf/Flower/Flower.glb', function ( gltf ) {

    const _stemMesh = gltf.scene.getObjectByName( 'Stem' );
    const _blossomMesh = gltf.scene.getObjectByName( 'Blossom' );

    stemGeometry = new THREE.InstancedBufferGeometry();
    // stemGeometry = new THREE.BoxBufferGeometry();
    blossomGeometry = new THREE.InstancedBufferGeometry();

    THREE.BufferGeometry.prototype.copy.call( stemGeometry, _stemMesh.geometry );
    THREE.BufferGeometry.prototype.copy.call( blossomGeometry, _blossomMesh.geometry );

    const defaultTransform = new THREE.Matrix4()
        .makeRotationX( Math.PI )
        .multiply( new THREE.Matrix4().makeScale( 7, 7, 7 ) );

    stemGeometry.applyMatrix4( defaultTransform );
    blossomGeometry.applyMatrix4( defaultTransform );

    stemMaterial = _stemMesh.material;
    blossomMaterial = _blossomMesh.material;

    // Assign random colors to the blossoms.
    const _color = new THREE.Color();
    const color = new Float32Array( count * 3 );
    const blossomPalette = [ 0xF20587, 0xF2D479, 0xF2C879, 0xF2B077, 0xF24405 ];

    for ( let i = 0; i < count; i ++ ) {

        _color.setHex( blossomPalette[ Math.floor( Math.random() * blossomPalette.length ) ] );
        _color.toArray( color, i * 3 );

    }

    blossomGeometry.setAttribute( 'color', new THREE.InstancedBufferAttribute( color, 3 ) );
    blossomMaterial.vertexColors = true;

    stemMesh = new THREE.InstancedMesh( stemGeometry, stemMaterial, count );
    blossomMesh = new THREE.InstancedMesh( blossomGeometry, blossomMaterial, count );

    // Instance matrices will be updated every frame.
    stemMesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage );
    blossomMesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage );

    resample();

    init();
    animate();

} );

function init() {

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 100 );
    camera.position.set( 25, 25, 25 );
    // camera.lookAt( 0, 0, 0 );
    // camera.position.y = 160;
    // camera.position.z = 400;
    camera.lookAt (new THREE.Vector3(0,0,0));
    cameraCenter.x = camera.position.x;
    cameraCenter.y = camera.position.y;

    //

    scene = new THREE.Scene();
    scene.background = new THREE.Color( api.backgroundColor );

    const pointLight = new THREE.PointLight( 0xAA8899, 0.75 );
    pointLight.position.set( 50, - 25, 75 );
    scene.add( pointLight );

    scene.add( new THREE.HemisphereLight() );

    //

    scene.add( stemMesh );
    scene.add( blossomMesh );

    scene.add( surface );

    //

    const gui = new GUI();
    gui.add( api, 'count', 0, count ).onChange( function () {

        stemMesh.count = api.count;
        blossomMesh.count = api.count;

    } );

    // gui.addColor( api, 'backgroundColor' ).onChange( function () {

    // 	scene.background.setHex( api.backgroundColor );

    // } );

    // gui.addColor( api, 'surfaceColor' ).onChange( function () {

    // 	surfaceMaterial.color.setHex( api.surfaceColor );

    // } );

    gui.add( api, 'distribution' ).options( [ 'random', 'weighted' ] ).onChange( resample );
    gui.add( api, 'resample' );

    //

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    // Orbit controls
    const controls = new OrbitControls( camera, renderer.domElement );
    controls.minDistance = 1;
    controls.maxDistance = 100;

    //

    stats = new Stats();
    document.body.appendChild( stats.dom );

    //
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    window.addEventListener( 'resize', onWindowResize, false );

}

function resample() {

    const vertexCount = surface.geometry.getAttribute( 'position' ).count;

    console.info( 'Sampling ' + count + ' points from a surface with ' + vertexCount + ' vertices...' );

    //

    console.time( '.build()' );

    sampler = new MeshSurfaceSampler( surface )
        .setWeightAttribute( api.distribution === 'weighted' ? 'uv' : null )
        .build();

    console.timeEnd( '.build()' );

    //

    console.time( '.sample()' );

    for ( let i = 0; i < count; i ++ ) {

        ages[ i ] = Math.random();
        scales[ i ] = scaleCurve( ages[ i ] );

        resampleParticle( i );

    }

    console.timeEnd( '.sample()' );

    stemMesh.instanceMatrix.needsUpdate = true;
    blossomMesh.instanceMatrix.needsUpdate = true;

}

function resampleParticle( i ) {

    sampler.sample( _position, _normal );
    _normal.add( _position );

    dummy.position.copy( _position );
    dummy.scale.set( scales[ i ], scales[ i ], scales[ i ] );
    dummy.lookAt( _normal );
    dummy.updateMatrix();

    stemMesh.setMatrixAt( i, dummy.matrix );
    blossomMesh.setMatrixAt( i, dummy.matrix );

}

function updateParticle( i ) {

    // Update lifecycle.

    ages[ i ] += 0.005;

    if ( ages[ i ] >= 1 ) {

        ages[ i ] = 0.001;
        scales[ i ] = scaleCurve( ages[ i ] );

        resampleParticle( i );

        return;

    }

    // Update scale.

    const prevScale = scales[ i ];
    scales[ i ] = scaleCurve( ages[ i ] );
    _scale.set( scales[ i ] / prevScale, scales[ i ] / prevScale, scales[ i ] / prevScale );

    // Update transform.

    stemMesh.getMatrixAt( i, dummy.matrix );
    dummy.matrix.scale( _scale );
    stemMesh.setMatrixAt( i, dummy.matrix );
    blossomMesh.setMatrixAt( i, dummy.matrix );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function animate() {
    updateCamera();

    requestAnimationFrame( animate );

    render();

    stats.update();
}

function updateCamera() {
    //offset the camera x/y based on the mouse's position in the window
    camera.position.x = cameraCenter.x + (cameraHorzLimit * mouse.x);
    camera.position.y = cameraCenter.y + (cameraVertLimit * mouse.y);    
}

let mx, my;

function onDocumentMouseMove(event) {
    event.preventDefault();
    // mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    // mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    // camera.quaternion.y -= event.movementX * this.sensitivity/100000000;
    // camera.quaternion.x -= event.movementX * this.sensitivity/100000000;

    mx = (event.clientX / window.innerWidth) * 2 - 1;
    my = -(event.clientY / window.innerHeight) * 2 + 1;

    scene.rotation.x = (event.clientX / window.innerWidth) * 2 - 1;
    scene.rotation.y = -(event.clientY / window.innerHeight) * 2 + 1;
    console.log("mouse.x = " + mx);
    console.log("  mouse.y = " + my);
    renderer.render( scene, camera );
}

function render() {

    if ( stemMesh && blossomMesh ) {

        const time = Date.now() * 0.001;

        scene.rotation.x = Math.sin( time / 4 );
        scene.rotation.y = Math.sin( time / 2 );

        for ( let i = 0; i < api.count; i ++ ) {

            updateParticle( i );

        }

        stemMesh.instanceMatrix.needsUpdate = true;
        blossomMesh.instanceMatrix.needsUpdate = true;

    }

    renderer.render( scene, camera );

}