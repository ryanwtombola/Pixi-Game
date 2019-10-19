// Attachments is a bool array showing if the object can attach on a certain side [up, right, down, left]

class Part {
    constructor(spriteName, attachments, mass) {
        this.sprite;
        this.parent;
        this.spriteName = spriteName;
        this.attachments = attachments;
        this.mass = mass;
    }

    addPart(x, y, parent) {
        this.parent = parent;
        this.sprite = new Sprite(id[this.spriteName]);
        this.sprite.position.set(x, y);
        this.sprite.scale.set(1 / 16);
        this.parent.addChild(this.sprite);
    }

    removePart() {
        this.parent.removeChild(this.sprite);
    }
}

class FuelTank extends Part {
    constructor(spriteName, attachments, mass, fuel) {
        super(spriteName, attachments, mass);
        this.fuel = fuel;
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
            [width],
            [height]
        ];
        this.parts = [...Array(width)].map(e => Array(height).fill(undefined));

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

        this.move();
    }

    move() {
        this.position = this.position.add(this.velocity);
        this.rotation += this.angularVelocity;
        this.container.position.set(this.position.x, this.position.y);
        this.container.rotation = this.rotation;
        this.container.scale.set(this.scale);
    }

    placePart(part, x, y) {
        if (x < 0 || y < 0 || x >= this.parts.length || y >= this.parts[x].length) {
            return;
        }
        if (this.parts[x][y] === undefined) {
            this.parts[x][y] = Object.assign(new part.constructor(), part);
            this.parts[x][y].addPart(x, y, this.container);
        } else {
            this.parts[x][y].removePart();
            this.parts[x][y] = undefined;
        }
        this.calculateProperties();
    }

    calculateProperties() {
        this.mass = 0;
        this.fuel = 0;
        this.thrust = 0;
        this.height = 0;

        this.parts.map(y =>
            y.map(part => {
                if (part !== undefined) {
                    this.mass += part.mass;

                    if (part.constructor.name === "FuelTank") {
                        this.fuel += part.fuel;
                        this.fuelMax = this.fuel;
                    } else if (part.constructor.name === "Engine") {
                        this.thrust += part.thrust;
                    }
                }
            })
        );

        let mx = 0,
            my = 0;
        for (let x = 0; x < this.parts.length; x++) {
            for (let y = 0; y < this.parts[0].length; y++) {
                const part = this.parts[x][y];
                if (part !== undefined) {
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
                        this.parts[x][y].removePart();
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