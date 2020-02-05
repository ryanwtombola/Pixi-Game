export class Vector extends PIXI.Point {

    static readonly zero: Vector = new Vector(0, 0);
    static readonly one: Vector = new Vector(1, 1);
    static readonly half: Vector = new Vector(0.5, 0.5);

    static readonly up: Vector = new Vector(0, 1);
    static readonly right: Vector = new Vector(1, 0);
    static readonly down: Vector = new Vector(0, -1);
    static readonly left: Vector = new Vector(-1, 0);

    constructor(x: number, y: number) {
        super(x, y);
    }

    // Adds a vector to this vector
    Add(value: Vector): Vector {
        return new Vector(this.x + value.x, this.y + value.y);
    }

    // Adds a number to both axis on this vector
    AddNum(value: number): Vector {
        return new Vector(this.x + value, this.y + value);
    }

    // Subtracts a vector from this vector
    Subtract(value: Vector): Vector {
        return new Vector(this.x - value.x, this.y - value.y);
    }

    // Subtracts a number from both axis on this vector
    SubtractNum(value: number): Vector {
        return new Vector(this.x - value, this.y - value);
    }

    // Multiples this vector by another
    Multiply(value: Vector): Vector {
        return new Vector(this.x * value.x, this.y * value.y);
    }

    // Multiplies this vector by number
    MultiplyNum(value: number): Vector {
        return new Vector(this.x * value, this.y * value);
    }

    // Divides this vetor by another
    Divide(value: Vector): Vector {
        if (value.x != 0 && value.y != 0)
            return new Vector(this.x / value.x, this.y / value.y);
        else
            return Vector.zero;
    }

    // Divides this vector by a number
    DivideNum(value: number): Vector {
        if (value != 0)
            return new Vector(this.x / value, this.y / value);
        else
            return Vector.zero;
    }

    // Floors both axis of this vector
    Floor(): Vector {
        return new Vector(Math.floor(this.x), Math.floor(this.y));
    }

    // Locks this vector within a specifed range
    Clamp(minX: number, minY: number, maxX: number, maxY: number): Vector {
        return new Vector(Calc.Clamp(this.x, minX, maxX), Calc.Clamp(this.y, minY, maxY));
    }

    // Gets the magnitude of this vector
    Magnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    // Normalizes this vector
    Normalized(): Vector {
        const magnitude: number = this.Magnitude();
        if (magnitude != 0)
            return this.DivideNum(magnitude);
        else return Vector.zero;
    }

    // Gets the distance from this vetor to another as a vector
    DistanceTo(target: Vector): Vector {
        return target.Subtract(this);
    }

    // Gets the distance from this vetor to another as a number
    Distance(target: Vector): number {
        return this.DistanceTo(target).Magnitude();
    }

    // Gets the directon from this vector to another
    DirectionTo(target: Vector): Vector {
        return this.DistanceTo(target).Normalized();
    }

    // Interpolates to another vector
    LerpTo(target: Vector, percent: number): Vector {
        return Vector.Lerp(this, target, percent);
    }

    // Checks if this vector is equal to a target vector
    CompareTo(target: Vector): boolean {
        return (target.x === this.x && target.y === this.y);
    }

    // Converts this vector to an angle in radians
    ToRad(): number {
        return Math.atan2(this.x, this.y);
    }

    // Rotates this vector by radians
    Rotate(radians: number): Vector {
        return new Vector(
            this.x * Math.cos(radians) - this.y * Math.sin(radians),
            this.x * Math.sin(radians) + this.y * Math.cos(radians)
        );
    }

    // Converts an angle in radians to a vector
    static RadToVector(value: number): Vector {
        return new Vector(Math.cos(value), Math.sin(value));
    }

    // Interpolates between two vectors
    static Lerp(start: Vector, end: Vector, percent: number): Vector {
        return new Vector(
            Calc.Lerp(start.x, end.x, percent),
            Calc.Lerp(start.y, end.y, percent)
        );
    }

    // Creates a vetor from an object
    static To(object: any): Vector {
        return new Vector(object.x, object.y);
    }

}

export class Calc {

    // Locks a value within a specified range
    static Clamp(value: number, min: number, max: number): number {
        return value <= min ? min : value >= max ? max : value;
    }

    // Interpolates between two numbers
    static Lerp(start: number, end: number, percent: number): number {
        return (1 - percent) * start + percent * end
    }

    // Loops over a specified range
    static Loop(value: number, min: number, max: number): number {
        return this.Mod(value, max - min) + min;
    }

    // Modulo Operator
    static Mod(value: number, mod: number): number {
        return ((value % mod) + mod) % mod;
    }
}