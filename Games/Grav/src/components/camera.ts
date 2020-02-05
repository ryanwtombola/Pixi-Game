import { Component } from '../entity';
import { stage, resolution } from '../app';
import { mouse } from '../input';

export default class Camera extends Component {

    public zoom: number = 1;
    private zoomSpeed: number = 0.001;

    Start(): void {

    }

    Update(delta: number): void {

        this.zoom *= 1 + mouse.wheel * this.zoomSpeed * delta;

        stage.pivot = this.entity.position;
        stage.position = resolution.DivideNum(2);

        stage.scale.set(1 / this.zoom);
    }
}