import {
    Engine,
    Scene,
    Animation,
    ArcRotateCamera,
    Vector3,
    HemisphericLight,
    Mesh,
    MeshBuilder,
    StandardMaterial,
    Color3,
    GizmoManager
} from "@babylonjs/core";


class App {

    constructor() {
        const canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.id = "gameCanvas";
        document.body.appendChild(canvas);

        const engine = new Engine(canvas, true);
        const scene = new Scene(engine);

        const mWhite = new StandardMaterial("myMaterial", scene);
        mWhite.emissiveColor = new Color3(1, 1, 1);
        const mRed = new StandardMaterial("myMaterial", scene);
        mRed.emissiveColor = new Color3(1, 0, 0);
        const mGreen = new StandardMaterial("myMaterial", scene);
        mGreen.emissiveColor = new Color3(0, 1, 0);
        const mBlue = new StandardMaterial("myMaterial", scene);
        mBlue.emissiveColor = new Color3(0, 0, 1);

        const camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2,
            new Vector3(0, 0, 5), scene);
        camera.attachControl(canvas, true);
        const light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);

        const sphere: Mesh = MeshBuilder.CreateSphere("sphere", {diameter: 1}, scene);
        sphere.position = new Vector3(0, 2, 0);

        // const gizmoManager = new GizmoManager(scene);
        // gizmoManager.positionGizmoEnabled = true;
        // gizmoManager.rotationGizmoEnabled = true;
        // gizmoManager.scaleGizmoEnabled = true;
        // gizmoManager.boundingBoxGizmoEnabled = true;
        // gizmoManager.attachableMeshes = [sphere];
        // gizmoManager.attachToMesh(sphere);

        const cubeOne: Mesh = MeshBuilder.CreateBox("boxOne", {
            width: 1,
            height: 1,
            depth: 1,
        }, scene);
        cubeOne.position = new Vector3(-1.5, 0, 0);
        cubeOne.material = mRed;

        const cubeTwo: Mesh = MeshBuilder.CreateBox("boxTwo", {
            width: 1,
            height: 1,
            depth: 1,
        }, scene);
        cubeTwo.position = Vector3.Zero();
        cubeTwo.material = mBlue;

        const cubeThree: Mesh = MeshBuilder.CreateBox("boxThree", {
            width: 1,
            height: 1,
            depth: 1,
        }, scene);
        cubeThree.position = new Vector3(1.5, 0, 0);
        cubeThree.material = mGreen;

        engine.runRenderLoop(() => {
            scene.render();

            if (sphere.intersectsMesh(cubeOne)) {
                scene.stopAllAnimations();
                sphere.material = mWhite;
            }
        });

        // scene.registerBeforeRender(function () {
        //     sphere.lookAt(cubeOne.getAbsolutePosition());
        // });

        const moveTowards = new Animation("movein", "position", 1, Animation.ANIMATIONTYPE_VECTOR3);

        const keys = [
            { frame: 0, value: sphere.getAbsolutePosition() },
            { frame: 10, value: cubeOne.getAbsolutePosition() },
        ];
        moveTowards.setKeys(keys);
        sphere.animations.push(moveTowards);

        const redButton = document.createElement("button");
        redButton.style.top = "100px";
        redButton.style.right = "30px";
        redButton.textContent = "Move to Red";
        redButton.style.width = "100px"
        redButton.style.height = "100px"
        redButton.style.position = "absolute";
        redButton.style.color = "black";
        document.body.appendChild(redButton);
        redButton.addEventListener("click", () => {
            sphere.lookAt(cubeOne.getAbsolutePosition());
            scene.beginAnimation(sphere, 0, 1, false);
        });

        const blueButton = document.createElement("button");
        blueButton.style.top = "250px";
        blueButton.style.right = "30px";
        blueButton.textContent = "Move to Blue";
        blueButton.style.width = "100px"
        blueButton.style.height = "100px"
        blueButton.style.position = "absolute";
        blueButton.style.color = "black";
        document.body.appendChild(blueButton);
        blueButton.addEventListener("click", () => {
            sphere.lookAt(cubeTwo.getAbsolutePosition());
            scene.beginAnimation(sphere, 0, 1, false);
        });

        const greenButton = document.createElement("button");
        greenButton.style.top = "400px";
        greenButton.style.right = "30px";
        greenButton.textContent = "Move to Green";
        greenButton.style.width = "100px"
        greenButton.style.height = "100px"
        greenButton.style.position = "absolute";
        greenButton.style.color = "black";
        document.body.appendChild(blueButton);
        greenButton.addEventListener("click", () => {
            sphere.lookAt(cubeThree.getAbsolutePosition());
            scene.beginAnimation(sphere, 0, 1, false);
        });
    }
}

new App();
