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
    [-15, 20],
    [30, 30],
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

    // コース(描画)を先に作成
    course = new THREE.CatmullRomCurve3( 
        controlPoints.map((p) => {
            return (new THREE.Vector3()).set( 
                offset.x + p[0],
                0,
                offset.z + p[1]
            );
        }), false
    );

    // ビル
    function makeBuilding(x, z, type) {
        const height = [2, 2, 7, 4, 5];
        const bldgH = height[type] * 5;
        const width = 6 + Math.random() * 4;
        const depth = 6 + Math.random() * 4;
        const geometry = new THREE.BoxGeometry(width, bldgH, depth);
        
        const material = new THREE.MeshLambertMaterial({map: texture});
        const sideUvS = (type*2+1)/11;
        const sideUvE = (type*2+2)/11;
        const topUvS = (type*2+2)/11;
        const topUvE = (type*2+3)/11;
        const uvs = geometry.getAttribute("uv");
        for (let i = 0; i < 48; i+=4) {
            if (i < 16 || i > 22) {
                uvs.array[i] = sideUvS;
                uvs.array[i+2] = sideUvE;
            }
            else {
                uvs.array[i] = topUvS;
                uvs.array[i+2] = topUvE;
            }
        }
        const bldg = new THREE.Mesh(geometry, material);
        
        // ビルの位置を設定
        const buildingPos = new THREE.Vector3(
            offset.x + x,
            bldgH/2,
            offset.z + z
        );
        bldg.position.copy(buildingPos);
        
        // 最も近い道路のポイントを見つける
        let minDist = Infinity;
        let closestPoint = new THREE.Vector3();
        let closestT = 0;
        
        for (let t = 0; t <= 1; t += 0.01) {
            const point = course.getPointAt(t);
            const dist = point.distanceTo(buildingPos);
            if (dist < minDist) {
                minDist = dist;
                closestPoint.copy(point);
                closestT = t;
            }
        }
        
        // 道路の接線方向を取得
        const tangent = course.getTangentAt(closestT);
        
        // ビルを道路方向に向ける
        const angle = Math.atan2(tangent.x, tangent.z);
        bldg.rotation.y = angle + Math.PI/2; // 90度回転を加えて正面を道路に向ける
        
        // わずかなランダム性を追加
        bldg.rotation.y += (Math.random() - 0.5) * 0.2; // ±0.1ラジアンのランダムな回転
        
        scene.add(bldg);
    }

    // 複数のビルを配置
    const buildingPositions = [
        [10, -10, 0],  // [x, z, type]
        [5, -8, 4],
        [5, -12, 2],
        [-10, -20, 3],
        [-4, -5, 4],
        [-14, 0, 2],
        [-25, 17, 1],
        [-20, 8, 3],
        [-20, 30, 0],
    ];

    buildingPositions.forEach(pos => {
        makeBuilding(pos[0], pos[1], pos[2]);
    });

    // 道路の描画
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

export function makeCourse(scene) {
    const courseVectors = [];
    const parts = [L3, L4, L1, L2];
    parts.forEach((part) => {
        part.controlPoints.forEach((p) => {
            courseVectors.push(
                new THREE.Vector3(
                    p[0] + part.origin.x,
                    0,
                    p[1] + part.origin.z,
                )
            )
        });
    })
    course = new THREE.CatmullRomCurve3(
        courseVectors, true
    )
}

export function getCamera() {
    return camera;
}

export function setCar(scene, car) {
    const SCALE = 0.01;
    car.position.copy(origin);
    car.scale.set(SCALE, SCALE, SCALE);
    scene.add(car);
}

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