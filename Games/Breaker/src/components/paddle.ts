import { Component } from '../entity';
import { stage } from '../app';
import { left, right, up, down } from '../input';
import { Vector } from '../utilites';
import Camera from './camera';
import { Graphics } from '../aliases';

export default class Movement extends Component {

    private speed: number = 20;

    private graphics: PIXI.Graphics = new Graphics();

    private camera: Camera = this.entity.components.filter((comp: Component) => comp instanceof Camera)[0] as Camera;

    Start() {

        this.graphics.beginFill(0xbbbbbb)
            .lineStyle(10, 0x666666, 1, 0)
            .moveTo(0, 0)
            .lineTo(500, 0)
            .lineTo(500, 500)
            .lineTo(0, 500)
            .lineTo(0, 0)
            .endFill()

        this.graphics.position = Vector.zero;
        stage.addChild(this.graphics);
    }

    Update(delta: number) {

        const step = this.speed * this.camera.zoom * delta;
        if (right.isDown && left.isUp) {
            this.entity.position.x += step;
        } else if (left.isDown && right.isUp) {
            this.entity.position.x -= step;
        }

        if (down.isDown && up.isUp) {
            this.entity.position.y += step;
        } else if (up.isDown && down.isUp) {
            this.entity.position.y -= step;
        }
    }

}