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
    ActionManager,
    ExecuteCodeAction,
    AbstractMesh, InterpolateValueAction, SetValueAction,
} from "@babylonjs/core";


type ButtonMap =  Map<string, AbstractMesh>;


/**
 * Simple wrapper class to create solid color materials
 */
class SolidColor {

    static make(color: Color3, scene: Scene): StandardMaterial {
        const mat = new StandardMaterial("white", scene);
        mat.emissiveColor = color;

        return mat;
    }
}


class App {

    private readonly engine: Engine;
    private readonly scene: Scene;
    private canvas: HTMLCanvasElement;
    private buttonElements: Set<HTMLButtonElement>;

    constructor() {
        this.createCanvas();

        this.engine = new Engine(this.canvas, true);
        this.scene = new Scene(this.engine);

        this.setupCamera();
        this.createGeometry();
        this.createUI();

        this.loop();
    }


    /**
     * The Loop™
     */
    private loop() {
        const actor = this.scene.getMeshByName("actor");
        const redCube = this.scene.getMeshByName("redCube");
        const greenCube = this.scene.getMeshByName("greenCube");
        const blueCube = this.scene.getMeshByName("blueCube");

        const white = SolidColor.make(new Color3(1, 1, 1), this.scene);
        const red = SolidColor.make(new Color3(1, 0, 0), this.scene);
        const blue = SolidColor.make(new Color3(0, 1, 0), this.scene);
        const green = SolidColor.make(new Color3(0, 0, 1), this.scene);

        /**
         * Not super proud of this implementation. Not only am I writing duplicate code, like the color materials above,
         * but I'm not keeping logic related to the cubes together. I think ideally I would want to set up an observer
         * to listen to when an object intersects and then react appropriately there.
         */
        this.scene.registerBeforeRender(() => {
            if (redCube.intersectsMesh(actor)) {
                redCube.material = white;
            } else {
                redCube.material = red;
            }

            if (greenCube.intersectsMesh(actor)) {
                greenCube.material = white;
            } else {
                greenCube.material = blue;
            }

            if (blueCube.intersectsMesh(actor)) {
                blueCube.material = white;
            } else {
                blueCube.material = green;
            }
        });

        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }


    /**
     *
     * @private
     */
    private createCanvas(): void {
        this.canvas = document.createElement("canvas");
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        this.canvas.id = "gameCanvas";
        document.body.appendChild(this.canvas);
    }


    /**
     *
     * @private
     */
    private setupCamera(): void {
        const camera: ArcRotateCamera = new ArcRotateCamera(
            "Camera",
            Math.PI / 2,
            Math.PI / 2,
            2,
            new Vector3(0, 0, 5),
            this.scene
        );
        camera.attachControl(this.canvas, true);

        const light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), this.scene);
    }


    /**
     *
     * @private
     */
    private createGeometry() {
        const cubeSize = { width: 1, height: 1, depth: 1 };

        const cubeOne: Mesh = MeshBuilder.CreateBox("redCube", cubeSize, this.scene);
        cubeOne.position = new Vector3(-2.5, 0, 0);
        cubeOne.material = SolidColor.make(new Color3(1, 0, 0), this.scene);

        const cubeTwo: Mesh = MeshBuilder.CreateBox("blueCube", cubeSize, this.scene);
        cubeTwo.position = Vector3.Zero();
        cubeTwo.material = SolidColor.make(new Color3(0, 0, 1), this.scene);

        const cubeThree: Mesh = MeshBuilder.CreateBox("greenCube", cubeSize, this.scene);
        cubeThree.position = new Vector3(2.5, 0, 0);
        cubeThree.material = SolidColor.make(new Color3(0, 1, 0), this.scene);

        const sphere: Mesh = MeshBuilder.CreateSphere("actor", {diameter: 1}, this.scene);
        sphere.position = new Vector3(0, 2, 0);
        sphere.actionManager = new ActionManager(this.scene);

        /**
         * This piece really tripped me up. I have no prior experience with Babylon so was trying to figure out how I could
         * pass an array of meshes to the `paramater` and test against those, instead of having to register separate
         * actions. I tried passing an array, using `scene.getMeshesByTag` as well as ID but couldn't find something
         * that worked. In the end since it is only three actions, this works fine. But certainly this isn't scalable.
         */
        sphere.actionManager.registerAction(new ExecuteCodeAction({
                trigger: ActionManager.OnIntersectionEnterTrigger,
                parameter: cubeOne,
            }, this.onSphereCollisionCallback.bind(this, cubeOne)
        ));
        sphere.actionManager.registerAction(new ExecuteCodeAction({
                trigger: ActionManager.OnIntersectionEnterTrigger,
                parameter: cubeTwo,
            }, this.onSphereCollisionCallback.bind(this, cubeTwo)
        ));
        sphere.actionManager.registerAction(
            new ExecuteCodeAction({
                trigger: ActionManager.OnIntersectionEnterTrigger,
                parameter: cubeThree,
            }, this.onSphereCollisionCallback.bind(this, cubeThree)
        ));
    }

    /**
     *
     * @private
     */
    private onSphereCollisionCallback(collisionObject: AbstractMesh): void {
        this.scene.stopAllAnimations();
        collisionObject.material = SolidColor.make(new Color3(1, 1, 1), this.scene);
        this.enableUI();
    }


    /**
     *
     * @private
     */
    private enableUI(): void {
        this.buttonElements.forEach((value: HTMLButtonElement): void => {
            value.removeAttribute("disabled");
        });
    }


    /**
     *
     * @private
     */
    private disableUI(): void {
        this.buttonElements.forEach((value: HTMLButtonElement): void => {
            value.setAttribute("disabled", "disabled");
        });
    }


    /**
     *
     * @param name
     * @param offset
     * @private
     */
    private static createButton(name: string, offset: number): HTMLButtonElement {
        const button = document.createElement("button");
        button.style.top = `${offset + 100}px`;
        button.style.right = "30px";
        button.textContent = `Move to ${name}`;
        button.style.width = "100px";
        button.style.height = "100px";
        button.style.position = "absolute";
        button.style.color = "black";

        document.body.appendChild(button);

        return button;
    }


    /**
     * The event callback for UI buttons.
     *
     * @param target
     * @param key
     * @private
     */
    private onClickCallback(target: AbstractMesh, key: string): void {
        // Reset actor to its starting paramters
        const actor = this.scene.getMeshByName("actor");
        actor.position = new Vector3(0, 2, 0);

        this.disableUI();

        this.createAnimation(actor, target, key);
    }


    /**
     * I wasn't sure the best way to create a UI with Babylon, as there seems to be a few methods - so I chose the path
     * of least resistance and used HTML. I've used Phaser a few times for personal projects and the way I've gone about
     * the UI in the past was by setting up the UI with it's own scene that was loaded on top of the main scene. I imagine
     * Babylon probably works the same way, but given this is the first time I used the engine I didn't want to spend
     * a ton of time going about that method.
     *
     * @private
     */
    private createUI(): void {
        const buttonMap: ButtonMap = new Map();
        buttonMap.set("red", this.scene.getMeshByName("redCube"));
        buttonMap.set("green", this.scene.getMeshByName("greenCube"));
        buttonMap.set("blue", this.scene.getMeshByName("blueCube"));

        this.buttonElements = new Set();

        let offset: number = 0;
        buttonMap.forEach((target: AbstractMesh, key: string, _: ButtonMap) => {
            const button = App.createButton(key, offset);
            button.addEventListener("click", this.onClickCallback.bind(this, target, key));

            this.buttonElements.add(button);

            offset += 100;
        });
    }


    /**
     * Create an opinionated animation on an origin mesh. There is no versatility here, simply moving an object directly
     * towards a target.
     *
     * @param origin
     * @param target
     * @param name
     * @private
     */
    private createAnimation(origin: AbstractMesh, target: AbstractMesh, name: string): void {
        const moveTowards = new Animation(`moveTo${name}`, "position", 1, Animation.ANIMATIONTYPE_VECTOR3);

        const keys = [
            { frame: 0, value: origin.getAbsolutePosition() },
            { frame: 10, value: target.getAbsolutePosition() },
        ];

        moveTowards.setKeys(keys);
        origin.animations.push(moveTowards);
        this.scene.beginAnimation(origin, 0, 10, false);
    }
}

new App();
