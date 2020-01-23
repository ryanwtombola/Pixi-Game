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

class Calc {
    clamp(num, min, max) {
        return num <= min ? min : num >= max ? max : num;
    }

    lerp(start, end, percent) {
        return (1 - percent) * start + percent * end
    }
    Math

    loop(num, min, max) {
        return num < min ? max : num > max ? min : num;
    }
}

class Input {
    keyboard(value) {
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

}