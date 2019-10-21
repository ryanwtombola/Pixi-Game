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
    .add("Assets/Launchpad Mockup.png")
    .add("Assets/VAB.png")
    .load(setup);

let left = keyboard("a"),
    right = keyboard("d"),
    up = keyboard("w"),
    down = keyboard("s");
keyM = keyboard("m");
comma = keyboard("q");
period = keyboard("e");

window.addEventListener(
    "mousemove",
    e => {
        worldMousePos = new Vector(e.clientX, e.clientY);
    },
    false
);
window.addEventListener("wheel", event => (zoom *= 1 + event.deltaY / 5000));

// -----------------------------------------------======== Setup ========----------------------------------------------- //

let json;
let request = new XMLHttpRequest();
request.open("GET", "Assets/space-spritesheet.json", true);
request.onload = function() {
    json = JSON.parse(this.response);
};
request.send();

const drag = 0.02,
    rotationSpeed = 0.002,
    brakingForce = 0.05;

let vab, spaceShip, ghost, mouseGrid;

var line,
    apoapsisIcon,
    periapsisIcon,
    heading,
    headingCircle,
    fuelBar,
    collisionCourse = false,
    COMIcon;
var GUI, velocityText, altitudeText, fuelText, headingText, timeWarpText;
let state,
    alive = true,
    launched,
    altitude,
    planet;
let zoom = 0.05,
    mapThreshold = 5,
    mapTransition = 6;
let worldMousePos = Vector.zero,
    localMousePos = Vector.zero;
let timeWarp = 1,
    timeWarpIndex = 0,
    timeWarps = [1, 2, 5, 10, 50, 100, 500, 1000, 5000, 10000, 50000, 100000];

let cabin = new Cabin("Space Tilesheet 27.aseprite", [0, 0, 1, 0], 0.4);
let tank = new FuelTank("Space Tilesheet 28.aseprite", [1, 2, 1, 2], 0.5, 4, 8000);
//let lightweightTank = new FuelTank("Space Tilesheet 28.aseprite", [1, 2, 1, 2], 0.5, 300);
let engine = new Engine("Space Tilesheet 29.aseprite", [1, 0, 2, 0], 0.6, 5, "Space Tilesheet 30.aseprite");
let partIndex = 0;
let parts = [cabin, tank, engine];

let rocket, camera = Vector.zero;

// for (let i = 0; i < rocket.parts[1].length; i++) {
//     console.log(rocket.parts[1]);
// }

// This will run when the image has loaded
function setup() {
    // Create an alias called id for all the textures
    id = resources["Assets/space-spritesheet.json"].textures;

    let style = new TextStyle({
        fontFamily: "Arial",
        fontSize: 36,
        fill: "white"
    });

    // --- Vehicle Assembley Building --- //

    vab = new Container();
    app.stage.addChild(vab);

    let vabBackground = new Sprite(resources["Assets/VAB.png"].texture);
    vabBackground.scale.set(8)
    vab.addChild(vabBackground);

    rocket = new Rocket(2 * 16 * 8, 16 * 8, 3, 6);
    vab.addChild(rocket.container);
    rocket.placePart(cabin, 1, 1);
    rocket.placePart(tank, 1, 2);
    rocket.placePart(tank, 1, 3);
    rocket.placePart(tank, 1, 4);
    rocket.placePart(engine, 1, 5);

    ghost = new Sprite(id[parts[partIndex].spriteName]);
    ghost.scale.set(1 / 16)
    rocket.container.addChild(ghost);

    COMIcon = new Graphics();
    COMIcon.beginFill(0xffff60)
        .lineStyle(5, 0x2a262e)
        .drawCircle(0, 0, 14)
        .endFill();
    vab.addChild(COMIcon);

    // --- World Elements --- //

    // World Container
    world = new Container();
    app.stage.addChild(world);

    // Planet
    planet = new Graphics();
    planet.beginFill(0x285cc4);
    planet.lineStyle(10, 0x14a02e);
    planet.drawCircle(0, 0, 63705);
    planet.endFill();
    planet.position.set(0);
    planet.scale.set(10);
    world.addChild(planet);
    planet.radius = planet.width / 2;

    // Launchpad
    let launchpad = new Sprite(resources["Assets/Launchpad Mockup.png"].texture);
    launchpad.anchor.set(0.375, 1);
    launchpad.y = -637100;
    launchpad.scale.set(0.25);
    world.addChild(launchpad);

    // --- Map --- //

    // Map Overlay
    map = new Container();
    world.addChild(map);

    // Trajectory Line
    trajectoryLine = new Line([200, 10, 0, 0], 2, "0xffffff");
    map.addChild(trajectoryLine);

    // Apoapsis
    apoapsisIcon = new Sprite(id["Space Tilesheet 20.aseprite"]);
    apoapsisIcon.anchor.set(0.5, 1);
    map.addChild(apoapsisIcon);

    // Periapsis
    periapsisIcon = new Sprite(id["Space Tilesheet 21.aseprite"]);
    periapsisIcon.anchor.set(0.5, 1);
    map.addChild(periapsisIcon);

    // --- GUI --- //

    // GUI Container
    GUI = new Container();
    world.addChild(GUI);

    // Velocity
    velocityText = new Text("Velocity: ", style);
    GUI.addChild(velocityText);
    velocityText.position = new Vector(10, 0);

    // Altitude
    altitudeText = new Text("Altitude: ", style);
    GUI.addChild(altitudeText);
    altitudeText.position = new Vector(10, 50);

    // Fuel
    fuelText = new Text("Fuel: ", style);
    GUI.addChild(fuelText);
    fuelText.position.set(10, 100);

    fuelBar = new PIXI.Container();
    fuelBar.position.set(100, 100);
    GUI.addChild(fuelBar);

    let innerBar = new Graphics();
    innerBar.beginFill(0x555555);
    innerBar.drawRect(0, 0, 200, 40);
    innerBar.endFill();
    fuelBar.addChild(innerBar);

    let outerBar = new PIXI.Graphics();
    outerBar.beginFill(0xff3300);
    outerBar.drawRect(0, 0, 200, 40);
    outerBar.endFill();
    fuelBar.addChild(outerBar);

    fuelBar.outer = outerBar;

    // Heading
    headingText = new Text("Heading: ", style);
    GUI.addChild(headingText);
    headingText.position.set(10, 160);

    headingCircle = new Graphics();
    headingCircle.beginFill(0xdddddd);
    headingCircle.lineStyle(5, 0x555555);
    headingCircle.drawCircle(0, 0, 20);
    headingCircle.endFill();
    headingCircle.position.set(190, 180);
    GUI.addChild(headingCircle);

    heading = new Line([Vector.zero, Vector.one.multiply(10)], 3, "0xfc5044");
    GUI.addChild(heading);
    heading.position.set(190, 180);

    // Kerb
    kerb = new Sprite(id["Space Tilesheet 22.aseprite"]);
    kerb.anchor.set(0, 1);
    kerb.position.set(10, window.innerHeight - 10);
    kerb.scale.set(8);
    GUI.addChild(kerb);

    // Time Warp text
    timeWarpText = new Text("TimeWarp: ", style);
    GUI.addChild(timeWarpText);
    timeWarpText.anchor.set(0.5);
    timeWarpText.position = new Vector(window.innerWidth / 2, 100);
    timeWarpText.alpha = 0;
    timeWarpText.scale.set(0.5);

    // --- Keys --- //
    keyM.press = () => {
        if (state.name === "World") {
            if (zoom > mapThreshold) {
                zoom = 0.2;
            } else if (zoom <= mapThreshold) {
                zoom = 3000;
            }
        } else {
            launch();
        }
    };

    up.press = () => {
        if (state.name === "VAB") {
            let x = mouseGrid.x,
                y = mouseGrid.y;
            rocket.placePart(parts[partIndex], x, y);
        }
    };

    comma.press = () => {
        if (state.name === "World") {
            if (timeWarpIndex > 0) {
                timeWarpIndex--;
                timeWarp = timeWarps[timeWarpIndex];
                changeTimeWarpText(timeWarp + "x TimeWarp");
            }
        } else {
            if (partIndex > 0) {
                partIndex--;
                ghost.texture = id[parts[partIndex].spriteName];
            }
        }
    };

    period.press = () => {
        if (state.name === "World") {
            if (timeWarpIndex < timeWarps.length - 1) {
                timeWarpIndex++;
                timeWarp = timeWarps[timeWarpIndex];

                if (timeWarp * 1000 > altitude) {
                    changeTimeWarpText(
                        "Cannot " +
                        timeWarp +
                        "x Warp at this Altitude! Go above " +
                        timeWarp +
                        "Km"
                    );
                    if (timeWarpIndex > 0) {
                        timeWarpIndex--;
                        timeWarp = timeWarps[timeWarpIndex];
                    }
                } else {
                    changeTimeWarpText(timeWarp + "x TimeWarp");
                }
            }
        } else {
            if (partIndex < parts.length - 1) {
                partIndex++;
                ghost.texture = id[parts[partIndex].spriteName];
            }
        }
    };

    world.visible = false;
    state = VAB;
    app.ticker.add(delta => Update(delta));
}

function Update(delta) {
    localMousePos = new Vector(
        worldMousePos.x + app.stage.pivot.x,
        worldMousePos.y + app.stage.pivot.y
    );

    state(delta);
}

// -----------------------------------------------======== Play ========----------------------------------------------- //

function VAB(delta) {
    let COMPos = rocket.worldPos(rocket.COM);
    if (!isNaN(COMPos.x)) {
        COMIcon.position.set(COMPos.x, COMPos.y);
        COMIcon.visible = true;
    } else {
        COMIcon.visible = false;
    }
    mouseGrid = rocket.localPos(localMousePos).floor();
    ghost.x = mouseGrid.x;
    ghost.y = mouseGrid.y;

    rocket.parts.map(a =>
        a.map(e => {
            if (e !== undefined) e.sprite.tint = 0xffffff;
        })
    );

    if (
        mouseGrid.x >= 0 &&
        mouseGrid.x < rocket.parts.length &&
        mouseGrid.y >= 0 &&
        mouseGrid.y < rocket.parts[0].length
    ) {
        let hoveredPart = rocket.parts[mouseGrid.x][mouseGrid.y];
        if (hoveredPart !== undefined) {
            hoveredPart.sprite.tint = 0xff0000;
            ghost.visible = false;
        } else {
            ghost.visible = true;
        }
    } else {
        ghost.visible = false;
    }
}

function World(delta) {

    delta *= timeWarp;

    if (alive) {
        rocket.checkCollisions();
        camera = Vector.zero.lerp(camera, Vector.zero.toVector(rocket.position), 0.05).add(rocket.velocity.multiply(delta));

        kerb.texture = id["Space Tilesheet 22.aseprite"];

        altitude = rocket.position.distance(planet) - planet.radius;
        if (timeWarp * 1000 > altitude) {
            if (timeWarpIndex > 0) {
                timeWarpIndex--;
                timeWarp = timeWarps[timeWarpIndex];
                changeTimeWarpText(timeWarp + "x TimeWarp");
            }
        }


        fuelBar.outer.width = clamp(lerp(0, 200, rocket.fuel / rocket.fuelMax), 0, 200);

        rocket.engines.forEach(e => e.plume.visible = false);
        // Inputs
        if (up.isDown) {
            launched = true;
            if (rocket.fuel > 0) {
                if (launched) {

                    rocket.thrusts(delta);
                }
                //animate(, "Thrust", true, delta);
            }
        } else {
            //animate(rocket, "Idle", true);
        }
        if (down.isDown) {
            rocket.angularVelocity *= (1 - brakingForce) / delta;
        }

        if (launched) {
            if (left.isDown) {
                rocket.angularVelocity -= rotationSpeed / rocket.mass;
            }
            if (right.isDown) {
                rocket.angularVelocity += rotationSpeed / rocket.mass;
            }

            rocket.velocity = rocket.velocity.add(gravity(rocket.position).multiply(delta));

            rocket.move(delta);
            //velocity.x *= 1-drag;
            //velocity.y *= 1-drag;
            rocket.angularVelocity *= 1 - drag;

            var points = trajectory(rocket.position, rocket.velocity, 3000, 0.025);
            trajectoryLine.updatePoints(points);
            trajectoryLine.lineWidth = zoom * 2;
            periapsisIcon.scale.set(zoom * 2);
            apoapsisIcon.scale.set(zoom * 2);

        }

        if (altitude / 1000 < rocket.velocity.magnitude() * 2) {
            if (collisionCourse && apoapsis === rocket.position) {
                kerb.texture = id["Space Tilesheet 24.aseprite"];
            } else {
                kerb.texture = id["Space Tilesheet 23.aseprite"];
            }
        }

        // If Dead
    } else {
        animate(kerb, "KIA");
        setTimeout(function() {
            location.reload();
        }, 4000);

        if (timeWarpIndex > 0) {
            timeWarpIndex = 0;
            timeWarp = timeWarps[timeWarpIndex];
            changeTimeWarpText(timeWarp + "x TimeWarp");
        }
    }

    rocket.destroyedParts.forEach(d => {
        animate(d, "Explosion");
    });

    map.alpha = clamp((zoom - mapThreshold + mapTransition / 2) / mapTransition, 0, 1);

    // Camera

    app.stage.scale.set(1 / zoom);
    app.stage.pivot.x = camera.x - (innerWidth / 2) * zoom;
    app.stage.pivot.y = camera.y - (innerHeight / 2) * zoom;

    // GUI

    GUI.scale.set(zoom);
    GUI.position.set(app.stage.pivot.x, app.stage.pivot.y);

    velocityText.text = "Velocity: " + (rocket.velocity.magnitude() * 60).toFixed(2) + " M/s";

    if (altitude > 1000) {
        altitudeText.text = "Altitude: " + (altitude / 1000).toFixed(3) + "Km";
    } else {
        altitudeText.text = "Altitude: " + altitude.toFixed(2) + "M";
    }

    heading.updatePoints([
        Vector.zero,
        Vector.zero
        .radToVector(rocket.rotation - Math.PI / 2)
        .normalized()
        .multiply(16)
    ]);

    timeWarpText.alpha = clamp(
        timeWarpText.alpha - 4 / (60 * 3) /* <-- Time to fade */ ,
        0,
        4
    );
}

function launch() {
    state = World;
    world.visible = true;
    VAB.visible = false;
    ghost.visible = false;
    rocket.parts.map(a =>
        a.map(e => {
            if (e !== undefined) {
                e.sprite.tint = 0xffffff;
                e.sprite.x -= rocket.COM.x + 0.5;
                e.sprite.y -= rocket.COM.y + 0.5;
            }
        })
    );
    rocket.calculateProperties();
    rocket.position.x = -(rocket.width / 2 - rocket.COM.x - 0.5) * 4
    rocket.position.y = -637100 - (rocket.height - rocket.COM.y - 0.5) * 4 - 4;
    camera = rocket.position;
    rocket.scale = 16 / 4;
    world.addChild(rocket.container);

    rocket.move();
}