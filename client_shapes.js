import * as THREE from '../three.js-dev/build/three.module.js';

import Stats from '../three.js-dev/examples/jsm/libs/stats.module.js';
import { OrbitControls } from '../three.js-dev/examples/jsm/controls/OrbitControls.js';

let container, stats;

let camera, scene, renderer;

let group;

// let targetRotation = 0;
// let targetRotationOnPointerDown = 0;

// let pointerX = 0;
// let pointerXOnPointerDown = 0;

let windowHalfX = window.innerWidth / 2;

init();
animate();
function preset(){
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xf0f0f0 );

    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 10000 );
    camera.position.set( 0, 150, 500 );
    scene.add( camera );

    const light = new THREE.PointLight( 0xffffff, 0.8 );
    camera.add( light );

    group = new THREE.Group();
    group.position.y = 50;
    scene.add( group );
}

function init() {
    preset();    

    function addLineShape( shape, color, x, y, z, rx, ry, rz, s ) {

        // lines
        shape.autoClose = false;

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
        group.add( line );

        // vertices from real points
        let particles = new THREE.Points( geometryPoints, new THREE.PointsMaterial( { color: color, size: 4 } ) );
        particles.position.set( x, y, z + 75 );
        particles.rotation.set( rx, ry, rz );
        particles.scale.set( s, s, s );
        group.add( particles );

        // equidistance sampled points
        particles = new THREE.Points( geometrySpacedPoints, new THREE.PointsMaterial( { color: color, size: 4 } ) );
        particles.position.set( x, y, z + 125 );
        particles.rotation.set( rx, ry, rz );
        particles.scale.set( s, s, s );
        group.add( particles );
    }

    // SHAPES ----------------------------------------------------------------

    // California
    const californiaPts = [];

    californiaPts.push( new THREE.Vector2( 610, 320 ) );
    californiaPts.push( new THREE.Vector2( 450, 300 ) );
    californiaPts.push( new THREE.Vector2( 392, 392 ) );
    californiaPts.push( new THREE.Vector2( 266, 438 ) );
    californiaPts.push( new THREE.Vector2( 190, 570 ) );
    californiaPts.push( new THREE.Vector2( 190, 600 ) );
    californiaPts.push( new THREE.Vector2( 160, 620 ) );
    californiaPts.push( new THREE.Vector2( 160, 650 ) );
    californiaPts.push( new THREE.Vector2( 180, 640 ) );
    californiaPts.push( new THREE.Vector2( 165, 680 ) );
    californiaPts.push( new THREE.Vector2( 150, 670 ) );
    californiaPts.push( new THREE.Vector2( 90, 737 ) );
    californiaPts.push( new THREE.Vector2( 80, 795 ) );
    californiaPts.push( new THREE.Vector2( 50, 835 ) );
    californiaPts.push( new THREE.Vector2( 64, 870 ) );
    californiaPts.push( new THREE.Vector2( 60, 945 ) );
    californiaPts.push( new THREE.Vector2( 300, 945 ) );
    californiaPts.push( new THREE.Vector2( 300, 743 ) );
    californiaPts.push( new THREE.Vector2( 600, 473 ) );
    californiaPts.push( new THREE.Vector2( 626, 425 ) );
    californiaPts.push( new THREE.Vector2( 600, 370 ) );
    californiaPts.push( new THREE.Vector2( 610, 320 ) );

    for ( let i = 0; i < californiaPts.length; i ++ ) californiaPts[ i ].multiplyScalar( 0.25 );

    const californiaShape = new THREE.Shape( californiaPts );


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

    } )( roundedRectShape, 0, 0, 50, 80, 10 );


    // Circle
    const circleRadius = 60;
    const circleShape = new THREE.Shape()
        .moveTo( 0, circleRadius )
        .quadraticCurveTo( circleRadius, circleRadius, circleRadius, 0 )
        .quadraticCurveTo( circleRadius, - circleRadius, 0, - circleRadius )
        .quadraticCurveTo( - circleRadius, - circleRadius, - circleRadius, 0 )
        .quadraticCurveTo( - circleRadius, circleRadius, 0, circleRadius );


    // Spline shape
    const splinepts = [];
    splinepts.push( new THREE.Vector2( 70, 20 ) );
    splinepts.push( new THREE.Vector2( 80, 90 ) );
    splinepts.push( new THREE.Vector2( -10, 70 ) );
    // splinepts.push( new THREE.Vector2( 0, 0 ) );

    const splineShape = new THREE.Shape()
        .moveTo( 0, 0 )
        .splineThru( splinepts );

    const extrudeSettings = { depth: 8, 
                            bevelEnabled: true, 
                            bevelSegments: 2, 
                            steps: 2, 
                            bevelSize: 1, 
                            bevelThickness: 1 };


    //
    // const buff_geometry = new THREE.BufferGeometry();
    // // create a simple square shape. We duplicate the top left and bottom right
    // // vertices because each vertex needs to appear once per triangle.
    // const vertices = new Float32Array( [
    //     -100.0, -100.0,  100.0,
    //     100.0, -100.0,  100.0,
    //     100.0,  100.0,  100.0,

    //     100.0,  100.0,  100.0,
    //     -100.0,  100.0,  100.0,
    //     -100.0, -100.0,  100.0,

    //     -100.0,  100.0,  100.0,
    //     200.0, 200.0,  200.0,
    //     100.0,  100.0,  100.0
    // ] );

    // // itemSize = 3 because there are 3 values (components) per vertex
    // buff_geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    // const buff_material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
    // const buff_mesh = new THREE.Mesh( buff_geometry, buff_material );

    const buff_geometry = new THREE.Geometry();

    buff_geometry.vertices.push(
        new THREE.Vector3( -10,  10, 0 ),
        new THREE.Vector3( -10, -10, 0 ),
        new THREE.Vector3(  10, -10, 0 ),
        
        new THREE.Vector3( 8, 10, -10 ),
        new THREE.Vector3( -10,  10, 0 ),
        new THREE.Vector3(  10, -10, 0 )
    );

    buff_geometry.faces.push( new THREE.Face3( 0, 1, 2 ) );
    buff_geometry.faces.push( new THREE.Face3( 3, 4, 5 ) );
	
    var bufferGeometry = new THREE.BufferGeometry().fromGeometry(buff_geometry);

    const buff_material = new THREE.MeshLambertMaterial( { color: 0xff0000 } );
    const buff_mesh = new THREE.Mesh( bufferGeometry, buff_material );

    // scene.add(buff_mesh);


    var genPanes = function (count) {
 
        var geometry = new THREE.Geometry(),
 
        offset,
        pane,
        x = 0,
        y = 0,
        z = 0;
 
        count = count || 6;
 
        // generate vertices
        pane = 0;
        while (pane < count) {
 
            var i = 0,
            per = pane / count,
            len = 4;
            while (i < len) {
 
                x = Math.floor(i % 2) + pane * 1.5;
                y = Math.floor(i / 2);
                z = pane * per;
 
                geometry.vertices.push(new THREE.Vector3(x, y, z));
 
                i += 1;
            }
 
            pane += 1;
        }
 
        // generate faces
        pane = 0;
        while (pane < count) {
 
            offset = pane * 4;
 
            geometry.faces.push(
                new THREE.Face3(0 + offset, 1 + offset, 2 + offset),
                new THREE.Face3(3 + offset, 2 + offset, 1 + offset));
            pane += 1;
        }
 
        // compute Normals
        geometry.computeVertexNormals();
 
        // normalize the geometry
        geometry.normalize();
 
        return geometry;
 
    };

    // MESH with Geometry, and Basic Material
    scene.add(new THREE.Mesh(
 
        genPanes(20),

        // Material
        new THREE.MeshNormalMaterial({
            side: THREE.DoubleSide
        })));



    // addShape( shape, color, x, y, z, rx, ry,rz, s );
    
    addLineShape( californiaShape, 0xf08000, - 250, - 100, 0, 0, 0, 0, 1 );
    addLineShape( roundedRectShape, 0x008000, - 100, 150, 0, 0, 0, 0, 1 );
    addLineShape( circleShape, 0x00f000, 120, 150, 0, 0, 0, 0, 1 );
    addLineShape( splineShape, 0x808080, - 50, 0, 0, 0, 0, 0, 1 );
    addLineShape( splineShape, 0x808080, - 50, 0, 0, 0, 0, 0, 1 );


    //

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    // Orbit controls
    const controls = new OrbitControls( camera, renderer.domElement );
    controls.minDistance = 0.01;
    controls.maxDistance = 100000;

    stats = new Stats();
    container.appendChild( stats.dom );

    // container.style.touchAction = 'none';
    // container.addEventListener( 'pointerdown', onPointerDown, false );

    //

    window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

//

// function onPointerDown( event ) {

//     if ( event.isPrimary === false ) return;

//     pointerXOnPointerDown = event.clientX - windowHalfX;
//     targetRotationOnPointerDown = targetRotation;

//     document.addEventListener( 'pointermove', onPointerMove, false );
//     document.addEventListener( 'pointerup', onPointerUp, false );

// }

// function onPointerMove( event ) {

//     if ( event.isPrimary === false ) return;

//     pointerX = event.clientX - windowHalfX;

//     targetRotation = targetRotationOnPointerDown + ( pointerX - pointerXOnPointerDown ) * 0.02;

// }

// function onPointerUp() {

//     if ( event.isPrimary === false ) return;

//     document.removeEventListener( 'pointermove', onPointerMove );
//     document.removeEventListener( 'pointerup', onPointerUp );

// }

//

function animate() {

    requestAnimationFrame( animate );

    render();
    stats.update();

}

function render() {

    // group.rotation.y += ( targetRotation - group.rotation.y ) * 0.05;
    renderer.render( scene, camera );

}