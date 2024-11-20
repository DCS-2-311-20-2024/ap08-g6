//
// 応用プログラミング 第8回 (ap08L3.js)
//
// G384532023 鈴木卓弥
//

"use strict"; // 厳格モード

// ライブラリをモジュールとして読み込む
import * as THREE from "three";
import * as L1 from "./ap08L1.js";
import * as L2 from "./ap08L2.js";
import * as L3 from "./ap08L3.js";
import * as L4 from "./ap08L4.js";

let renderer;
let camera;
let course;
export const origin = new THREE.Vector3();
export const controlPoints = [
    [-25,-40],
    [30, -10],
    [30, -1],
    [25, -1],
    [20, 2],
    [10, 2],
    [-6, 7],
    [-20, 20],
    [ 50, 20]
]
export function init(scene, size, id, offset, texture) {
    origin.set(offset.x, 0, offset.z);
    camera = new THREE.PerspectiveCamera(20, 1, 0.1, 1000);
    {
      camera.position.set(0, 10, 0);
      camera.lookAt(offset.x, 0, offset.z);
    }
    renderer =  new THREE.WebGLRenderer();
    {
      renderer.setClearColor(0x406080);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(size, size);
    }
    document.getElementById(id).appendChild(renderer.domElement);
    
    // 平面
    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 80),
        new THREE.MeshLambertMaterial({color: "green"})
    )
    plane.rotateX(-Math.PI/2);
    plane.position.set(offset.x, -0.01, offset.z);
    scene.add(plane);

    // ビル
    function makeBuilding(x, z, type) {
        const height = [2, 2, 7, 4, 5];
        const bldgH = height[type] * 5;
        const width = 6 + Math.random() * 4; // 幅をランダムに
        const depth = 6 + Math.random() * 4; // 奥行きをランダムに
        const geometry = new THREE.BoxGeometry(width, bldgH, depth);
        
        // ビルの色をランダムに変化させる（グレーの色調）
        const color = new THREE.Color(
            0.4 + Math.random() * 0.2,
            0.4 + Math.random() * 0.2,
            0.4 + Math.random() * 0.2
        );
        
        const material = new THREE.MeshLambertMaterial({color: color});
        const bldg = new THREE.Mesh(geometry, material);
        
        bldg.position.set(
            offset.x + x,
            bldgH/2,
            offset.z + z
        );
        
        // ビルを少しランダムに回転
        bldg.rotation.y = Math.random() * Math.PI * 0.1;
        
        scene.add(bldg);
    }

    // 複数のビルを配置
    const buildingPositions = [
        [10, -10, 0],  // [x, z, type]
        [5, -8, 4],
        [5, -12, 2],
        [-10, -20, 3],
        [-9, -5, 4],
        [-14, 0, 2],
        [-35, 15, 1],
        [-25, 8, 3],
        [-25, 30, 0],
  
        // 道路の反対側
    ];

    buildingPositions.forEach(pos => {
        makeBuilding(pos[0], pos[1], pos[2]);
    });

    // コース(描画)
    course = new THREE.CatmullRomCurve3( 
        controlPoints.map((p) => {
            return (new THREE. Vector3()).set( 
                offset.x + p[0],
                0,
                offset.z + p[1]
            );
        }), false
    )
    // 曲線から100箇所を取り出し 円を並べる
    const points = course.getPoints(100); 
    points.forEach((point)=>{
        const road = new THREE.Mesh (
            new THREE.CircleGeometry(5,16),
            new THREE.MeshLambertMaterial({ 
                color: "gray",
            })
        )
        
        road.rotateX(-Math.PI/2); 
        road.position.set( 
            point.x,
            0, 
            point.z 
        );
        scene.add(road);
    });
}

// コース(自動運転用)
export function makeCourse(scene) {
}

// カメラを返す
export function getCamera() {
    return camera;
}

// 車の設定
export function setCar(scene, car) {
    const SCALE = 0.01;
    car.position.copy(origin);
    car.scale.set(SCALE, SCALE, SCALE);
    scene.add(car);
}

// Windowサイズの変更処理
export function resize() {
    camera.updateProjectionMatrix();
    const sizeR = 0.2 * window.innerWidth;
    renderer.setSize(sizeR, sizeR);
}

const clock = new THREE.Clock();
const carPosition = new THREE.Vector3();
const carTarget = new THREE.Vector3();
export function render(scene, car) {
    const time = (clock.getElapsedTime() / 20);
    course.getPointAt(time % 1, carPosition);
    car.position.copy(carPosition);
    course.getPointAt((time + 0.01) %1, carTarget);
    car.lookAt(carTarget);
    camera.lookAt(car.position.x, car.position.y, car.position.z);
    renderer.render(scene, camera);
}
