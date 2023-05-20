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