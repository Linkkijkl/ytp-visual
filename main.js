/*
ATK-YTP 24 juttu
author: Vili Kärkkäinen
monitor texture: Jami Virtanen
*/

import * as THREE from 'three';

// If for some reason the OBJLoader is in a different place,
// try the another import. For me the one above worked on 
// linux and the one below on windows.
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
// import { OBJLoader } from 'three/addons/loaders/OBJloader.js';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

// Degrees to radians.
const pi = 3.1415;
const dtr = pi/180;

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
const main_scene = new THREE.Scene();
main_scene.background = new THREE.Color(0xffc1cc);

// The three.js camera
const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 100);
camera.position.z = 4;
camera.position.y = 2;
camera.rotation.x = -0 * dtr;

// The three.js renderer
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// The render target for camera 2, for the monitor screen
var res = 30;
var render_target3D = new THREE.WebGLRenderTarget(4 * res, 3 * res, {
	magFilter: THREE.NearestFilter,
	minFilter: THREE.NearestFilter
});

// LIGHTS
var directionalLight1 = new THREE.DirectionalLight( 0xffff00, 1 );
directionalLight1.position.set(-2,2,2);
directionalLight1.castShadow = true;
main_scene.add( directionalLight1 );

var directionalLight2 = new THREE.DirectionalLight( 0xff00ff, 1 );
directionalLight2.position.set(2,2,-2);
directionalLight2.castShadow = true;
main_scene.add( directionalLight2 );

var directionalLight3 = new THREE.DirectionalLight( 0x00ffff, 1 );
directionalLight3.position.set(-2,2,-2);
directionalLight3.castShadow = true;
main_scene.add( directionalLight3 );

var directionalLight4 = new THREE.DirectionalLight( 0xffffff, 1 );
directionalLight4.position.set(2,2,2);
directionalLight4.castShadow = true;
main_scene.add( directionalLight4 );

var ambient = new THREE.AmbientLight(0xffc1cc, 1);
main_scene.add(ambient);

/*
var sphere = new THREE.Mesh(
	new THREE.SphereGeometry(1, 16, 16), 
	new THREE.MeshPhongMaterial({
	color: 0xFF69B4,
	emissive: 0xFF69B4,
	specular: 0XFF69B4,
	shininess: 100,
	}));
sphere.castShadow = true;
sphere.receiveShadow = true;
sphere.position.set(2, 1, -4)
main_scene.add(sphere);
*/

var info = new THREE.Mesh(
	new THREE.PlaneGeometry(2, 1, 1, 1), 
	new THREE.MeshBasicMaterial({
	    map: new THREE.TextureLoader().load("info.png", {
		    minFilter: THREE.NearestFilter,
		    magFilter: THREE.NearestFilter,
	        })
	}));
info.position.x = 2;
info.position.z = 1.5;
info.rotation.y = -8*dtr;
main_scene.add(info);

// PLANE
var plane_geometry = new THREE.PlaneGeometry( 20, 20, 1, 1 );
// Spoof texture so that uv's are in use
const spoof = new THREE.Texture();
var plane_material = new THREE.MeshPhongMaterial({
	map: spoof,
	shininess: 100,
});
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
var plane = new THREE.Mesh( plane_geometry, plane_material );
plane.receiveShadow = true;
plane.rotation.x = -90 * dtr;
main_scene.add( plane );

// MONITOR
var monitor_group = new THREE.Group();

// Monitor power light cube
var monitor_power_light = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.05, 0.05), 
    new THREE.MeshBasicMaterial({color: 0x66ff00}));
monitor_power_light.position.set(0.65,0.57,0.82);
monitor_group.add(monitor_power_light);
// Monitor power light light
var monitor_power_light_L = new THREE.PointLight(0x66ff00, 0.03, 0.2);
monitor_power_light_L.position.set(0.65,0.57,0.85);
monitor_group.add(monitor_power_light_L);

// monitor screen materials
// ytp-texture
var jami_tex = new THREE.TextureLoader().load("jami.png");
var monitor_material1 = new THREE.MeshBasicMaterial({
    map: jami_tex,
});

// render target texutre (from cam2)
var monitor_material3 = new THREE.MeshBasicMaterial({
    map: render_target3D.texture
});

// Monitor screen
var monitor_screen = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5,1.2,1,1),
    monitor_material3
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
        main_scene.add(monitor_group);
                
        monitor_group.rotation.y = 25*dtr;
        monitor_group.position.set(-2, 0, -1);
        // monitor_group.rotation.x = 6.5*dtr;
        // monitor_group.position.set(0, 0, -0.5);
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
        for (var i = 0; i < 8; i++) {
            var mesh = new THREE.Mesh(pylvaes_geom, pylvaes_material);
            mesh.scale.set(0.5, 0.5, 0.5);
            mesh.receiveShadow = true;
            pylvaeaet.push(mesh);
            main_scene.add(mesh);
        }
	let h = 1.95 * 5/4;
	// Set the column positions
        pylvaeaet[0].position.set( 5, h,  0.5);
        pylvaeaet[1].position.set( 5, h, -2  );
        pylvaeaet[2].position.set( 5, h, -4.5);
	pylvaeaet[3].position.set( 5, h, -7  );
        pylvaeaet[4].position.set(-5, h,  0.5);
        pylvaeaet[5].position.set(-5, h, -2  );
        pylvaeaet[6].position.set(-5, h, -4.5);
        pylvaeaet[7].position.set(-5, h, -7  );
	
        pylvaes_loaded = true;
    },
    undefined,
    function (error) {
        console.error(error);
    });

var logo_group = new THREE.Group();
var kolmio_loaded = false;
obj_loader.load('tri.obj',
    function( obj ) {
	var kolmio_material = new THREE.MeshPhongMaterial({color: 0xffff00});
	obj.traverse( function (child) {
	    if (child instanceof THREE.Mesh) {
		child.material = kolmio_material;
		child.receiveShadows = true;
	    }
	});
	logo_group.add(obj);
	kolmio_loaded = true;
    },
    undefined,
    function(error) {
	console.error(error);
    });

var ytp_texts_loaded = false;
obj_loader.load('ytp.obj',
    function ( obj ) {
        var text_material = new THREE.MeshPhongMaterial({color: 0xff8800});
	var text_geom;
	obj.traverse(function(child) {
	    if (child instanceof THREE.Mesh) {
		text_geom = child.geometry;
	    }
	});
	for (var i = 0; i < 2; i++) {
	    let mesh = new THREE.Mesh(text_geom, text_material);
	    mesh.scale.set(0.9, 0.9, 1)
	    mesh.position.y = -0.1;
	    mesh.rotation.y = 180 * dtr * i;
	    mesh.castShadows = true;
	    logo_group.add(mesh);
	}
	ytp_texts_loaded = true;
    },
    undefined,
    function(error) {
	console.error(error);
    });

// Create the monitor scene
const monitor_scene = new THREE.Scene();
monitor_scene.background = new THREE.Color(0xffc1cc);

// LOGO
monitor_scene.add(logo_group);
logo_group.position.y = 0.05;
// MONITOR SCENE LIGHTS
var mon_sce_dir_lig = new THREE.DirectionalLight(0xffffff, 2);
mon_sce_dir_lig.position.set(0, 1, 1);
monitor_scene.add(mon_sce_dir_lig);
var mon_sce_amb_lig = new THREE.AmbientLight(0xffc1cc);
monitor_scene.add(mon_sce_amb_lig);
var cam2 = new THREE.PerspectiveCamera(65, 4/3, 1, 100);
cam2.position.set(0, 0, 2);
// MONITOR SCENE PLANE
var mon_plane = new THREE.Mesh(plane_geometry, plane_material);
mon_plane.rotation.x = -90 * dtr;
mon_plane.scale.set(10, 10);
mon_plane.position.y = -25;
monitor_scene.add(mon_plane);

var logo3d = false;
var switch_time = 0.0;
var render = function (time) {
    time = time/1000;
    requestAnimationFrame(render);
/*
    if (logo3d && time - switch_time > pi) {
        monitor_screen.material = monitor_material1;
        switch_time = time;
        logo3d = false;
    } else if (!logo3d && time - switch_time > 16) {
        monitor_screen.material = monitor_material3;
        switch_time = time;
        logo3d = true;
    }

    if (monitor_loaded) {
        monitor_group.position.y = Math.sin(time/2)/6 + 0.35;
    }
*/
    if (kolmio_loaded && ytp_texts_loaded) {
        logo_group.rotation.y = -2 * (time - switch_time);
    }
    info.position.y = Math.sin(time)/4 + 2;


    renderer.setRenderTarget(render_target3D);
    renderer.render(monitor_scene, cam2);
    renderer.setRenderTarget(null);
    renderer.render(main_scene, camera)
};

render();
