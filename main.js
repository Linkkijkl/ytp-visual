/*
ATK-YTP 24 juttu
author: Vili Kärkkäinen
monitor texture: Jami Virtanen
*/

import * as THREE from 'three';

// If for some reason the loader is in a different place,
// try the another import. For me the one above worked on 
// linux and the one below on windows.
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
// import { OBJLoader } from 'three/addons/loaders/OBJloader.js';

// Degrees to radians.
const dtr = 3.1415/180;

// Aspect ratio
var aspect = window.innerWidth / window.innerHeight;
// to use when sceen changes size
window.addEventListener( 'resize', resize_callback, false );
function resize_callback(){

    aspect = window.innerWidth / window.innerHeight;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );

}


// The three.js scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffc1cc);

// The three.js camera
const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 100);
camera.position.z = 2.5;
camera.position.y = 1;

// The three.js renderer
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// The render target for camera 2, for the monitor
var render_target = new THREE.WebGLRenderTarget(120, 120);
render_target.texture.magFilter = THREE.NearestFilter;
render_target.texture.minFilter = THREE.NearestFilter;
var cam2 = new THREE.PerspectiveCamera(75, 4/3, 1, 100);
cam2.position.set(0, 2, -7);

// LIGHTS
var directionalLight1 = new THREE.DirectionalLight( 0xffff00, 1 );
directionalLight1.position.set(-2,2,2);
directionalLight1.castShadow = true;
scene.add( directionalLight1 );

var directionalLight2 = new THREE.DirectionalLight( 0xff00ff, 1 );
directionalLight2.position.set(2,2,-2);
directionalLight2.castShadow = true;
scene.add( directionalLight2 );

var directionalLight3 = new THREE.DirectionalLight( 0x00ffff, 1 );
directionalLight3.position.set(-2,2,-2);
directionalLight3.castShadow = true;
scene.add( directionalLight3 );

var directionalLight4 = new THREE.DirectionalLight( 0xffffff, 1 );
directionalLight4.position.set(2,2,2);
directionalLight4.castShadow = true;
scene.add( directionalLight4 );

var ambient = new THREE.AmbientLight(0xffc1cc, 1);
scene.add(ambient);

// PLANE
var planeGeometry = new THREE.PlaneGeometry( 20, 20, 1, 1 );
// Spoof texture so that uv's are in use
const spoof = new THREE.Texture();
var plane_material = new THREE.MeshPhongMaterial({map: spoof});
// inject custom glsl (might want to improve)
plane_material.onBeforeCompile = function(shader) {
    shader.fragmentShader = shader.fragmentShader.replace(
        '#include <map_fragment>',
        [
            '#ifdef USE_MAP',
            'vec4 col1 = vec4(1.0f, 1.0f, 1.0f, 1.0f);',
            'vec4 col2 = vec4(0.0f, 0.0f, 0.0f, 1.0f);',
            'diffuseColor = (int(floor(vMapUv.x * 10.0)) % 2 == 0) ? col1 : col2;',
            'diffuseColor = (int(floor(vMapUv.y * 10.0)) % 2 == 0) ? diffuseColor : vec4(1.0) - diffuseColor;',
            '#endif'
        ].join( '\n' )
    );
};
var plane = new THREE.Mesh( planeGeometry, plane_material );
plane.receiveShadow = true;
plane.rotation.x = -90 * dtr;
scene.add( plane );

// MONITOR
var monitor_group = new THREE.Group();

// Monitor power light cube
var monitor_power_light = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.05, 0.05), 
    new THREE.MeshBasicMaterial({color: 0x66ff00})
);
monitor_power_light.position.set(0.65,0.57,0.82);
monitor_group.add(monitor_power_light);
// Monitor power light light
var monitor_power_light_L = new THREE.PointLight(0x66ff00, 0.03, 0.2);
monitor_power_light_L.position.set(0.65,0.57,0.85);
monitor_group.add(monitor_power_light_L);

// monitor screen materials
// ytp-texture
var monitor_material1 = new THREE.MeshBasicMaterial(
    {map: new THREE.TextureLoader().load("jami.png")}
);
// render target texutre (from cam2)
var monitor_material3 = new THREE.MeshBasicMaterial({
    map: render_target.texture
});

// Monitor screen
var monitor_screen = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5,1.2,1,1),
    monitor_material1
);
monitor_screen.position.set(0, 1.27, 0.67);
monitor_screen.rotation.x = -8.2 * dtr;
monitor_group.add(monitor_screen);

// Load the monitor shell obj file
var monitor_loaded = false;
const obj_loader = new OBJLoader();
obj_loader.load('/monitori.obj',
    function ( obj ) {
        var monitor_material = new THREE.MeshPhongMaterial( { color: 0xF5F5DC } );
        obj.traverse( function( child ) {
            if ( child instanceof THREE.Mesh ) {
                child.material = monitor_material;
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        monitor_group.add(obj);
        scene.add(monitor_group);
                
        // monitor_group.rotation.y = 25*dtr;
        // monitor_group.position.set(-1.3, 0, -0.6);
        monitor_group.rotation.x = 6.5*dtr;
        monitor_group.position.set(0, 0, -0.6);
        monitor_loaded = true;
    },
    undefined,
    function (error) {
        console.error(error);
    });

// List of columns
var pylvaeaet = [];
var pylvaes_loaded = false;
obj_loader.load('pylvaes.obj',
    function ( obj ) {
	// Simple marble colour. Could use a texture.
        var pylvaes_material = new THREE.MeshPhongMaterial( {color: 0xe3e0cd} );
	// Get the geometry from the loaded object
        var pylvaes_geom;
        obj.traverse( function( child ) {
            if ( child instanceof THREE.Mesh ) {
                pylvaes_geom = child.geometry;
            }
        });
	// Add meshes created of the geometry and the material to the column array
        for (var i = 0; i < 6; i++) {
            var mesh = new THREE.Mesh(pylvaes_geom, pylvaes_material);
            mesh.scale.set(0.4, 0.4, 0.4);
            mesh.position.y = 1.95;
            mesh.position.z = -2;
            mesh.receiveShadow = true;
            pylvaeaet.push(mesh);
            scene.add(mesh);
        }
	// Set the column positions
        pylvaeaet[0].position.set( 3.2, 1.95,  0);
        pylvaeaet[1].position.set( 3.2, 1.95, -2);
        pylvaeaet[2].position.set( 3.2, 1.95, -4);
        pylvaeaet[3].position.set(-3.2, 1.95,  0);
        pylvaeaet[4].position.set(-3.2, 1.95, -2);
        pylvaeaet[5].position.set(-3.2, 1.95, -4);
        pylvaes_loaded = true;
    },
    undefined,
    function (error) {
        console.error(error);
    });

var ukko_loaded = false;
/*
var ukko = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1), 
    new THREE.MeshPhongMaterial({color: 0xffffff}));
    
    ukko.position.set(0, 1, 10);
    scene.add(ukko);
    cam2.lookAt(ukko.position)
    ukko_loaded = true;
*/
var kolmio = false;
var matswitch = 0.0;
var render = function (time) {
    time = time/1000;
    requestAnimationFrame(render);

    cam2.position.x = Math.sin(time) * 3;
    cam2.lookAt(new THREE.Vector3());

    if (kolmio && time - matswitch > 4) {
        monitor_screen.material = monitor_material1;
        matswitch = time;
        kolmio = false;
    } else if (!kolmio && time - matswitch > 10) {
        monitor_screen.material = monitor_material3;
        matswitch = time;
        kolmio = true;
    }
    if (monitor_loaded) {
        monitor_group.position.y = Math.sin(time)/6 + 0.30;
    }
    if (ukko_loaded) {
        ukko.rotation.y += 0.01;
        ukko.rotation.x += 0.02;
    }

    renderer.setRenderTarget(render_target);
    renderer.render(scene, cam2);
    renderer.setRenderTarget(null);
    renderer.render(scene, camera)
};

render();




