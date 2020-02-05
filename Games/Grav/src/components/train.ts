import { Component } from '../entity';
import { stage, resolution } from '../app';
import { Vector } from '../utilites';
import { Graphics } from '../aliases';

export default class Train extends Component {

    private graphics: PIXI.Graphics = new Graphics();

    Start() {
        this.graphics.beginFill(0x888888)
            .drawCircle(0, 0, 100)
            .endFill();
        this
    }

    Update(delta: number, time: number) {

    }
}