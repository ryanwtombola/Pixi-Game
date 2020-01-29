import Entity from '../entity';
import { app } from '../app';
import { Graphics } from '../aliases';
import { Calc } from '../utilites';

export default class Player extends Entity {

    public graphics: any;

    Start(): void {
        this.graphics = new Graphics();
    }

    Update(delta: number, time: number): void {
    }
}