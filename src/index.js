import { TweenMax } from 'gsap/gsap-core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

import * as GSAP from 'gsap'

import buildingObject from './models/buildings.obj';

require('normalize.css/normalize.css');
require("./index.css");

let scene, camera, renderer;
let controls, container, models;

//

const group = new THREE.Object3D();
const gridSize = 40;
const buildings = [];
const fogConfig = {
    color: '#fff',
    near: 1,
    far: 138
};

//

window.onload = function () {

    var loader = new OBJLoader();
    loader.load(buildingObject, onLoadModelsComplete);

    initScene();
    initCamera();
    addAmbientLight();
    addSpotLight();
    initObjects();
    initControls();


    var pointLightParams =
    {
        color: '#d3263a',
        intensity: 4,
        position: {
            x: 18,
            y: 22,
            z: -9,
        }
    };

    addPointLight(pointLightParams);



    animate();
}

//

function initScene() {

    scene = new THREE.Scene();

    container = document.getElementById('canvas');

    var width = container.offsetWidth;
    var height = container.offsetHeight;

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    scene.fog = new THREE.Fog(fogConfig.color, fogConfig.near, fogConfig.far);

}

//

function initCamera() {

    container = document.getElementById('canvas');

    var width = container.offsetWidth;
    var height = container.offsetHeight;

    camera = new THREE.PerspectiveCamera(
        20,
        width / height,
        1,
        1000
    );

    camera.position.set(3, 16, 111);

    scene.add(camera);
}

//

function addAmbientLight() {
    var ambientLight = new THREE.AmbientLight('#fff');

    scene.add(ambientLight);
}

//

function addSpotLight() {
    const light = { color: '#fff', x: 100, y: 150, z: 100 };
    const spotLight = new THREE.SpotLight(light.color, 1);

    spotLight.position.set(light.x, light.y, light.z);
    spotLight.castShadow = true;

    scene.add(spotLight);
}

//

function addPointLight(params) {

    const pointLight = new THREE.PointLight(params.color, params.intensity);

    pointLight.position.set(params.position.x, params.position.y, params.position.z);

    scene.add(pointLight);
}

//

function initObjects() {

    var floor = addFloor();
    scene.add(floor);

}

function createGrid() {
    // bounding box of the model
    const boxSize = 3;

    // min, max values of scale
    const max = 0.009;
    const min = 0.001;

    const meshParams = {
        color: '#fff',
        metalness: 0.58,
        emissive: '#000000',
        roughness: 0.18,
    };

    // create material outside of loop
    const material = new THREE.MeshPhysicalMaterial(meshParams);

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {

            // clone a random model from 
            const building = getRandomBuilding().clone();

            building.material = material;

            building.scale.y = Math.random() * (max - min + 0.01);

            building.position.x = (i * boxSize);
            building.position.z = (j * boxSize);

            // add each model to a group
            group.add(building);

            // store reference inside list
            buildings.push(building);

        }
    }

    scene.add(group);

    group.position.set(-gridSize - 10, 1, -gridSize - 10);

}

//

function sortBuildingsByDistance() {
    buildings.sort((a,b) => {
        if (a.position.z > b.position.z) {
            return 1
        }

        if (a.position.z < b.position.z) {
            return -1;
        }

        return 0;
    }).reverse();

}

//

function showBuildings() {
    sortBuildingsByDistance();

    buildings.map((building, index) => {
        GSAP.TweenMax.to(building.position, 0.3 + (index / 350), { y: 1, ease: GSAP.Power3.easeOut, delay: index / 350});
    });
}

//

function onLoadModelsComplete(model) {
    models = [...model.children].map((model) => {
        var scale = .01;

        model.scale.set(scale, scale, scale);
        model.position.set(0, -14, 0);
        model.receiveShadow = true;
        model.castShadow = true;

        return model;
    });

    createGrid();

    setTimeout(() => {
        showBuildings();
    }, 500);
}

//

function getRandomBuilding() {
    return models[Math.floor(Math.random() * Math.floor(models.length))];
}

//

function addFloor() {

    const width = 200;
    const height = 200;
    const planeGeometry = new THREE.PlaneGeometry(width, height);

    // all materials can be changed according to your taste and needs
    const planeMaterial = new THREE.MeshStandardMaterial({
        color: '#fff',
        metalness: 0,
        emissive: '#000000',
        roughness: 0,
    });

    const plane = new THREE.Mesh(planeGeometry, planeMaterial);

    planeGeometry.rotateX(- Math.PI / 2);

    plane.position.y = 0;

    return plane;
}

//

function initControls() {

    controls = new OrbitControls(camera, renderer.domElement);

    controls.enablePan = false;
    controls.enableZoom = false;
    controls.enableRotate = true;

}

//

function animate() {
    requestAnimationFrame(animate);

    controls.update();

    renderer.render(scene, camera);
}

//

function onWindowResize() {
    container = document.getElementById('canvas');

    var width = container.offsetWidth;
    var height = container.offsetHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
}

function onClick() {
    console.log(models)
}

window.addEventListener('resize', onWindowResize, false);
window.addEventListener('click', onClick, false);