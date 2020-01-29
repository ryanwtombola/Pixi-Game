import { Application, Loader } from './aliases';
import Entity from './entity';
import Player from './entities/player';

// -----------------------------------------------======== PIXI ========----------------------------------------------- //

// // Preserves pixels when upscaling
// PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

// Create a Pixi Application
export const app = new Application({
    width: window.innerWidth,
    height: window.innerHeight,
    antialias: true,
    transparent: false,
    resolution: 1,
    forceFXAA: false,
    roundPixels: true
});

// Add the canvas to the HTML document
document.body.appendChild(app.view);

// Resize the canvas to the full page
app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoResize = true;
app.renderer.resize(window.innerWidth, window.innerHeight);

// Run the Setup function when finshed loading
Loader.load(Setup);

function Setup(): void {
    const entities: Entity[] = [
        new Player()
    ];

    // Call the start method on all entites when loaded
    entities.forEach((entity: Entity) => {
        entity.Start();
    });

    let time: number = 0;
    // Call the update method on all entities each frame and pass the delta time
    app.ticker.add((delta: number) => {
        time += delta;
        entities.forEach((entity: Entity) => {
            entity.Update(delta, time);
        });
    });
}