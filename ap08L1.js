//
// 応用プログラミング 第8回 (ap08L1.js)
//
// G184432023 佐々木真聡
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
    [ 25, 40],
    [ 30,  0],
    [-20, 20],
    [-50,-20]
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
        const bldgH = height[type]*5;
        const geometry = new THREE.BoxGeometry(8, bldgH, 8);
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
        const bldg = new THREE.Mesh(
            geometry, 
            material
        )
        bldg.position.set(offset.x + x, bldgH/2, offset.z + z);
        scene.add(bldg);
    }
    makeBuilding(20, -25, 2);
    makeBuilding(10, -10, 1);
    
    function makeCBRobot(x, y, z) {
        // 段ボールロボットの設定
        const cardboardRobot = new THREE.Group
        const cardboardMaterial = new THREE.MeshLambertMaterial({ color: 0xccaa77 });
        const blackMaterial = new THREE.MeshBasicMaterial({color: "black"});
        const seg = 12; // 円や円柱の分割数
        const gap = 0.1; // 胸のマークなどを浮かせる高さ
        const legW = 8; // 脚の幅
        const legD = 8; // 脚の奥行
        const legLen = 30; // 脚の長さ
        const legSep = 12; // 脚の間隔
        const bodyW = 22; // 胴体の幅
        const bodyH = 30; // 胴体の高さ
        const bodyD = 20; // 胴体の奥行
        const armW = 8; // 腕の幅
        const armD = 8; // 腕の奥行
        const armLen = 38; // 腕の長さ
        const headW = 40; // 頭の幅
        const headH = 24; // 頭の高さ
        const headD = 24; // 頭の奥行
        const eyeRad = 2; // 目の半径
        const eyeSep = 16; // 目の間隔
        const eyePos = 2; // 目の位置(顔の中心基準の高さ)
        const mouthW = 6; // 口の幅
        const mouthH = 5; // 口の高さ
        const mouthT = 2; // 口の頂点の位置(顔の中心基準の高さ)
        //  脚の作成
        const legGeometry = new THREE.BoxGeometry(legW, legLen, legD);
        const legL = new THREE.Mesh(legGeometry, cardboardMaterial);
        legL.position.set(legSep/2, legLen/2, 0);
        cardboardRobot.add(legL);
        const legR = new THREE.Mesh(legGeometry, cardboardMaterial);
        legR.position.set(-legSep/2, legLen/2, 0);
        cardboardRobot.add(legR);
        //  胴体の作成
        const bodyGeometry = new THREE.BoxGeometry(bodyW, bodyH, bodyD);
        const body = new THREE.Mesh(bodyGeometry, cardboardMaterial);
        body.position.y = legLen + bodyH/2;
        cardboardRobot.add(body);
        //  腕の設定
        const armGeometry = new THREE.BoxGeometry(armW, armLen, armD);
        const armR = new THREE.Mesh(armGeometry, cardboardMaterial);
        armR.position.set(bodyW/2 + armW/2, legLen + bodyH - armLen/2, 0);
        cardboardRobot.add(armR);
        const armL = new THREE.Mesh(armGeometry, cardboardMaterial);
        armL.position.set(-(bodyW/2 + armW/2), legLen + bodyH - armLen/2, 0);
        cardboardRobot.add(armL);
        //  頭の設定
        const headGeometry = new THREE.BoxGeometry(headW, headH, headD);
        const head = new THREE.Mesh(headGeometry, cardboardMaterial);
        const circleGeometry = new THREE.CircleGeometry(eyeRad, seg);
        const eyeL = new THREE.Mesh(circleGeometry, blackMaterial);
        eyeL.position.set(eyeSep/2, eyePos, headD/2 + gap);
        head.add(eyeL);
        const eyeR = new THREE.Mesh(circleGeometry, blackMaterial);
        eyeR.position.set(-eyeSep/2, eyePos, headD/2 + gap);
        head.add(eyeR);
        const triangleGeometry = new THREE.BufferGeometry();
        const triangleVertices = new Float32Array( [
            0, -mouthT, headD/2+gap,
            -mouthW/2, -(mouthT + mouthH), headD/2+gap,
            mouthW/2, -(mouthT + mouthH), headD/2+gap] );
        triangleGeometry.setAttribute( 'position',
            new THREE.BufferAttribute( triangleVertices, 3));
        head.add(new THREE.Mesh(triangleGeometry, blackMaterial));
        head.position.y = legLen + bodyH + headH/2;
        cardboardRobot.add(head);
        cardboardRobot.position.set(offset.x + x, y, offset.z + z);
        scene.add(cardboardRobot);
    }
    makeCBRobot(-20, 0, -10);
    makeCBRobot(9, 0, 30);
    makeCBRobot(-50, 15, 40);

    // コース(描画)
    // 制御点を補完して曲線を作る
    course = new THREE.CatmullRomCurve3(
        controlPoints.map((p) => {
            return (new THREE.Vector3()).set(
                offset.x + p[0],
                0,
                offset.z + p[1]
            );
        }), false
    )
    // 曲線から100箇所を取り出し、円を並べる
    const points = course.getPoints(100);
    points.forEach((point) =>{
        const road = new THREE.Mesh(
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
    })

}

// コース(自動運転用)
export function makeCourse(scene) {
    const courseVectors = [];
    const parts = [L1, L2, L3, L4];
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

// カメラを返す
export function getCamera() {
    return camera;
}

// 車の設定
export function setCar(scene, car) {
    const   SCALE = 0.01;
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
