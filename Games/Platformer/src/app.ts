import * as PIXI from 'dist/pixi.js';

// -----------------------------------------------======== PIXI ========----------------------------------------------- //

// Preserves pixels when upscaling
PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

// Aliases
let Application = PIXI.Application,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite,
    Text = PIXI.Text,
    TextStyle = PIXI.TextStyle,
    Graphics = PIXI.Graphics,
    Container = PIXI.Container,
    Rectangle = PIXI.rectangle

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
    .add("Assets/space-spritesheet.json")
    .load(setup);

let left = keyboard("a"),
    right = keyboard("d"),
    up = keyboard("w"),
    down = keyboard("s");

window.addEventListener("mousemove", e => {
    worldMousePos = new Vector(e.clientX, e.clientY)
}, false);

let world, worldMousePos;
let player, squares = [];
let speed = 6 / 60; // M/s
acceleration = 0.4;
gravity = 1.8 / 60; // M/s^2
jumpHeight = 4; // M
jumped = false;
grounded = false;
maxJumpBuffer = 5;
jumpBuffer = 0;
MaxCoyoteTime = 5;
coyoteTime = 0;
cameraSmoothTime = 0.2;
dragX = 0.5;
dragXAir = 0.95;
dragY = 0.9;


//window.addEventListener("wheel", event => zoom *= 1 + event.deltaY / 5000);

// -----------------------------------------------======== Setup ========----------------------------------------------- //

// This will run when the image has loaded
function setup() {

    // Create an alias called id for all the textures
    id = resources["Assets/space-spritesheet.json"].textures;

    let style = new TextStyle({
        fontFamily: "Arial",
        fontSize: 36,
        fill: "white"
    })

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

    state = World
    app.ticker.add(delta => Update(delta));
}

function Update(delta) {
    state(delta);
}

// -----------------------------------------------======== Play ========----------------------------------------------- //

function World(delta) {
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
        player.vx = lerp(player.vx, speed, acceleration);
    } else if (left.isDown && right.isUp) {
        player.vx = lerp(player.vx, -speed, acceleration);
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
    app.stage.pivot.x = lerp(app.stage.pivot.x, player.x - (innerWidth * 0.5) / app.stage.scale.x + player.width * 0.5, cameraSmoothTime);
    app.stage.pivot.y = lerp(app.stage.pivot.y, player.y - (innerHeight * 0.5) / app.stage.scale.y + player.height * 0.5, cameraSmoothTime);
}

// -----------------------------------------------======== Functions ========----------------------------------------------- //

function createSqaure(x, y) {
    let num = squares.length;
    squares[num] = new Graphics();
    squares[num].beginFill(0xc45c28).drawRect(0, 0, 1, 1).endFill();
    squares[num].position.set(x, y);
    app.stage.addChild(squares[num]);
}

function collisionRectangle(r1, r2) {
    //make it work with different anchor points
    if (r2.length === undefined) {
        r2 = [r2];
    }

    let futureX = new PIXI.Rectangle(r1.x + r1.vx, r1.y, r1.width, r1.height);
    let futureY = new PIXI.Rectangle(r1.x, r1.y + r1.vy, r1.width, r1.height);

    r2.forEach(r2 => {
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

function onCollision(obj, dir) {
    if (dir === "Down") {
        coyoteTime = MaxCoyoteTime;
        jumped = false;
    }
}

function hitTestRectangle(r1, r2) {

    //Define the variables we'll need to calculate
    let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

    //hit will determine whether there's a collision
    hit = false;

    //Find the center points of each sprite
    r1.centerX = r1.x + r1.width / 2;
    r1.centerY = r1.y + r1.height / 2;
    r2.centerX = r2.x + r2.width / 2;
    r2.centerY = r2.y + r2.height / 2;

    //Find the half-widths and half-heights of each sprite
    r1.halfWidth = r1.width / 2;
    r1.halfHeight = r1.height / 2;
    r2.halfWidth = r2.width / 2;
    r2.halfHeight = r2.height / 2;

    //Calculate the distance vector between the sprites
    vx = r1.centerX - r2.centerX;
    vy = r1.centerY - r2.centerY;

    //Figure out the combined half-widths and half-heights
    combinedHalfWidths = r1.halfWidth + r2.halfWidth;
    combinedHalfHeights = r1.halfHeight + r2.halfHeight;

    //Check for a collision on the x axis
    if (Math.abs(vx) < combinedHalfWidths) {

        //A collision might be occurring. Check for a collision on the y axis
        if (Math.abs(vy) < combinedHalfHeights) {

            //There's definitely a collision happening
            hit = true;
        } else {

            //There's no collision on the y axis
            hit = false;
        }
    } else {

        //There's no collision on the x axis
        hit = false;
    }

    //`hit` will be either `true` or `false`
    return hit;
};

function lerp(start, end, percent) {
    return (1 - percent) * start + percent * end
}

function keyboard(value) {
    let key = {};
    key.value = value;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;

    // Key down handler
    key.downHandler = event => {
        if (event.key === key.value) {
            if (key.isUp && key.press) key.press();
            key.isDown = true;
            key.isUp = false;
            event.preventDefault();
        }
    };

    // Key up handler
    key.upHandler = event => {
        if (event.key === key.value) {
            if (key.isDown && key.release) key.release();
            key.isDown = false;
            key.isUp = true;
            event.preventDefault();
        }
    }

    // Attach event listeners
    const downListner = key.downHandler.bind(key);
    const upListner = key.upHandler.bind(key);


    window.addEventListener("keydown", downListner, false);
    window.addEventListener("keyup", upListner, false);

    // Detach event listners
    key.unsubscribe = () => {
        window.removeEventListener("keydown", downListner);
        window.removeEventListener("keyup", upListner);
    };

    return key;
}

function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
}

function animate(object, animationName, loop = false, delta = 1) {
    let animation = json.meta.frameTags.find(x => x.name === animationName);

    if (object.lastAnimation !== animationName) {
        object.frame = animation.from;
    }

    if (object.frame < animation.to + 1) {
        let spriteNumber = (object.frame - object.frame % 1)
        object.texture = id["Space Tilesheet " + spriteNumber + ".aseprite"];
        let frameDuration = json.frames["Space Tilesheet " + spriteNumber + ".aseprite"].duration;
        object.frame += 1 / (60 / delta * frameDuration / 1000)
    } else if (loop) {
        object.frame = animation.from;
    } else {
        object.frame = animation.to;
    }
    object.lastAnimation = animationName;
}

function createArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while (i--) arr[length - 1 - i] = createArray.apply(this, args);
    }

    return arr;
}