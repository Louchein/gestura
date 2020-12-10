import * as THREE from '../three.js-dev/build/three.module.js';

let scene, camera, renderer, cube, cube_1, cube_2, cube_3;

function init(){
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
        75, 
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    renderer = new THREE.WebGLRenderer( {antialias: true} );
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry( 2, 2, 2 );
    const material = new THREE.MeshPhongMaterial( {color: 0x0000ff} ); //0xffff00 //0x0000ff
    const line_material = new THREE.LineBasicMaterial( { color: 0xc92941 } );
    cube = new THREE.Mesh( geometry, material );
    scene.add( cube );
    // cube_1 = new THREE.Mesh( geometry, material );
    // scene.add( cube_1 );
    // cube_2 = new THREE.Mesh( geometry, material );
    // scene.add( cube_2 );
    // cube_3 = new THREE.Mesh( geometry, material );
    // scene.add( cube_3 );


    //Pull the camera back a bit
    camera.position.z = 5;

    const ambientLight = new THREE.AmbientLight( 0xcccccc, 1 );
    scene.add( ambientLight );

    const pointLight = new THREE.PointLight( 0xffffff, 2 );
    camera.add( pointLight );
    scene.add( camera );
}

function animate() {    // this is basically a loop
    requestAnimationFrame(animate);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render(scene, camera);
}

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize, false);

init();
animate();
