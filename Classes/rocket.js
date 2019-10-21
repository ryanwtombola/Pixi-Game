// Attachments is a bool array showing if the object can attach on a certain side [up, right, down, left]

class Part {
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
    constructor(spriteName, attachments, mass, thrust) {
        super(spriteName, attachments, mass);
        this.thrust = thrust;
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
            this.engines.forEach(e => this.velocity = this.velocity.add(Vector.down.rotate(this.rotation).multiply(e.thrust).divide(this.mass * 60)).multiply(delta));
            //console.log(this.fuelTanks.map(f => f.fuel.toFixed(2)));
            this.fuel = 0;
            this.fuelTanks.forEach(t => {
                if (t !== undefined) {
                    t.drain(rocket.thrust / this.fuelTanks.length);
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