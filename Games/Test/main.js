// -----------------------------------------------======== PIXI ========----------------------------------------------- //

// Preserves pixels when upscaling
PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

// Aliases
let Application = PIXI.Application,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite,
    Text = PIXI.Text,
    TextStyle = PIXI.TextStyle;
Graphics = PIXI.Graphics;
Container = PIXI.Container;
Rectangle = PIXI.rectangle;

// Create a Pixi Application
let app = new PIXI.Application({
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
PIXI.loader
    .load(setup);

let left = Input.keyboard("a"),
    right = Input.keyboard("d"),
    up = Input.keyboard("w"),
    down = Input.keyboard("s");

window.addEventListener("mousemove", e => {
    worldMousePos = new Vector(e.clientX, e.clientY)
}, false);

let world, worldMousePos;
let player;
let speed = 6 / 60; // M/s
let acceleration = 0.4;
let cameraSmoothTime = 0.2;
let drag = 0.5;


//window.addEventListener("wheel", event => zoom *= 1 + event.deltaY / 5000);

// -----------------------------------------------======== Setup ========----------------------------------------------- //

// This will run when the image has loaded
function setup() {

    let style = new TextStyle({
        fontFamily: "Arial",
        fontSize: 36,
        fill: "white"
    })

    // World Container
    world = new Container();
    app.stage.addChild(world);
    app.stage.scale.set(70);

    graphics = new Graphics();
    graphics.beginFill(0xFF3300);
    // graphics.lineStyle(1/8, 0xffd900, 1);
    graphics.moveTo(0, 0);
    graphics.lineTo(0, 5);
    graphics.lineTo(5, 0);
    graphics.lineTo(0, 0);
    graphics.endFill();
    app.stage.addChild(graphics);

    player.vx = 0;
    player.vy = 0;

    state = World
    app.ticker.add(delta => Update(delta));
}

function Update(delta) {
    state(delta);
}

// -----------------------------------------------======== Play ========----------------------------------------------- //

function World(delta) {
    delta *= 1;

    if (up.isDown && down.isUp) {
        player.vy = lerp(player.vx, speed, acceleration);
    } else if (down.isDown && up.isUp) {
        player.vy = lerp(player.vx, -speed, acceleration);
    } else {
        player.vy *= drag;
    }
    
    if (right.isDown && left.isUp) {
        player.vx = lerp(player.vx, speed, acceleration);
    } else if (left.isDown && right.isUp) {
        player.vx = lerp(player.vx, -speed, acceleration);
    } else {
        player.vx *= drag;
    }

    player.vx *= delta;
    player.xy *= delta;

    player.x += player.vx;
    player.y += player.vy;

    app.stage.pivot.x = lerp(app.stage.pivot.x, player.x - (innerWidth * 0.5) / app.stage.scale.x + player.width * 0.5, cameraSmoothTime);
    app.stage.pivot.y = lerp(app.stage.pivot.y, player.y - (innerHeight * 0.5) / app.stage.scale.y + player.height * 0.5, cameraSmoothTime);
}