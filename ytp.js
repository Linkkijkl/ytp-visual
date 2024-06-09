/*
ATK-YTP 24 juttu
author: Vili Kärkkäinen

monitor texture: Jami Virtanen
kolmio ukko: joku emt
*/

import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJloader.js';

const dtr = 3.1415/180;


var aspect;
window.addEventListener( 'resize', resize_callback, false );
function resize_callback(){

    aspect = window.innerWidth / window.innerHeight;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffc1cc);
aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 100);
camera.position.z = 2.5;
camera.position.y = 1;

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// LIGHTS
var directionalLight1 = new THREE.DirectionalLight( 0xffff00, 1 );
directionalLight1.position.set(-2,2,2);
directionalLight1.castShadow = true;
scene.add( directionalLight1 );

var directionalLight2 = new THREE.DirectionalLight( 0xff00ff, 1 );
directionalLight2.position.set(2,2,-2);
directionalLight2.castShadow = true;
scene.add( directionalLight2 );

var directionalLight2 = new THREE.DirectionalLight( 0x00ffff, 1 );
directionalLight2.position.set(-2,2,-2);
directionalLight2.castShadow = true;
scene.add( directionalLight2 );

var directionalLight2 = new THREE.DirectionalLight( 0xffffff, 1 );
directionalLight2.position.set(2,2,2);
directionalLight2.castShadow = true;
scene.add( directionalLight2 );

var ambient = new THREE.AmbientLight(0xffc1cc, 1);
scene.add(ambient);

// PLANE
var planeGeometry = new THREE.PlaneGeometry( 20, 20, 1, 1 );
// Spoof texture so that uv's are in use
const spoof = new THREE.Texture();
var plane_material = new THREE.MeshPhongMaterial({map: spoof});
// inject custom glsl
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
plane.position.z = -5.0;
scene.add( plane );

// MONITOR
var monitor_group = new THREE.Group();
var monitor_power_light = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.05, 0.05), 
    new THREE.MeshBasicMaterial({color: 0x66ff00})
);
monitor_power_light.position.set(0.65,0.57,0.82);
monitor_group.add(monitor_power_light);

var monitor_power_light_L = new THREE.PointLight(0x66ff00, 0.03, 0.2);
monitor_power_light_L.position.set(0.65,0.57,0.85);
monitor_group.add(monitor_power_light_L);

var monitor_material1 = new THREE.MeshBasicMaterial(
    {map: new THREE.TextureLoader().load("jami.png")}
);

var monitor_material2 = new THREE.MeshBasicMaterial({ 
    color: 0xFFFFFF,
    map: new THREE.VideoTexture(document.getElementById( 'video' ))
});

var monitor_screen = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5,1.2,1,1),
    monitor_material1
);
monitor_screen.position.set(0, 1.27, 0.67);
monitor_screen.rotation.x = -8.2 * dtr;
monitor_group.add(monitor_screen);

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

var kolmio = false;
var matswitch = 0.0;
var render = function (time) {
    time = time/1000;
    requestAnimationFrame(render);
    if (kolmio && time - matswitch > 0.8) {
        monitor_screen.material = monitor_material1;
        matswitch = time;
        kolmio = false;
    } else if (!kolmio && time - matswitch > 8) {
        monitor_screen.material = monitor_material2;
        matswitch = time;
        kolmio = true;
    }
    if (monitor_loaded) {
        monitor_group.position.y = Math.sin(time)/6 + 0.30;
    }
    renderer.render(scene, camera);
};

render();




