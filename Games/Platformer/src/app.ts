import * as PIXI from 'pixi.js';
import { Vector, Calc, Input} from './utilites';

// -----------------------------------------------======== PIXI ========----------------------------------------------- //

// Preserves pixels when upscaling
// PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

// Aliases
let Application = PIXI.Application,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite,
    Text = PIXI.Text,
    TextStyle = PIXI.TextStyle,
    Graphics = PIXI.Graphics,
    Container = PIXI.Container,
    Rectangle = PIXI.Rectangle

// Create a Pixi Application
let app = new Application({
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

// Load an image and run the setup function when it's done
loader
    .add("")
    .load(setup);

let left = Input.keyboard("a"),
    right = Input.keyboard("d"),
    up = Input.keyboard("w"),
    down = Input.keyboard("s"),
    mouse = Input.mouse()



let state: any,
    world,
    player: any,
    squares: any[] = [],
    speed = 6 / 60, // M/s
    acceleration = 0.4,
    gravity = 1.8 / 60, // M/s^2
    jumpHeight = 4, // M
    jumped = false,
    grounded = false,
    maxJumpBuffer = 5,
    jumpBuffer = 0,
    MaxCoyoteTime = 5,
    coyoteTime = 0,
    cameraSmoothTime = 0.2,
    dragX = 0.5,
    dragXAir = 0.95,
    dragY = 0.9

// -----------------------------------------------======== Setup ========----------------------------------------------- //

// This will run when the image has loaded
function setup() {

    // World Container
    world = new Container();
    app.stage.addChild(world);
    app.stage.scale.set(70);

    player = new Graphics();
    player.beginFill(0x285cc4).drawRect(0, 0, 1, 2).endFill();
    player.position.set(2, 3);
    app.stage.addChild(player);

    player.vx = 0;
    player.vy = 0;

    createSqaure(3, 5);
    createSqaure(6, 5);
    createSqaure(3, 3);
    createSqaure(7, 2);
    createSqaure(2, 2);

    for (let i = -100; i < 100; i++) {
        createSqaure(i, 9);
    }

    up.press = () => {
        jumpBuffer = maxJumpBuffer;
    }

    state = World;
    app.ticker.add((delta: number) => Update(delta));
}

function Update(delta: number) {
    state(delta);
}

// -----------------------------------------------======== Play ========----------------------------------------------- //

function World(delta: number) {
    delta *= 1;

    grounded = (coyoteTime > 0)
    if (coyoteTime < 1) {
        jumped = false;
    }
    coyoteTime--;
    if (grounded && jumpBuffer > 0 && !jumped) {
        player.vy = -Math.sqrt(2.2 * gravity * jumpHeight);
        jumped = true;
    }
    jumpBuffer--;

    if (player.vy > 0) {
        player.vy *= dragY;
    }
    player.vy += gravity;

    if (right.isDown && left.isUp) {
        player.vx = Calc.lerp(player.vx, speed, acceleration);
    } else if (left.isDown && right.isUp) {
        player.vx = Calc.lerp(player.vx, -speed, acceleration);
    } else {
        if (grounded)
            player.vx *= dragX;
        else
            player.vx *= dragXAir;
    }

    player.vx *= delta;
    player.xy *= delta;

    collisionRectangle(player, squares)

    player.x += player.vx;
    player.y += player.vy;
    app.stage.pivot.x = Calc.lerp(app.stage.pivot.x, player.x - (innerWidth * 0.5) / app.stage.scale.x + player.width * 0.5, cameraSmoothTime);
    app.stage.pivot.y = Calc.lerp(app.stage.pivot.y, player.y - (innerHeight * 0.5) / app.stage.scale.y + player.height * 0.5, cameraSmoothTime);
}

// -----------------------------------------------======== Functions ========----------------------------------------------- //

function createSqaure(x: number, y: number) {
    let num: number = squares.length;
    squares[num] = new Graphics();
    squares[num].beginFill(0xc45c28).drawRect(0, 0, 1, 1).endFill();
    squares[num].position.set(x, y);
    app.stage.addChild(squares[num]);
}

function collisionRectangle(r1: any, r2: any) {
    // make it work with different anchor points
    if (r2.length === undefined) {
        r2 = [r2];
    }

    let futureX = new PIXI.Rectangle(r1.x + r1.vx, r1.y, r1.width, r1.height);
    let futureY = new PIXI.Rectangle(r1.x, r1.y + r1.vy, r1.width, r1.height);

    r2.forEach((r2: any) => {
        if (hitTestRectangle(futureX, r2)) {
            if (r1.vx > 0) {
                r1.vx = -r1.width + r2.x - r1.x;
                onCollision(r2, "Right");
            } else if (r1.vx < 0) {
                r1.vx = r2.width + r2.x - r1.x;
                onCollision(r2, "Left");
            }
        }
        if (hitTestRectangle(futureY, r2)) {
            if (r1.vy > 0) {
                r1.vy = -r1.height + r2.y - r1.y;
                onCollision(r2, "Down");
            } else if (r1.vy < 0) {
                r1.vy = r2.height + r2.y - r1.y;
                onCollision(r2, "Up");
            }
        }

    });
}

function onCollision(obj: any, dir: string) {
    if (dir === "Down") {
        coyoteTime = MaxCoyoteTime;
        jumped = false;
    }
}

function hitTestRectangle(r1: any, r2: any) {

    // Define the variables we'll need to calculate
    let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

    // hit will determine whether there's a collision
    hit = false;

    // Find the center points of each sprite
    r1.centerX = r1.x + r1.width / 2;
    r1.centerY = r1.y + r1.height / 2;
    r2.centerX = r2.x + r2.width / 2;
    r2.centerY = r2.y + r2.height / 2;

    // Find the half-widths and half-heights of each sprite
    r1.halfWidth = r1.width / 2;
    r1.halfHeight = r1.height / 2;
    r2.halfWidth = r2.width / 2;
    r2.halfHeight = r2.height / 2;

    // Calculate the distance vector between the sprites
    vx = r1.centerX - r2.centerX;
    vy = r1.centerY - r2.centerY;

    // Figure out the combined half-widths and half-heights
    combinedHalfWidths = r1.halfWidth + r2.halfWidth;
    combinedHalfHeights = r1.halfHeight + r2.halfHeight;

    // Check for a collision on the x axis
    if (Math.abs(vx) < combinedHalfWidths) {
        // A collision might be occurring. Check for a collision on the y axis
        if (Math.abs(vy) < combinedHalfHeights) {
            // There's definitely a collision happening
            hit = true;
        } else {
            // There's no collision on the y axis
            hit = false;
        }
    } else {
        // There's no collision on the x axis
        hit = false;
    }
    // `hit` will be either `true` or `false`
    return hit;
};