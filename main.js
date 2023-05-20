import * as PIXI from "pixi.js"

class Vector {
    static zero = new Vector(0, 0);
    static one = new Vector(1, 1);
    static half = new Vector(0.5, 0.5);

    static up = new Vector(0, 1);
    static right = new Vector(1, 0);
    static down = new Vector(0, -1);
    static left = new Vector(-1, 0);

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    // Returns the magnitude of the vector
    magnitude() {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        }
        // Returns the normalized vector (direction)
    normalized() {
        var magnitude = this.magnitude();
        if (magnitude != 0)
            return new Vector(this.x / magnitude, this.y / magnitude);
        else return 0;
    }
    floor() {
        return new Vector(Math.floor(this.x), Math.floor(this.y));
    }
    clamp(minX, minY, maxX, maxY) {
        return new Vector(clamp(this.x, minX, maxX), clamp(this.y, minY, maxY));
    }
    lerp(start, end, percent) {
        return new Vector(
            lerp(start.x, end.x, percent),
            lerp(start.y, end.y, percent)
        );
    }

    // Caluclates the distance from one vector to another and returns a vector
    distanceTo(target) {
            if (typeof target === "object") {
                target = new Vector(target.x, target.y);
            }
            return new Vector(target.x - this.x, target.y - this.y);
        }
        // Calculates the direction to another vector and returns a normalized vector
    directionTo(target) {
            if (typeof target === "object") {
                target = new Vector(target.x, target.y);
            }
            return this.distanceTo(target).normalized();
        }
        // Returns the distace to the target as a float (non directional)
    distance(target) {
        if (typeof target === "object") {
            target = new Vector(target.x, target.y);
        }
        return this.distanceTo(target).magnitude();
    }

    // Takes two vectors and returns their sum
    add(value) {
            if (typeof value === "number") {
                value = new Vector(value, value);
            }
            return new Vector(this.x + value.x, this.y + value.y);
        }
        // Takes two vectors and subtracts one from the other
    subtract(value) {
            if (typeof value === "number") {
                value = new Vector(value, value);
            }
            return new Vector(this.x - value.x, this.y - value.y);
        }
        // Takes two vectors and returns their product
    multiply(value) {
            if (typeof value === "number") {
                value = new Vector(value, value);
            }
            return new Vector(this.x * value.x, this.y * value.y);
        }
        // Divides a vetor by by another and returns a vector
    divide(value) {
        if (typeof value === "number") {
            value = new Vector(value, value);
        }
        if (value.x != 0 && value.y != 0)
            return new Vector(this.x / value.x, this.y / value.y);
        else return value.zero;
    }

    // Converts an angle in radians to a vector
    radToVector(value) {
            return new Vector(Math.cos(value), Math.sin(value));
        }
        // Converts a vector to an angle in radians
    toRad() {
        return Math.atan2(this.x, this.y);
    }
    toVector(object) {
        return new Vector(object.x, object.y);
    }
    toLocal() {
        return this.add(new Vector(app.stage.pivot.x, app.stage.pivot.y));
    }
    rotate(radians) {
        return new Vector(
            this.x * Math.cos(radians) - this.y * Math.sin(radians),
            this.x * Math.sin(radians) + this.y * Math.cos(radians)
        );
    }
}

class Part {
    sprite;
    parent;
    container;

    constructor(spriteName, attachments, mass) {
        this.sprite;
        this.parent;
        this.container;
        this.spriteName = spriteName;
        this.attachments = attachments;
        this.mass = mass;
        this.position = Vector.zero;
    }

    addPart(x, y, parent) {
        this.position = new Vector(x, y);

        this.parent = parent;
        this.container = parent.container;
        this.sprite = new Sprite(id[this.spriteName]);
        this.sprite.position.set(x, y);
        this.sprite.scale.set(1 / 16);
        this.container.addChild(this.sprite);
    }

    removePart() {
        this.container.removeChild(this.sprite);
    }

    destroy() {
        let explosion = new Sprite(id[this.spriteName]);
        let worldPos = this.parent.worldPos(this.position.subtract(this.parent.COM.add(Vector.half)));
        explosion.scale.set(0.25);
        let explosionPos = worldPos.subtract(new Vector(explosion.width / 2, explosion.height - 2));
        explosion.position.set(explosionPos.x, explosionPos.y);
        explosion.rotation = gravity(worldPos).toRad();
        world.addChild(explosion);
        this.removePart();
        return explosion;
    }
}

class FuelTank extends Part {
    constructor(spriteName, attachments, dryMass, wetMass, fuel) {
        super(spriteName, attachments, wetMass);
        this.dryMass = dryMass;
        this.wetMass = wetMass;
        this.fuel = fuel;
        this.fuelMax = fuel;
    }

    drain(amount) {
        this.fuel = clamp(this.fuel - amount, 0, this.fuelMax);
        this.mass = lerp(this.dryMass, this.wetMass, this.fuel / this.fuelMax);
    }
}

class Engine extends Part {
    constructor(spriteName, attachments, mass, thrust, plumeSpriteName) {
        super(spriteName, attachments, mass);
        this.thrust = thrust;
        this.plumeSpriteName = plumeSpriteName;
        this.plume;
    }

    addPart(x, y, parent) {
        super.addPart(x, y, parent);
        this.plume = new Sprite(id[this.plumeSpriteName]);
        this.plume.position.set(0, 16)
        this.sprite.addChild(this.plume);
        this.plume.visible = false;
    }


}

class Cabin extends Part {
    constructor(spriteName, attachments, mass) {
        super(spriteName, attachments, mass);
    }
}

class Rocket {
    constructor(x, y, width, height) {
        this.container = new Container();
        this.width = width;
        this.height = height;
        this.parts = [
            [],
            []
        ];
        this.parts = [...Array(width)].map(e => Array(height).fill(undefined));
        this.fuelTanks = [];
        this.engines = [];
        this.destroyedParts = [];

        this.mass;
        this.COM;
        this.fuel;
        this.fuelMax;
        this.thrust;

        this.position = new Vector(x, y);
        this.rotation = 0;
        this.velocity = Vector.zero;
        this.angularVelocity = 0;
        this.scale = 16 * 8;

        this.calculateProperties();
        this.move();
    }

    move(delta) {
        if (delta === undefined)
            delta = 1;
        this.position = this.position.add(this.velocity.multiply(delta));
        this.rotation += this.angularVelocity * 1;
        this.container.position.set(this.position.x, this.position.y);
        this.container.rotation = this.rotation;
        this.container.scale.set(this.scale);
    }

    thrusts(delta) {
        if (delta === undefined)
            delta = 1;

        if (this.fuelTanks.length !== 0) {
            this.engines.forEach(e => {
                this.velocity = this.velocity.add(Vector.down.rotate(this.rotation).multiply(e.thrust * delta).divide(this.mass * 60));
                e.plume.visible = true;
            });
            //console.log(this.fuelTanks.map(f => f.fuel.toFixed(2)));
            this.fuel = 0;
            this.fuelTanks.forEach(t => {
                if (t !== undefined) {
                    t.drain(rocket.thrust / this.fuelTanks.length * delta);
                    this.fuel += t.fuel;
                }
            });
            this.changeCOM();
        }
    }

    placePart(part, x, y) {
        if (x < 0 || y < 0 || x >= this.parts.length || y >= this.parts[x].length) {
            return;
        }
        if (this.parts[x][y] === undefined) {
            this.parts[x][y] = Object.assign(new part.constructor(), part);
            this.parts[x][y].addPart(x, y, this);
        } else {
            this.parts[x][y].removePart();
            this.parts[x][y] = undefined;
        }
        this.calculateProperties();
    }

    calculateProperties() {
        this.mass = 0;
        this.fuel = 0;
        this.fuelMax = 0;
        this.thrust = 0;
        this.height = 0;
        this.fuelTanks = [];
        this.engines = [];

        let mx = 0,
            my = 0;
        for (let x = 0; x < this.parts.length; x++) {
            for (let y = 0; y < this.parts[0].length; y++) {
                const part = this.parts[x][y];
                if (part !== undefined) {
                    this.mass += part.mass;

                    if (part.constructor.name === "FuelTank") {
                        this.fuelTanks.push(part);
                        this.fuel += part.fuel;
                        this.fuelMax += part.fuelMax;
                    } else if (part.constructor.name === "Engine") {
                        this.engines.push(part);
                        this.thrust += part.thrust;
                    }

                    mx += part.mass * x;
                    my += part.mass * y;
                    if (y + 1 > this.height)
                        this.height = y + 1;
                }
            }
        }
        if (this.mass != 0)
            this.COM = new Vector(mx / this.mass, my / this.mass);

        // console.clear();
        // console.log(`Mass: ${this.mass} Fuel: ${this.fuel} Thrust: ${this.thrust}`);
        // console.log(`Thrust to Weight: ${this.thrust / this.mass}`);
    }

    worldPos(value) {
        return this.position.add(Vector.zero.toVector(value).add(Vector.half).rotate(this.rotation).multiply(this.scale))
    }

    localPos(value) {
        let pos = value
            .subtract(this.position)
            .rotate(-this.rotation)
            .divide(this.scale);
        //console.log(pos.floor());
        return pos;
    }

    checkCollisions() {
        let partCount = 0;
        for (let x = 0; x < this.parts.length; x++) {
            for (let y = 0; y < this.parts[0].length; y++) {
                if (this.parts[x][y] !== undefined) {
                    partCount++;
                    if (this.worldPos(this.parts[x][y].sprite).distance(planet) <= planet.radius + 2 && alive) {
                        this.destroyedParts.push(this.parts[x][y].destroy());
                        this.parts[x][y] = undefined;
                        this.changeCOM();
                    }
                }
            }
        }
        if (partCount <= 0) {
            alive = false;
        }
    }

    changeCOM() {
        let prevCOM = this.COM;
        this.calculateProperties();
        let COMDiff = prevCOM.subtract(this.COM);
        this.position = this.position.subtract(COMDiff.multiply(4).rotate(this.rotation));
        for (let x = 0; x < this.parts.length; x++) {
            for (let y = 0; y < this.parts[0].length; y++) {
                if (this.parts[x][y] !== undefined) {
                    this.parts[x][y].sprite.x += COMDiff.x;
                    this.parts[x][y].sprite.y += COMDiff.y;
                }
            }
        }
    }
}
function trajectory(position, velocity, maxIterations, scale) {
    var points = [],
        vel = [],
        length = 0;
    fullOrbit = gravity(position).toRad() + Math.PI,
        currentAngle = 0,
        looped = false,
        playerDistance = position.distance(planet),
        lastDistance = Vector.zero,
        apoapsis = Vector.zero,
        apoapsisDistance = 0;
    periapsis = Vector.zero;
    periapsisDistance = 0;

    scale /= Math.pow(maxIterations, 1.5);

    points[0] = position;
    vel[0] = velocity;

    for (let i = 1; i < maxIterations; i++) {
        let gravForce = gravity(points[i - 1]);
        lastDistance = points[i - 1].distance(planet);
        length = scale * Math.pow(lastDistance, 1.5);

        if (gravForce != Vector.zero) {
            collisionCourse = false;
            if (currentAngle > fullOrbit) {
                looped = true;
            }

            if (looped && currentAngle < fullOrbit + 0.1) {
                points[i] = position;
                break;
            } else {
                currentAngle = gravForce.toRad() + Math.PI;
                vel[i] = vel[i - 1].add(gravForce.multiply(length));
                points[i] = points[i - 1].add(vel[i].multiply(length));
            }

            var distance = points[i].distance(planet);
            if (distance > apoapsisDistance) {
                if (playerDistance > distance) {
                    apoapsis = position;
                } else {
                    apoapsis = points[i];
                    apoapsisDistance = distance;
                }
            }
            if (distance < periapsisDistance || periapsisDistance === 0) {
                periapsis = points[i];
                periapsisDistance = distance;
            }
        } else {
            collisionCourse = true;
            break;
        }
    }

    apoapsisIcon.position.set(apoapsis.x, apoapsis.y);
    periapsisIcon.position.set(periapsis.x, periapsis.y);

    return points;
}

function lerp(start, end, percent) {
    return (1 - percent) * start + percent * end;
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
    };

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

function gravity(position) {
    let relativePosition = position.distanceTo(planet);
    let distance = relativePosition.magnitude();
    if (distance > planet.radius) {
        let direction = relativePosition.normalized();
        let gravForce = (planet.radius * 100 * 10) / (distance * distance);
        return direction.multiply(gravForce);
    } else {
        return Vector.zero;
    }
}

function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
}

function loop(num, min, max) {
    return num < min ? max : num > max ? min : num;
}

function changeTimeWarpText(text) {
    timeWarpText.alpha = 4;
    timeWarpText.text = text;
}

function animate(object, animationName, loop = false, delta = 1) {
    let animation = json.meta.frameTags.find(x => x.name === animationName);

    if (object.lastAnimation !== animationName) {
        object.frame = animation.from;
    }

    if (object.frame < animation.to + 1) {
        let spriteNumber = object.frame - (object.frame % 1);
        object.texture = id["Space Tilesheet " + spriteNumber + ".aseprite"];
        let frameDuration =
            json.frames["Space Tilesheet " + spriteNumber + ".aseprite"].duration;
        object.frame += 1 / (((60 / delta) * frameDuration) / 1000);
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

class Line extends PIXI.Graphics {
  constructor(points, lineSize, lineColor) {
    super();

    var s = (this.lineWidth = lineSize || 5);
    var c = (this.lineColor = lineColor || "0x000000");

    this.points = points;

    this.lineStyle(s, c);

    this.moveTo(points[0].x, points[0].y);
    this.lineTo(points[1].x, points[1].y);
  }

  updatePoints(p) {
    var points = (this.points = p.map(
      (val, index) => val || this.points[index]
    ));

    var s = this.lineWidth;
    var c = this.lineColor;

    this.clear();

    for (let i = 0; i < points.length - 1; i++) {
      this.lineStyle(s, c, lerp(0.8, 0, i / (points.length - 1)));
      this.moveTo(points[i].x, points[i].y);
      this.lineTo(points[i + 1].x, points[i + 1].y);
    }
  }
}


// -----------------------------------------------======== PIXI ========----------------------------------------------- //

// Preserves pixels when upscaling
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

// Aliases
let Application = PIXI.Application,
    loader = PIXI.Loader.shared,
    resources = loader.resources,
    Sprite = PIXI.Sprite,
    Text = PIXI.Text,
    TextStyle = PIXI.TextStyle,
    Graphics = PIXI.Graphics,
    Container = PIXI.Container;

// Create a Pixi Application
let app = new Application({
    width: window.innerWidth,
    height: window.innerHeight,
    antialias: true,
    transparent: false,
    resolution: 1,
    forceFXAA: false,
    roundPixels: true,
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
    .add("assets/space-spritesheet.json")
    .add("assets/Launchpad Mockup.png")
    .add("assets/VAB.png")
    .load(setup);

let left = keyboard("a"),
    right = keyboard("d"),
    up = keyboard("w"),
    down = keyboard("s"),
    keyM = keyboard("m"),
    comma = keyboard("q"),
    period = keyboard("e");

window.addEventListener("mousemove", e => { worldMousePos = new Vector(e.clientX, e.clientY); }, false);
window.addEventListener("wheel", event => {
    zoom *= 1 + event.deltaY / 5000;
    if (state.name === "VAB") {
        partScroll = loop(partScroll + event.deltaY / 60, 0, parts.length - 0.01);
        partIndex = Math.floor(partScroll)
        ghost.texture = id[parts[partIndex].spriteName];
    }
});

window.addEventListener("click", click => {
    if (state.name === "VAB") {
        let x = mouseGrid.x,
            y = mouseGrid.y;
        rocket.placePart(parts[partIndex], x, y);
    }
});

// -----------------------------------------------======== Setup ========----------------------------------------------- //

let json;
let request = new XMLHttpRequest();
request.open("GET", "assets/space-spritesheet.json", true);
request.onload = function() {
    json = JSON.parse(this.response);
};
request.send();

const drag = 0.02,
    rotationSpeed = 0.001,
    brakingForce = 0.05;

var vab, spaceShip, ghost, mouseGrid;

var id;

var line,
    apoapsisIcon,
    periapsisIcon,
    heading,
    headingCircle,
    fuelBar,
    collisionCourse = false,
    COMIcon;
var GUI, velocityText, altitudeText, fuelText, headingText, timeWarpText, instructionText, instructionText2;
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
let partIndex = 0,
    partScroll = 0;
let parts = [cabin, tank, engine];

let rocket, camera = Vector.zero;

// This will run when the image has loaded
function setup() {
    // Create an alias called id for all the textures
    id = resources["assets/space-spritesheet.json"].textures;

    let style = new TextStyle({
        fontFamily: "Arial",
        fontSize: 36,
        fill: "white"
    });

    let style2 = new TextStyle({
        fontFamily: "Arial",
        fontSize: 32,
        fill: "#333941",
        wordWrap: true,
        wordWrapWidth: window.innerWidth - 99 * 8
    });

    let style3 = new TextStyle({
        fontFamily: "Arial",
        fontSize: 30,
        fill: "white",
        //wordWrap: true,
        //wordWrapWidth: window.innerWidth - 99 * 8
    });

    // --- Vehicle Assembley Building --- //

    vab = new Container();
    app.stage.addChild(vab);

    let vabBackground = new Sprite(resources["assets/VAB.png"].texture);
    vabBackground.scale.set(8)
    vab.addChild(vabBackground);

    instructionText = new Text("Click within the building area to add or remove a part. \n\nUse the scroll wheel to cycle between the different parts. \n\nYou can add a Rocket Engine, Fuel Tank and a Crew Cabin. \n\nPress M when you are ready to launch!", style2);
    vab.addChild(instructionText);
    instructionText.position = new Vector(99 * 8, 45 * 8);

    rocket = new Rocket(8 * 8, 8 * 8, 3, 5);
    vab.addChild(rocket.container);
    rocket.placePart(cabin, 1, 0);
    rocket.placePart(tank, 1, 1);
    rocket.placePart(tank, 1, 2);
    rocket.placePart(tank, 1, 3);
    rocket.placePart(engine, 1, 4);

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
    let world = new Container();
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
    let launchpad = new Sprite(resources["assets/Launchpad Mockup.png"].texture);
    launchpad.anchor.set(0.375, 1);
    launchpad.y = -637100;
    launchpad.scale.set(0.25);
    world.addChild(launchpad);

    // --- Map --- //

    // Map Overlay
    let map = new Container();
    world.addChild(map);

    // Trajectory Line
    let trajectoryLine = new Line([200, 10, 0, 0], 2, "0xffffff");
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

    instructionText2 = new Text("Press W to launch.\nUse A & D to rotate.\nUse Q & E to time warp.\nPress M for map and\nuse scroll to zoom.", style);
    GUI.addChild(instructionText2);
    instructionText2.position = new Vector(window.innerWidth - 400, 0);

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
    let kerb = new Sprite(id["Space Tilesheet 22.aseprite"]);
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
                zoom = 0.05;
            } else if (zoom <= mapThreshold) {
                zoom = 3000;
            }
        } else {
            launch();
        }
    };

    comma.press = () => {
        if (state.name === "World") {
            if (timeWarpIndex > 0) {
                timeWarpIndex--;
                timeWarp = timeWarps[timeWarpIndex];
                changeTimeWarpText(timeWarp + "x TimeWarp");
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
            // rocket.angularVelocity *= (1 - brakingForce) / delta;
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