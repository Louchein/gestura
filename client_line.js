import * as THREE from '../three.js-dev/build/three.module.js';

let scene, camera, renderer, cube;

function init(){
    const material = new THREE.LineBasicMaterial({
        color: 0x0000ff
    });

    const points = [];
    points.push( new THREE.Vector3( - 10, 0, 0 ) );
    points.push( new THREE.Vector3( 0, 10, 0 ) );
    points.push( new THREE.Vector3( 10, 0, 0 ) );

    //const geometry = new THREE.BufferGeometry().setFromPoints( points );
    const geometry = new THREE.TorusKnotBufferGeometry( 8, 3, 256, 32, 2, 3 );

    var line = new THREE.Line( geometry, material );
    scene.add( line );
}   

function animate() {    // this is basically a loop
    requestAnimationFrame(animate);

    /*cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;*/

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