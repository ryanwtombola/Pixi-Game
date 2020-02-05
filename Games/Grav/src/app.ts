import { Application, Loader } from './aliases';
import { Entity, Component } from './entity';
import Camera from './components/camera';
import Movement from './components/movement';
import Train from './components/train';
import { mouse } from './input';
import { Vector } from './utilites';

// -----------------------------------------------======== PIXI ========----------------------------------------------- //

// // Preserves pixels when upscaling
// PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

// Create a Pixi Application
export const app: PIXI.Application = new Application({
    width: innerWidth,
    height: innerHeight,
    antialias: true,
    transparent: false,
    resolution: 1,
    forceFXAA: false,
    roundPixels: true
});

export const stage: PIXI.Container = app.stage;
export let resolution: Vector = new Vector(innerWidth, innerHeight);
let lastRes: Vector = Vector.zero;


// Add the canvas to the HTML document
document.body.appendChild(app.view);

// Resize the canvas to the full page
app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoResize = true;

// Run the Setup function when finshed loading
Loader.load(Setup);

function Setup(): void {

    const camera = new Entity("Camera");
    camera.components.push(new Camera(camera));
    camera.components.push(new Movement(camera));

    const train = new Entity("Train");
    train.components.push(new Train(train));

    const entities: Entity[] = [
        camera, train
    ];

    // Call the start method on all entites when loaded
    entities.forEach((entity: Entity) => {
        entity.Start();
    });

    let time: number = 0;
    // Call the update method on all entities each frame and pass the delta time
    app.ticker.add((delta: number) => {
        time += delta;

        resolution = new Vector(innerWidth, innerHeight);
        if (!lastRes.CompareTo(resolution)) {
            app.renderer.resize(innerWidth, innerHeight);
            lastRes = resolution;
        }

        entities.forEach((entity: Entity) => {
            entity.Update(delta, time);
        });
        mouse.wheel = 0;
    });
}