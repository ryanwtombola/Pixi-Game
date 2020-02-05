import { Component } from '../entity';
import { stage, resolution } from '../app';
import { Vector, Calc } from '../utilites';
import { Graphics } from '../aliases';

export default class Train extends Component {

    private graphics: PIXI.Graphics = new Graphics();

    private track1: Track = new Straight(Vector.zero, new Vector(500, 0));
    private track2: Track = new Straight(new Vector(500, 0), new Vector(500, 500));
    private track3: Track = new Straight(new Vector(500, 500), new Vector(0, 500));
    private track4: Track = new Straight(new Vector(0, 500), new Vector(0, 0));

    public trackCur: Track = this.track1;
    public trackPos: number = 0;
    public trackVel: number = 0;

    Start() {
        this.graphics.beginFill(0x888888)
            .lineStyle(10, 0x666666, 1, 0)
            .drawCircle(0, 0, 100)
            .endFill();
        this.entity.addChild(this.graphics);

        Track.Link(this.track1, this.track2);
        Track.Link(this.track2, this.track3);
        Track.Link(this.track3, this.track4);
        Track.Link(this.track4, this.track1);
    }

    Update(delta: number, time: number) {

        const pos: number = this.trackPos + this.trackVel * delta;
        this.trackPos = this.trackCur.CheckPos(pos, this);

        this.entity.position = this.trackCur.GetPosition(this.trackPos);

        this.trackVel *= 0.98;
    }

    Move() {

    }
}


abstract class Track {

    public start: Vector;
    public end: Vector;

    public prev: Track | undefined;
    public next: Track | undefined;

    constructor(start: Vector, end: Vector) {
        this.start = start;
        this.end = end;
    }

    CheckPos(amount: number, train: Train): number {
        
        if (amount >= 0) {
            if (amount <= 1) {
                return amount;
            } else {
                if (this.next) {
                    train.trackCur = this.next;
                    return Calc.Loop(amount, 0, 1);
                }
                else {
                    train.trackVel = 0;
                    return 1;
                }
            }
        } else {
            if (this.prev) {
                train.trackCur = this.prev;
                return Calc.Loop(amount, 0, 1);
            }
            else {
                train.trackVel = 0;
                return 0;
            }
        }
    }

    static Link(track1: Track, track2: Track): void {
        track1.next = track2;
        track2.prev = track1;
    }

    abstract GetPosition(amount: number): Vector;
}

class Straight extends Track {

    GetPosition(amount: number): Vector {
        return Vector.Lerp(this.start, this.end, amount);
    }
}

class Curve extends Track {

    private startControl: Vector;
    private endControl: Vector;

    constructor(start: Vector, end: Vector, startControl: Vector, endControl: Vector) {
        super(start, end);
        this.startControl = startControl;
        this.endControl = endControl;
    }

    GetPosition(): Vector {
        return Vector.zero;
    }
}