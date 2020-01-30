import Entity from '../entity';
import { app } from '../app';
import { Graphics } from '../aliases';
import { Calc, Vector } from '../utilites';
import { left, right, up, down, mouse } from '../input';

export default class Camera extends Entity {

    public position: Vector = Vector.zero;
    public speed: number = 20;

    public zoom: number = 1;
    public zoomSpeed: number = 0.001;

    public graphics: any;

    Start(): void {
        this.graphics = new Graphics();
        this.graphics.beginFill(0xbbbbbb)
            .lineStyle(10, 0x666666, 1, 0)
            .moveTo(0, 0)
            .lineTo(500, 0)
            .lineTo(0, 500)
            .lineTo(0, 0)
            .moveTo(500, 0)
            .lineTo(500, 500)
            .lineTo(0, 500)
            .lineTo(500, 0)
            .endFill()

        this.graphics.x = 100;
        this.graphics.y = 10;
        app.stage.addChild(this.graphics);

    }

    Update(delta: number): void {
        const step = this.speed * this.zoom * delta;
        if (right.isDown && left.isUp) {
            this.position.x += step;
        } else if (left.isDown && right.isUp) {
            this.position.x -= step;
        }

        if (down.isDown && up.isUp) {
            this.position.y += step;
        } else if (up.isDown && down.isUp) {
            this.position.y -= step;
        }

        this.zoom *= 1 + mouse.wheel * this.zoomSpeed * delta;

        app.stage.pivot.x = this.position.x - (innerWidth / 2) * this.zoom;
        app.stage.pivot.y = this.position.y - (innerHeight / 2) * this.zoom;

        app.stage.scale.set(1 / this.zoom);

        console.log(mouse.screenPosition.toLocal(app.stage))
        // console.log()
    }
}